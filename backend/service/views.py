from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from service.models import Inquiry
# from service.serializers import InquirySerializer  # 确保创建了Inquiry的序列化器
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.backends import TokenBackend
from django.conf import settings
class InquiryView(APIView):
    permission_classes = [IsAuthenticated]
    # @swagger_auto_schema(
    #     request_body=openapi.Schema(
    #         type=openapi.TYPE_OBJECT,
    #         required=['question'],
    #         properties={
    #             'question': openapi.Schema(type=openapi.TYPE_STRING, description="User's question"),
    #             'user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description="User's ID"),
    #         },
    #     )
    # )
    # def post(self, request):
    #     question = request.data.get('question')
    #     user_id = request.data.get('user_id')
    #
    #     if not question:
    #         return Response({'error': 'Question is required.'}, status=status.HTTP_400_BAD_REQUEST)
    #
    #     Inquiry.objects.create(question=question, user_id=user_id)
    #     return Response({'success': 'Question submitted successfully.'}, status=status.HTTP_200_OK)
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['question'],
            properties={
                'question': openapi.Schema(type=openapi.TYPE_STRING, description="User's question"),
            },
        )
    )
    def post(self, request):
        question = request.data.get('question')

        if not question:
            return Response({'error': 'Question is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # 使用经过认证的用户ID创建Inquiry对象
        Inquiry.objects.create(question=question, user=request.user)
        return Response({'success': 'Question submitted successfully.'}, status=status.HTTP_200_OK)
    # @swagger_auto_schema(
    #     # method='get',
    #     manual_parameters=[
    #         openapi.Parameter('user_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True, description="User's ID")
    #     ],
    #     responses={200: openapi.Response('Inquiries retrieved successfully')}
    # )
    # def get(self, request):
    #     user_id = request.query_params.get('user_id')
    #     if not user_id:
    #         return Response({'error': 'User ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
    #
    #     inquiries = Inquiry.objects.filter(user__id=user_id)
    #     if inquiries.exists():
    #         data = [{
    #             'question': inquiry.question,
    #             'answer': inquiry.answer,
    #             'user_id': inquiry.user.id,
    #             'created_at': inquiry.created_at,
    #             'updated_at': inquiry.updated_at
    #         } for inquiry in inquiries]
    #         return Response(data, status=status.HTTP_200_OK)
    #     else:
    #         return Response({'error': 'No inquiries found for the given user ID.'}, status=status.HTTP_404_NOT_FOUND)



    @swagger_auto_schema(
        responses={200: openapi.Response('Inquiries retrieved successfully')}
    )
    def get(self, request):
        user = request.user  # 使用已经通过token验证的用户
        inquiries = Inquiry.objects.filter(user=user)

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
            return Response({'error': 'No inquiries found for the current user.'}, status=status.HTTP_404_NOT_FOUND)

# class GetUserView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request, *args, **kwargs):
#         # 从请求头部获取 token
#         token = request.headers.get('Authorization', '').split(' ')[1]
#         token_backend = TokenBackend(algorithm=settings.SIMPLE_JWT['ALGORITHM'])
#
#         # 解码 token
#         try:
#             valid_data = token_backend.decode(token, verify=True)
#             user_id = valid_data['user_id']
#             return Response({'user_id': user_id})
#         except Exception as e:
#             return Response({'error': str(e)}, status=400)