from django.urls import path
from .views import ReadmeView,LoginView, LogoutView, RegisterView, MyQueryView, ResetPasswordView, VerificationCodeView

urlpatterns = [
    # ... other urlpatterns ...
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/MyQueryView/', MyQueryView.as_view(), name='MyQueryView'),
    path('api/reset_password/', ResetPasswordView.as_view(), name='reset_password'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/verify/', VerificationCodeView.as_view(), name='verify'),
    path('api/ReadmeView/', ReadmeView.as_view(), name='ReadmeView'),
]