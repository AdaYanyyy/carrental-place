from django.db import models
from login.models import Account

# Create your models here.
class ParkingSpace(models.Model):
    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='parking_space')  # 拥有者
    location = models.CharField(max_length=255) # 位置
    img_path = models.TextField(blank=True, null=True)    # 图片路径
    day_price = models.FloatField() # 日租价格
    hour_price = models.FloatField()    # 小时价格
    description = models.TextField(null=True, blank=True)   # 描述
    start_time = models.DateTimeField(null=True, blank=True) # 开始时间
    end_time = models.DateTimeField(null=True, blank=True)   # 结束时间
    rate = models.FloatField(default=0)   # 评分
    car_type = models.CharField(max_length=255)  # 可停的车型
    income = models.FloatField(default=0)    # 总收入

class Order(models.Model):
    id = models.AutoField(primary_key=True)
    consumer = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='order')  # 消费者
    car_type = models.CharField(max_length=255)  # 车型
    car_code = models.CharField(max_length=255)  # 车牌号
    parking_space = models.ForeignKey(ParkingSpace, on_delete=models.CASCADE, related_name='order')  # 停车位
    start_time = models.DateTimeField() # 开始时间
    end_time = models.DateTimeField()   # 结束时间
    status = models.CharField(max_length=255)  # 状态
    income = models.FloatField(default=0) # 收入

class UserCoupons(models.Model):
    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='coupons')  # 拥有者
    discount = models.FloatField()  # 折扣
    start_time = models.DateTimeField() # 开始时间
    end_time = models.DateTimeField()   # 结束时间
    status = models.CharField(max_length=255)  # 状态
