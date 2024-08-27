from django.urls import include, path
from django.contrib import admin
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="capstone-project",
        default_version='v1',
        description="capstone-project documentation",
        terms_of_service="https://www.example.com/",
        contact=openapi.Contact(email="capstone-project@example.com"),
        license=openapi.License(name="capstone-project License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # ... your other urls ...
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('auth/', include('login.urls')),   # 验证
    path('user/', include('person.urls')),   # 用户信息
    path('adminparking/', include('parking.urls')),   # 管理员信息
    path('serviceuser/', include('service.urls')),   # 用户客服留言
    path('reviews/', include('reviews.urls')),   # 用户客服留言
    path('recommendation/', include('recommendation.urls')),   # 用户客服留言
]