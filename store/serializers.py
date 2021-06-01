from rest_framework.serializers import ModelSerializer, ReadOnlyField
from .models import *


# class ProductImageSerializer(ModelSerializer):
#     product_images = ProductImageSerializer(read_only=True)
#     image_url = ReadOnlyField()

#     class Meta:
#         model = Product
#         fields = "__all__"



class ProductFullSerializer(ModelSerializer):
    # product_images = ProductImageSerializer(read_only=True)
    image_url = ReadOnlyField()
    image_urls = ReadOnlyField()
    video_urls = ReadOnlyField()
    
    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            # Add searchable properties here
            "price",
            "discount_price",
            "image_url",
            "image_urls",
            "video_urls",
            "description",
            "units",
            "moq",
            "category",
        )


class ProductSerializer(ModelSerializer):
    image_url = ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            # Add searchable properties here
            "price",
            "discount_price",
            "image_url",
            "units",
            "moq",
            "category",
        )


class CartProductSerializer(ModelSerializer):
    image_url = ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "price",
            "discount_price",
            "image_url",
            "units",
            "moq",
        )


class OrderItemSerializer(ModelSerializer):
    product = CartProductSerializer(read_only=True)

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
        model = ShippingAddress
        fields = "__all__"
        # depth = 1

class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"