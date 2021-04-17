from django.urls import include, path
from rest_framework import routers
from . import views


urlpatterns = [
    path("listproducts/", views.ListProducts.as_view(), name='listproducts'),
    path("createproducts/", views.CreateProduct.as_view(), name='createproduct'),
    path("rudproducts/<int:pk>", views.RUDProduct.as_view(), name='rudproduct'),
]
