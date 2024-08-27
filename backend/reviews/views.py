from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Review
from person.models import ParkingSpace, Order
from login.models import Account
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]
    # @swagger_auto_schema(
    #     request_body=openapi.Schema(
    #         type=openapi.TYPE_OBJECT,
    #         required=['user_id', 'order_id', 'parking_space_id', 'rating', 'comment'],
    #         properties={
    #             'user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='User ID'),
    #             'order_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Order ID'),
    #             'parking_space_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Parking Space ID'),
    #             'rating': openapi.Schema(type=openapi.TYPE_NUMBER, description='Rating'),
    #             'comment': openapi.Schema(type=openapi.TYPE_STRING, description='Comment'),
    #         }
    #     ),
    #     responses={
    #         status.HTTP_201_CREATED: openapi.Response(description='Review created successfully'),
    #         status.HTTP_400_BAD_REQUEST: openapi.Response(description='Invalid data')
    #     }
    # )
    # def post(self, request, *args, **kwargs):
    #     user_id = request.data.get('user_id')
    #     order_id = request.data.get('order_id')
    #     parking_space_id = request.data.get('parking_space_id')
    #     rating = request.data.get('rating')
    #     comment = request.data.get('comment')
    #     try:
    #         user = Account.objects.get(id=user_id)
    #         order = Order.objects.get(id=order_id)
    #         parking_space = ParkingSpace.objects.get(id=parking_space_id)
    #
    #         review = Review.objects.create(
    #             user=user,
    #             order=order,
    #             parking_space=parking_space,
    #             rating=rating,
    #             comment=comment
    #         )
    #         return Response({'message': 'Review created successfully', 'review_id': review.id}, status=status.HTTP_201_CREATED)
    #     except (Account.DoesNotExist, Order.DoesNotExist, ParkingSpace.DoesNotExist) as e:
    #         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    from rest_framework.permissions import IsAuthenticated

    # @swagger_auto_schema(
    #     request_body=openapi.Schema(
    #         type=openapi.TYPE_OBJECT,
    #         required=['order_id', 'parking_space_id', 'rating', 'comment'],
    #         properties={
    #             'order_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Order ID'),
    #             'parking_space_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Parking Space ID'),
    #             'rating': openapi.Schema(type=openapi.TYPE_NUMBER, description='Rating'),
    #             'comment': openapi.Schema(type=openapi.TYPE_STRING, description='Comment'),
    #         }
    #     ),
    #     responses={
    #         status.HTTP_201_CREATED: openapi.Response(description='Review created successfully'),
    #         status.HTTP_400_BAD_REQUEST: openapi.Response(description='Invalid data')
    #     }
    # )
    # def post(self, request, *args, **kwargs):
    #     order_id = request.data.get('order_id')
    #     parking_space_id = request.data.get('parking_space_id')
    #     rating = request.data.get('rating')
    #     comment = request.data.get('comment')
    #
    #     try:
    #         order = Order.objects.get(id=order_id)
    #         parking_space = ParkingSpace.objects.get(id=parking_space_id)
    #
    #         review = Review.objects.create(
    #             user=request.user,
    #             order=order,
    #             parking_space=parking_space,
    #             rating=rating,
    #             comment=comment
    #         )
    #         return Response({'message': 'Review created successfully', 'review_id': review.id},
    #                         status=status.HTTP_201_CREATED)
    #     except (Order.DoesNotExist, ParkingSpace.DoesNotExist) as e:
    #         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['order_id', 'rating', 'comment'],
            properties={
                'order_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Order ID'),
                'rating': openapi.Schema(type=openapi.TYPE_NUMBER, description='Rating'),
                'comment': openapi.Schema(type=openapi.TYPE_STRING, description='Comment'),
            }
        ),
        responses={
            status.HTTP_201_CREATED: openapi.Response(description='Review created successfully'),
            status.HTTP_400_BAD_REQUEST: openapi.Response(description='Invalid data')
        }
    )
    def post(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment')

        try:
            order = Order.objects.get(id=order_id)
            parking_space = order.parking_space

            review = Review.objects.create(
                user=request.user,
                order=order,
                parking_space=parking_space,
                rating=rating,
                comment=comment
            )
            return Response({'message': 'Review created successfully', 'review_id': review.id},
                            status=status.HTTP_201_CREATED)
        except Order.DoesNotExist as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['review_id', 'rating', 'comment'],
            properties={
                'review_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Review ID'),
                'rating': openapi.Schema(type=openapi.TYPE_NUMBER, description='New Rating'),
                'comment': openapi.Schema(type=openapi.TYPE_STRING, description='New Comment'),
            }
        ),
        responses={
            status.HTTP_200_OK: openapi.Response(description='Review updated successfully'),
            status.HTTP_400_BAD_REQUEST: openapi.Response(description='Invalid data'),
            status.HTTP_404_NOT_FOUND: openapi.Response(description='Review not found')
        }
    )
    def put(self, request, *args, **kwargs):
        review_id = request.data.get('review_id')
        new_rating = request.data.get('rating')
        new_comment = request.data.get('comment')

        if not all([review_id, new_rating, new_comment]):
            return Response({'error': 'Review ID, new rating, and new comment are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = Review.objects.get(id=review_id)
            review.rating = new_rating
            review.comment = new_comment
            review.save()
            return Response({'message': 'Review updated successfully', 'review_id': review.id}, status=status.HTTP_200_OK)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found.'}, status=status.HTTP_404_NOT_FOUND)
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('order_id', in_=openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description='Order ID')
        ],
        responses={
            status.HTTP_200_OK: openapi.Response(description='Review retrieved successfully'),
            status.HTTP_404_NOT_FOUND: openapi.Response(description='Review not found')
        }
    )
    def get(self, request, *args, **kwargs):
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({'error': 'Order ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reviews = Review.objects.filter(order_id=order_id)
            if not reviews.exists():
                return Response({'error': 'No reviews found for this order.'}, status=status.HTTP_404_NOT_FOUND)

            reviews_data = [{
                'review_id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'user_id': review.user.id,
                'parking_space_id': review.parking_space.id
            } for review in reviews]
            return Response(reviews_data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
class ReviewViewparking(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('parking_space_id', in_=openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description='Parking Space ID')
        ],
        responses={
            status.HTTP_200_OK: openapi.Response(description='Reviews retrieved successfully'),
            status.HTTP_404_NOT_FOUND: openapi.Response(description='No reviews found for this parking space')
        }
    )
    def get(self, request, *args, **kwargs):
        parking_space_id = request.query_params.get('parking_space_id')
        if not parking_space_id:
            return Response({'error': 'Parking space ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        reviews = Review.objects.filter(parking_space_id=parking_space_id)
        if not reviews.exists():
            return Response({'error': 'No reviews found for this parking space.'}, status=status.HTTP_404_NOT_FOUND)

        reviews_data = [{
            'review_id': review.id,
            'rating': review.rating,
            'comment': review.comment,
            'user_id': review.user.id,
            'order_id': review.order.id
        } for review in reviews]

        return Response(reviews_data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['order_id', 'rating', 'comment'],
            properties={
                'order_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Order ID'),
                'rating': openapi.Schema(type=openapi.TYPE_NUMBER, description='New Rating'),
                'comment': openapi.Schema(type=openapi.TYPE_STRING, description='New Comment'),
            }
        ),
        responses={
            status.HTTP_200_OK: openapi.Response(description='Review updated successfully'),
            status.HTTP_400_BAD_REQUEST: openapi.Response(description='Invalid data'),
            status.HTTP_404_NOT_FOUND: openapi.Response(description='Review not found for the specified order')
        }
    )
    def put(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        new_rating = request.data.get('rating')
        new_comment = request.data.get('comment')

        if not all([order_id, new_rating, new_comment]):
            return Response({'error': 'Order ID, new rating, and new comment are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = Review.objects.get(order_id=order_id)
            review.rating = new_rating
            review.comment = new_comment
            review.save()
            return Response({'message': 'Review updated successfully'}, status=status.HTTP_200_OK)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found for the specified order'}, status=status.HTTP_404_NOT_FOUND)