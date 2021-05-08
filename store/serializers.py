from rest_framework.serializers import ModelSerializer, ReadOnlyField
from .models import *


class ProductSerializer(ModelSerializer):
    image_url = ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            # "description",
            "price",
            "image_url",
            "units",
            "moq",
        )


class OrderItemSerializer(ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity"]


class OrderSerializer(ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["complete", "items"]


class CartSerializer(ModelSerializer):
    cart = OrderSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = "__all__"
        # depth = 1

class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"