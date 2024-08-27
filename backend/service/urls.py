from django.urls import path
from .views import InquiryView

urlpatterns = [
    path('inquiries/', InquiryView.as_view(), name='inquiry-list-create'),
]
