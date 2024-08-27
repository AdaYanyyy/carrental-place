# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models
from django.utils import timezone
from django.contrib.auth.base_user import AbstractBaseUser


class Account(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    username=models.CharField(max_length=16,unique=True)
    phone = models.CharField(max_length=11)
    email = models.CharField(max_length=255)
    carType = models.CharField(max_length=16)
    carCode = models.CharField(max_length=16)
    password = models.CharField(max_length=255)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    def __str__(self):
        return str(self.id)
    @property
    def is_authenticated(self):
        return True
    @property
    def is_anonymous(self):
        return False

class VerificationCode(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=255)
    code = models.CharField(max_length=6)
    action = models.CharField(max_length=16)
    generate_time = models.DateTimeField(auto_now_add=True)

    # verification code is valid for 5 minutes
    def is_valid(self):
        return (timezone.now() - self.generate_time).seconds < 300