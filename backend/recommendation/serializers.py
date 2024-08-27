from rest_framework import serializers
from login.models import Account
from person.models import ParkingSpace, Order
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
        exclude = ['owner']


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

    def get_total_price(self, obj):
        total_hours = (obj.end_time - obj.start_time).seconds / 3600
        days, remain_hours = divmod(total_hours, 24)
        day_price = obj.parking_space.day_price
        hour_price = obj.parking_space.hour_price
        total_price = days * day_price + math.ceil(remain_hours) * hour_price
        return total_price

