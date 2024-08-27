from django.db import models
from django.utils import timezone
from login.models import Account 

class Inquiry(models.Model):
    id = models.AutoField(primary_key=True)
    question = models.TextField()
    answer = models.TextField(blank=True, null=True)
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question
