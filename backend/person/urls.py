from django.urls import path
from person.views import ProfileView, ParkingSpaceView, ListingView, ParkingSpaceDetailView, ListingDetailView, \
    UserHistoryOrderView, UserCurrentOrderView, ParkingSpaceCurrentOrderView, ParkingSpaceHistoryOrderView, \
        CancelOrderView, PaymentView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('parkingSpace/', ParkingSpaceView.as_view(), name='parkingspace'),
    path('parkingSpace/<int:id>/', ParkingSpaceDetailView.as_view(), name='parkingspace_detail'),
    path('listing/', ListingView.as_view(), name='listing'),
    path('listing/<int:id>', ListingDetailView.as_view(), name='listing_detail'),
    path('userHistoryOrder/', UserHistoryOrderView.as_view(), name='user_history_order'),
    path('userCurrentOrder/', UserCurrentOrderView.as_view(), name='user_current_order'),
    path('parkingSpaceHistoryOrder/<int:id>/', ParkingSpaceHistoryOrderView.as_view(), name='parking_space_history_order'),
    path('parkingSpaceCurrentOrder/<int:id>/', ParkingSpaceCurrentOrderView.as_view(), name='parking_space_current_order'),
    path('cancelOrder/<int:id>/', CancelOrderView.as_view(), name='cancel_order'),
    path('payment/', PaymentView.as_view(), name='payment'),
]