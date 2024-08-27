from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from login.models import Account
from person.models import ParkingSpace, Order, UserCoupons
from person.serializers import AccountSerializer, ParkingSpaceSerializer, ParkingSpaceDetailSerializer, OrderSerializer, \
    OccupySerializer, UserCouponsSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from django.db.models import Sum


@method_decorator(csrf_exempt, name='dispatch')
class ProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(responses={200: AccountSerializer}, operation_description='获取用户信息')
    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = AccountSerializer(user)
        return Response(serializer.data)

    @swagger_auto_schema(request_body=AccountSerializer, operation_description='修改用户信息')
    def put(self, request, *args, **kwargs):
        user = request.user
        serializer = AccountSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ParkingSpaceView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(responses={200: ParkingSpaceSerializer}, operation_description='获取车位信息')
    def get(self, request, *args, **kwargs):  # 获取车位信息
        user = request.user
        self.update_income(user)
        parking_space = ParkingSpace.objects.filter(owner=user).order_by('id')
        serializer = ParkingSpaceSerializer(parking_space, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=ParkingSpaceSerializer, operation_description='添加新车位')
    def post(self, request, *args, **kwargs):  # 添加新车位
        user = request.user
        serializer = ParkingSpaceDetailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update_income(self, user):
        for parking_space in ParkingSpace.objects.filter(owner=user):
            total_income = Order.objects.filter(
                parking_space=parking_space, 
                status='Completed'
            ).aggregate(Sum('income'))['income__sum'] or 0
            parking_space.income = total_income
            parking_space.save(update_fields=['income'])

@method_decorator(csrf_exempt, name='dispatch')
class ParkingSpaceDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(responses={200: ParkingSpaceSerializer}, operation_description='获取车位信息')
    def get(self, request, id, *args, **kwargs):
        user = request.user
        parking_space = ParkingSpace.objects.get(id=id)
        serializer = ParkingSpaceSerializer(parking_space)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=ParkingSpaceSerializer, operation_description='修改车位信息')
    def patch(self, request, id, *args, **kwargs):
        user = request.user
        parking_space = ParkingSpace.objects.get(id=id, owner=user)
        serializer = ParkingSpaceSerializer(parking_space, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(operation_description='删除车位')
    def delete(self, request, id, *args, **kwargs):
        user = request.user
        parking_space = ParkingSpace.objects.get(id=id, owner=user)
        parking_space.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(csrf_exempt, name='dispatch')
class UserHistoryOrderView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(responses={200: OrderSerializer}, operation_description='获取历史订单')
    def get(self, request, *args, **kwargs):
        user = request.user
        order = Order.objects.filter(consumer=user, status='Completed').order_by('end_time')
        serializer = OrderSerializer(order, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class UserCurrentOrderView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(responses={200: OrderSerializer}, operation_description='获取当前订单')
    def get(self, request, *args, **kwargs):
        user = request.user
        order = Order.objects.filter(consumer=user, status='Booked').order_by('end_time')
        serializer = OrderSerializer(order, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CancelOrderView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(operation_description='取消订单')
    def post(self, request, id, *args, **kwargs):
        user = request.user
        order = Order.objects.get(id=id, consumer=user)
        order.status = 'Cancelled'
        order.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

@method_decorator(csrf_exempt, name='dispatch')
class ParkingSpaceHistoryOrderView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(responses={200: OrderSerializer}, operation_description='获取历史订单')
    def get(self, request, id, *args, **kwargs):
        order = Order.objects.filter(parking_space=id, status='Completed').order_by('end_time')
        serializer = OrderSerializer(order, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ParkingSpaceCurrentOrderView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(responses={200: OrderSerializer}, operation_description='获取当前订单')
    def get(self, request, id, *args, **kwargs):
        order = Order.objects.filter(parking_space=id, status='Booked').order_by('end_time')
        serializer = OrderSerializer(order, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ListingView(APIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(responses={200: ParkingSpaceSerializer}, operation_description='获取车位列表')
    def get(self, request, *args, **kwargs):
        parking_space = ParkingSpace.objects.filter().order_by('id')
        serializer = ParkingSpaceSerializer(parking_space, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ListingDetailView(APIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(responses={200: ParkingSpaceSerializer}, operation_description='获取车位具体信息')
    def get(self, request, id, *args, **kwargs):
        parking_space = ParkingSpace.objects.get(id=id)
        parking_space_serializer = ParkingSpaceSerializer(parking_space)
        booked_order = Order.objects.filter(parking_space=parking_space, status='Booked')
        booked_order_serializer = OccupySerializer(booked_order, many=True)

        response_data = {
            'parking_space': parking_space_serializer.data,
            'booked_order': booked_order_serializer.data
        }
        return Response(response_data, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class PaymentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(responses={200: UserCouponsSerializer}, operation_description='获取优惠券')
    def get(self, request, *args, **kwargs):
        user = request.user
        coupons = UserCoupons.objects.filter(owner_id=user, status='unused')
        serializer = UserCouponsSerializer(coupons, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=OrderSerializer, operation_description='创建订单')
    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(consumer=user, status='Booked')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)