from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from person.models import ParkingSpace, Order
from login.models import Account
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from .serializers import ParkingSpaceSerializer, OrderSerializer

class UserOrdersRecommendView(APIView):
    @swagger_auto_schema(
        responses={200: openapi.Response('recommendation successfully')}
    )
    def get(self, request, *args, **kwargs):
        # 获取当前登录用户
        current_user = request.user  # 获取当前登录的用户

        # 获取用户的订单
        user_orders = Order.objects.filter(consumer=current_user)
        parking_space_ids = user_orders.values_list('parking_space_id', flat=True)

        # 获取与用户订单相关的停车位信息
        user_parking_spaces = ParkingSpace.objects.filter(id__in=parking_space_ids)
        user_parking_spaces = ParkingSpaceSerializer(user_parking_spaces, many=True).data

        # for ps in user_parking_spaces:
        #     print(ps['location'])
        # return Response({
        #     'user_parking_spaces': user_parking_spaces
        # })
        # 构建用户历史停车位的特征字符串
        user_features = ' '.join([
            f"{ps['location']} {ps['rate']} {ps['car_type']}" for ps in user_parking_spaces
        ])

        # 获取所有停车位的信息
        all_parking_spaces = ParkingSpace.objects.all()

        # 构建所有停车位的特征向量
        all_features = [
            f"{ps.location} {ps.rate} {ps.car_type}"for ps in all_parking_spaces
        ]

        # 使用TF-IDF向量化特征
        tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 3), stop_words='english')
        tfidf_matrix_all = tfidf_vectorizer.fit_transform(all_features)
        user_tfidf_vector = tfidf_vectorizer.transform([user_features])

        # 计算用户偏好与所有停车位之间的余弦相似度
        cosine_sim = linear_kernel(user_tfidf_vector, tfidf_matrix_all)

        # 获取与用户偏好最相似的五个停车位
        top_indices = cosine_sim[0].argsort()[-7:-1][::-1]  # 排除自身，选出最相似的6个
        recommended_parking_spaces = [all_parking_spaces[int(i)] for i in top_indices]

        # 序列化推荐的停车位
        recommended_parking_spaces_serialized = ParkingSpaceSerializer(recommended_parking_spaces, many=True)

        return Response(recommended_parking_spaces_serialized.data, status=status.HTTP_200_OK)
class TopRatedParkingSpacesView(APIView):
    permission_classes = [AllowAny]  # 允许所有用户访问
    @swagger_auto_schema(
        responses={200: openapi.Response("Successful Response")}
    )
    def get(self, request, *args, **kwargs):
        # 获取评分最高的六个停车位
        top_rated_parkings = ParkingSpace.objects.order_by('-rate')[:6]

        # 使用序列化器序列化数据
        serializer = ParkingSpaceSerializer(top_rated_parkings, many=True)

        # 返回序列化的数据
        return Response(serializer.data, status=status.HTTP_200_OK)