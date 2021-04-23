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