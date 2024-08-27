from django.db import models
from person.models import ParkingSpace, Order  # 假设您的车位和订单模型位于名为parking的app中
from login.models import Account  # 假设用户账户模型位于login app中

class Review(models.Model):
    rating = models.IntegerField()  # 评分
    comment = models.TextField()  # 评价内容
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='reviews')  # 订单
    parking_space = models.ForeignKey(ParkingSpace, on_delete=models.CASCADE, related_name='reviews')  # 车位
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='reviews')  # 用户

    def __str__(self):
        return f'Review {self.id} by {self.user}'
