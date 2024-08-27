from rest_framework import serializers
from .models import Account

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username', 'phone', 'email', 'carType', 'carCode']
        extra_kwargs = {'password': {'write_only': True}}
