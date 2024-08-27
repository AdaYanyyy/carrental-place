from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import  Sum
from rest_framework_simplejwt.tokens import AccessToken
from django.core.cache import cache
from login.models import Account
from parking.serializers import ReviewSerializer
from person.models import ParkingSpace, Order,Account
from person.serializers import AccountSerializer, ParkingSpaceSerializer, OrderSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone
from reviews.models import Review
from service.models import Inquiry


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)  # 允许所有用户访问登录接口

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'password'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description="username"),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description="password", format=openapi.FORMAT_PASSWORD),
            }
        ),
        responses={
            200: openapi.Response(
                description="login successful",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'token': openapi.Schema(type=openapi.TYPE_STRING, description="JWT token"),
                    }
                )
            ),
            400: openapi.Response(description="bad request"),
            401: openapi.Response(description="no auth"),
            403: openapi.Response(description="account locked"),
        }
    )
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # 锁定逻辑
        lock_key = f"lock_{username}"
        if cache.get(lock_key):
            return Response({'error': 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'}, status=status.HTTP_403_FORBIDDEN)

        user = Account.objects.filter(username=username).first()
        if user and user.password == password:
            token = AccessToken.for_user(user)  # 生成token

            # 成功登录，重置失败计数
            cache.delete(f"login_attempts_{username}")
            return Response({'token': str(token)}, status=status.HTTP_200_OK)
        else:
            attempts = cache.get(f"login_attempts_{username}", 0)
            attempts += 1
            cache.set(f"login_attempts_{username}", attempts, timeout=60)  # 1分钟内的尝试次数

            if attempts >= 3:
                cache.set(lock_key, True, timeout=10)  # 锁定账户10秒
                return Response({'error': 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'}, status=status.HTTP_403_FORBIDDEN)

            return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
#车位管理
class ParkingSpaceList(APIView):
    permission_classes = [IsAdminUser]
    """
    List all parking spots, or create a new parking spot.
    """

    @swagger_auto_schema(
        responses={200: ParkingSpaceSerializer(many=True)},
        operation_description="Retrieve a list of all parking spots."
    )
    def get(self, request, format=None):
        spots = ParkingSpace.objects.all()
        serializer = ParkingSpaceSerializer(spots, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=ParkingSpaceSerializer(),
        responses={
            201: ParkingSpaceSerializer(),
            400: 'Bad Request'
        },
        operation_description="Create a new parking spot."
    )
    def post(self, request, format=None):
        serializer = ParkingSpaceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class  ParkingSpaceDetail(APIView):
    permission_classes = [IsAdminUser]
    """
    Retrieve, update or delete a parking spot instance.
    """
    #get_object 作为 其他HTTP方法内部被调用，用于获取对象实例
    def get_object(self, pk):
        try:
            return ParkingSpace.objects.get(pk=pk)
        except ParkingSpace.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        responses={200: ParkingSpaceSerializer()},
        operation_description="Retrieve details of a specific parking spot."
    )
    def get(self, request, pk, format=None):
        spot = self.get_object(pk)
        if isinstance(spot, Response):
            return spot
        serializer = ParkingSpaceSerializer(spot)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=ParkingSpaceSerializer(),
        responses={
            200: ParkingSpaceSerializer(),
            400: 'Bad Request'
        },
        operation_description="Update a parking spot."
    )
    def put(self, request, pk, format=None):
        spot = self.get_object(pk)
        if isinstance(spot, Response):
            return spot
        serializer = ParkingSpaceSerializer(spot, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @swagger_auto_schema(
        responses={204: 'No Content'},
        operation_description="Delete a parking spot."
    )
    def delete(self, request, pk, format=None):
        spot = self.get_object(pk)
        if isinstance(spot, Response):
            return spot
        spot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)




#订单管理
class OrderList(APIView):
    permission_classes = [IsAdminUser]
    """
    List all Order , or create a new Order.
    """

    @swagger_auto_schema(
        responses={200: OrderSerializer(many=True)},
        operation_description="Retrieve a list of all orders."
    )
    def get(self, request, format=None):
        orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=OrderSerializer(),
        responses={
            201: OrderSerializer(),
            400: 'Bad Request'
        },
        operation_description="Create a new order."
    )
    def post(self, request, format=None):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class  OrderDetail(APIView):
    permission_classes = [IsAdminUser]
    """
    Retrieve, update or delete a order  instance.
    """
    #get_object 作为 其他HTTP方法内部被调用，用于获取对象实例
    def get_object(self, pk):
        try:
            return Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        responses={200: OrderSerializer()},
        operation_description="Retrieve details of a specific order."
    )
    def get(self, request, pk, format=None):
        order = self.get_object(pk)
        if isinstance(order, Response):
            return order
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=OrderSerializer(),
        responses={
            200: OrderSerializer(),
            400: 'Bad Request'
        },
        operation_description="Update a order detail."
    )
    def put(self, request, pk, format=None):
        order = self.get_object(pk)
        if isinstance(order, Response):
            return order
        serializer = OrderSerializer(order, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @swagger_auto_schema(
        responses={204: 'No Content'},
        operation_description="Delete a order."
    )
    def delete(self, request, pk, format=None):
        order = self.get_object(pk)
        if isinstance(order, Response):
            return order
        # 获取与该订单关联的所有评价并删除
        reviews = Review.objects.filter(order=order)
        reviews.delete()
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


#用户管理
class AccountList(APIView):
    permission_classes = [IsAdminUser]
    """
    List all Account , or create a newAccount.
    """

    @swagger_auto_schema(
        responses={200: AccountSerializer(many=True)},
        operation_description="Retrieve a list of all account."
    )
    def get(self, request, format=None):
        accounts = Account.objects.filter(is_staff=False)
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=AccountSerializer(),
        responses={
            201: AccountSerializer(),
            400: 'Bad Request'
        },
        operation_description="Create a new Account account."
    )
    def post(self, request, format=None):
        request.data['is_staff'] = False
        serializer = AccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class  AccountDetail(APIView):
    permission_classes = [IsAdminUser]
    """
    Retrieve, update or delete a account instance.
    """
    #get_object 作为 其他HTTP方法内部被调用，用于获取对象实例
    def get_object(self, pk):
        try:
            return Account.objects.get(pk=pk)
        except Account.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        responses={200: AccountSerializer()},
        operation_description="Retrieve details of a specific account account."
    )
    def get(self, request, pk, format=None):
        account = self.get_object(pk)
        if isinstance(account, Response):
            return account
        if account.is_staff:
            return Response({'error': 'Cannot get an admin user.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AccountSerializer(account)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=AccountSerializer(),
        responses={
            200: AccountSerializer(),
            400: 'Bad Request'
        },
        operation_description="Update a account account."
    )
    def put(self, request, pk, format=None):
        account = self.get_object(pk)
        if isinstance(account, Response):
            return account
        if account.is_staff:
            return Response({'error': 'Cannot modify an admin user.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AccountSerializer(account, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @swagger_auto_schema(
        responses={204: 'No Content'},
        operation_description="Delete a account ."
    )
    def delete(self, request, pk, format=None):
        account = self.get_object(pk)
        if isinstance(account, Response):
            return account
        if account.is_staff:
            return Response({'error': 'Cannot delete an admin user.'}, status=status.HTTP_403_FORBIDDEN)

        account.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



#数据统计
class ParkingStatisticsView(APIView):
    permission_classes = [IsAdminUser]
    @swagger_auto_schema(
        # method='get',
        operation_description="Obtain parking data statistics",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'total_spaces': openapi.Schema(type=openapi.TYPE_INTEGER, description="total spaces"),
                    'occupied_spaces': openapi.Schema(type=openapi.TYPE_INTEGER, description="occupied spaces"),
                    'empty_spaces': openapi.Schema(type=openapi.TYPE_INTEGER, description="empty spaces"),
                    'pending_spaces_ratio': openapi.Schema(type=openapi.TYPE_NUMBER, format=openapi.FORMAT_FLOAT,
                                                           description="pending spaces ratio"),
                    'total_service_fee': openapi.Schema(type=openapi.TYPE_NUMBER, format=openapi.FORMAT_FLOAT,
                                                        description="total service fee"),
                },
            )
        },
    )
    def get(self, request, *args, **kwargs):
        total_spaces = ParkingSpace.objects.count()
        occupied_spaces = ParkingSpace.objects.filter().count()
        empty_spaces = total_spaces - occupied_spaces
        pending_orders = Order.objects.filter(status='pending').count()#注意此处订单表的状态
        # 计算等待付款车位数量占比
        pending_spaces_ratio = (pending_orders / total_spaces) * 100 if total_spaces > 0 else 0
        # 暂定每个订单的服务费就是停车位的日租价格
        total_service_fee = Order.objects.aggregate(Sum('parking_space__day_price'))[
                                'parking_space__day_price__sum'] or 0

        statistics = {
            'total_spaces': total_spaces,
            'occupied_spaces': occupied_spaces,
            'empty_spaces': empty_spaces,
            'pending_spaces_ratio': pending_spaces_ratio,
            'total_service_fee': total_service_fee
        }

        return Response(statistics)

class InquiryView(APIView):
    permission_classes = [IsAdminUser]
    @swagger_auto_schema(
        # method='get',
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True, description="User's ID")
        ],
        responses={200: openapi.Response('Inquiries retrieved successfully')}
    )
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'User ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        inquiries = Inquiry.objects.filter(user__id=user_id)
        if inquiries.exists():
            data = [{
                'question': inquiry.question,
                'answer': inquiry.answer,
                'user_id': inquiry.user.id,
                'created_at': inquiry.created_at,
                'updated_at': inquiry.updated_at
            } for inquiry in inquiries]
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No inquiries found for the given user ID.'}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['answer'],
            properties={
                'answer': openapi.Schema(type=openapi.TYPE_STRING)
            },
        ),
        responses={200: 'Inquiry updated successfully'}
    )
    def put(self, request, pk):
        try:
            inquiry = Inquiry.objects.get(pk=pk)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)

        answer = request.data.get('answer')
        if not answer:
            return Response({'error': 'Answer is required.'}, status=status.HTTP_400_BAD_REQUEST)

        inquiry.answer = answer
        inquiry.updated_at = timezone.now()  # Explicitly set updated_at to current time
        inquiry.save()

        return Response({'message': 'Inquiry updated successfully'}, status=status.HTTP_200_OK)
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('inquiry_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True, description="Inquiry ID"),
            openapi.Parameter('answer', openapi.IN_QUERY, type=openapi.TYPE_STRING, required=True, description="Updated answer")
        ],
        responses={200: openapi.Response('Inquiry updated successfully')}
    )
    def put(self, request):
        inquiry_id = request.query_params.get('inquiry_id')
        new_answer = request.query_params.get('answer')

        if not inquiry_id or not new_answer:
            return Response({'error': 'Inquiry ID and new answer are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            inquiry = Inquiry.objects.get(id=inquiry_id)
            inquiry.answer = new_answer
            inquiry.updated_at = timezone.now()
            inquiry.save()
            return Response({'message': 'Inquiry updated successfully.'}, status=status.HTTP_200_OK)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('inquiry_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True, description="Inquiry ID to delete")
        ],
        responses={200: 'Inquiry deleted successfully', 404: 'Inquiry not found'}
    )
    def delete(self, request):
        inquiry_id = request.query_params.get('inquiry_id')
        if not inquiry_id:
            return Response({'error': 'Inquiry ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            inquiry = Inquiry.objects.get(id=inquiry_id)
            inquiry.delete()
            return Response({'message': 'Inquiry deleted successfully.'}, status=status.HTTP_200_OK)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)

class AllInquiriesView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        responses={200: openapi.Response('All inquiries retrieved successfully')}
    )
    def get(self, request):
        inquiries = Inquiry.objects.all()
        if inquiries.exists():
            data = [{
                'id': inquiry.id,
                'question': inquiry.question,
                'answer': inquiry.answer,
                'user_id': inquiry.user.id,
                'created_at': inquiry.created_at,
                'updated_at': inquiry.updated_at
            } for inquiry in inquiries]
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No inquiries found.'}, status=status.HTTP_404_NOT_FOUND)





class UserOrdersView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', in_=openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description='User ID')
        ],
        responses={
            status.HTTP_200_OK: openapi.Response(description='Orders retrieved successfully'),
            status.HTTP_400_BAD_REQUEST: openapi.Response(description='Invalid request'),
            status.HTTP_404_NOT_FOUND: openapi.Response(description='No orders found for the user')
        }
    )
    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'User ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Account.objects.get(id=user_id)
        except Account.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        orders = Order.objects.filter(consumer=user)
        if not orders:
            return Response({'error': 'No orders found for this user.'}, status=status.HTTP_404_NOT_FOUND)

        orders_data = [{
            'order_id': order.id,
            'car_type': order.car_type,
            'car_code': order.car_code,
            'parking_space_id': order.parking_space.id,
            'start_time': order.start_time.isoformat(),
            'end_time': order.end_time.isoformat(),
            'status': order.status
        } for order in orders]

        return Response(orders_data, status=status.HTTP_200_OK)


class UserParkingSpacesView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', in_=openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description="User's ID")
        ],
        responses={
            status.HTTP_200_OK: 'Parking spaces retrieved successfully',
            status.HTTP_404_NOT_FOUND: 'Parking spaces not found'
        }
    )
    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'User ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        parking_spaces = ParkingSpace.objects.filter(owner_id=user_id)
        if not parking_spaces.exists():
            return Response({'error': 'No parking spaces found for this user.'}, status=status.HTTP_404_NOT_FOUND)

        data = [{
            'id': parking_space.id,
            'location': parking_space.location,
            'img_path': parking_space.img_path,
            'day_price': parking_space.day_price,
            'hour_price': parking_space.hour_price,
            'rate': parking_space.rate,
            'car_type': parking_space.car_type,
            'income': parking_space.income
        } for parking_space in parking_spaces]

        return Response(data, status=status.HTTP_200_OK)



class OrderReviewView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('order_id', in_=openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description="Order ID")
        ],
        responses={
            200: ReviewSerializer(many=False),
            404: 'Review not found'
        }
    )
    def get(self, request):
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({'error': 'Order ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = Review.objects.get(order_id=order_id)
            serializer = ReviewSerializer(review)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found for this order.'}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('order_id', in_=openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description="Order ID")
        ],
        responses={
            204: 'Review deleted successfully',
            404: 'Review not found'
        }
    )
    def delete(self, request):
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({'error': 'Order ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = Review.objects.get(order_id=order_id)
            review.delete()
            return Response({'message': 'Review deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found for this order.'}, status=status.HTTP_404_NOT_FOUND)



# @method_decorator(csrf_exempt, name='dispatch')
# class ProfileView(APIView):  # 这个没写验证
#     # queryset = Account.objects.all()
#     # serializer_class = AccountSerializer
#     def get(self, request, *args, **kwargs):
#         user = request.user
#         print('user', user)
#         serializer = AccountSerializer(user)
#         return Response(serializer.data)

# @method_decorator(csrf_exempt, name='dispatch')
# class ParkingSpaceView(APIView):
#     # authentication_classes = [JWTAuthentication, ]
#     def get(self, request, offset=0, *args, **kwargs):
#         user = request.user     # 这里按理可以解码出user_id
#         parking_space = ParkingSpace.objects.filter(owner=user).order_by('id')
#         try:
#             offset = int(offset)
#             parking_space = parking_space[offset]
#         except(ValueError, IndexError):
#             return Response({'error': 'No more items'}, status=status.HTTP_400_BAD_REQUEST)
#
#         serializer = ParkingSpaceSerializer(parking_space)
#         return Response(serializer.data)
#
#     def put(self, request, offset=0, *args, **kwargs):
#         user = request.user
#         parking_space = ParkingSpace.objects.filter(owner=user).order_by('id')
#         offset = int(offset)
#         parking_space = parking_space[offset]
#         serializer = ParkingSpaceSerializer(parking_space, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@method_decorator(csrf_exempt, name='dispatch')
class TotalView(APIView):
    permission_classes = [IsAdminUser]
    @swagger_auto_schema(responses={200: openapi.Schema(type=openapi.TYPE_INTEGER)}, operation_description='获取总数')
    def get(self, request, *args, **kwargs):
        total_users = Account.objects.count()
        total_parking_spaces = ParkingSpace.objects.count()
        total_income = Order.objects.filter(status='Completed').aggregate(Sum('income'))['income__sum'] or 0
        booking_income = Order.objects.filter(status='Booked').aggregate(Sum('income'))['income__sum'] or 0
        cancel_count = Order.objects.filter(status='Cancelled').count()
        total_order = Order.objects.count()
        cancel_ratio = (cancel_count / total_order) if total_order > 0 else 0
        monthly_income = Order.objects.filter(
            status='Completed',
            start_time__month=timezone.now().month
        ).aggregate(Sum('income'))['income__sum'] or 0
        # day_income = Order.objects.filter(
        #     status='Completed',
        #     start_time__day=timezone.now().day,
        #     start_time__month=timezone.now().month,
        # ).aggregate(Sum('income'))['income__sum'] or 0
        day_income = Order.objects.filter(
            end_time__day=timezone.now().day,
            end_time__month=timezone.now().month,
        ).aggregate(Sum('income'))['income__sum'] or 0
        response = {
            'total_users': total_users,
            'total_parking_spaces': total_parking_spaces,
            'total_income': total_income,
            'monthly_income': monthly_income,
            'day_income': day_income,
            'booking_income': booking_income,
            'cancel_ratio': cancel_ratio,
        }
        return Response(response, status=status.HTTP_200_OK)