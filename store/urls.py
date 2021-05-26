from django.urls import include, path
from rest_framework import routers
from . import views


urlpatterns = [
    path("register-user/", views.registerUser, name='registerUser'),
    path("login-user/", views.loginUser, name='loginUser'),
    path("logout-user/", views.logoutUser, name='logoutUser'),

    path("checkout/", views.checkout, name='checkout'),

    path("listproducts/", views.ListProducts.as_view(), name='listproducts'),
    path("fullproduct/<int:pk>", views.ProductInfo, name='fullproduct'),
    path("getcart/<int:pk>", views.getCart, name='getcart'),
    path("additem/", views.addItem, name='additem'),
    path("updateitem/", views.updateItem, name='updateitem'),
    path("removeitem/", views.removeItem, name='removeitem'),
    # path("rudcart/<int:pk>", views.RUDCart.as_view(), name='rudcart'),

    path("processorder/", views.processOrder, name='processorder'),
]
