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
# from rest_framework import serializers
# from service.models import Inquiry
#
# class InquirySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Inquiry
#         fields = '__all__'  # 序列化所有字段，您也可以指定一个字段列表
