from rest_framework import serializers
from login.models import Account
from person.models import ParkingSpace, Order

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class ParkingSpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkingSpace
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        

from rest_framework import serializers
from service.models import Inquiry

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ['id', 'question', 'answer', 'user', 'created_at', 'updated_at']

from reviews.models import Review
class ReviewSerializer(serializers.ModelSerializer):
    # 如果需要，可以为关联的模型提供嵌套序列化
    user_id = serializers.ReadOnlyField(source='user.id')
    order_id = serializers.ReadOnlyField(source='order.id')
    parking_space_id = serializers.ReadOnlyField(source='parking_space.id')

    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'user_id', 'order_id', 'parking_space_id']