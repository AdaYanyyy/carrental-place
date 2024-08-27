# reviews/urls.py

from django.urls import path
from .views import ReviewCreateView,ReviewViewparking

urlpatterns = [
    path('create-review/', ReviewCreateView.as_view(), name='create_review'),
    path('ReviewViewparking/', ReviewViewparking.as_view(), name='ReviewViewparking'),
]
