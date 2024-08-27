from django.urls import path
from recommendation.views import  UserOrdersRecommendView,TopRatedParkingSpacesView



urlpatterns = [
    # path('api/main/', Main.as_view(), name='login'),
    path(' UserOrdersRecommendView/',  UserOrdersRecommendView.as_view(), name=' UserOrdersRecommendView'),
    path('api/top-rated-parkings/', TopRatedParkingSpacesView.as_view(), name='top-rated-parkings'),

]