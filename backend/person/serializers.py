from rest_framework import serializers
from login.models import Account
from person.models import ParkingSpace, Order, UserCoupons
import math


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'


class ParkingSpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkingSpace
        fields = '__all__'


class ParkingSpaceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkingSpace
        exclude = ['owner', 'rate', 'income']


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('consumer', 'status')

class OccupySerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['start_time', 'end_time']

class UserCouponsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCoupons
        fields = '__all__'