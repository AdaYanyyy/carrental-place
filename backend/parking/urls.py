from django.urls import path
from .views import OrderReviewView,UserParkingSpacesView,UserOrdersView,AllInquiriesView,InquiryView,ParkingSpaceList, \
    ParkingSpaceDetail, OrderList, OrderDetail, AccountList, AccountDetail, ParkingStatisticsView,LoginView, TotalView

urlpatterns = [
    path('loginauth/', LoginView.as_view(), name='loginauth'),
    path('parking-spaces/', ParkingSpaceList.as_view(), name='parking-space-list'),
    path('parking-spaces/<int:pk>/', ParkingSpaceDetail.as_view(), name='parking-space-detail'),
    path('orders/', OrderList.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetail.as_view(), name='order-detail'),
    path('accounts/', AccountList.as_view(), name='account-list'),
    path('accounts/<int:pk>/', AccountDetail.as_view(), name='account-detail'),
    path('parking-statistics/', ParkingStatisticsView.as_view(), name='parking-statistics'),
    path('InquiryView', InquiryView.as_view(), name='InquiryView'),
    path('AllInquiriesView', AllInquiriesView.as_view(), name='AllInquiriesView'),
    path('UserOrdersView', UserOrdersView.as_view(), name='UserOrdersView'),
    path('UserParkingSpacesView', UserParkingSpacesView.as_view(), name='UserParkingSpacesView'),
    path('OrderReviewView', OrderReviewView.as_view(), name='OrderReviewView'),
    path('TotalView', TotalView.as_view(), name='TotalView'),
    # 其他路由配置...
]
