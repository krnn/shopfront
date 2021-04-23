from django.db import models
from django.contrib.auth.models import User

from wagtail.admin.edit_handlers import FieldPanel, MultiFieldPanel
from wagtail.images.edit_handlers import ImageChooserPanel


class Customer(models.Model):
    user    = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name    = models.CharField(max_length=100)
    email   = models.EmailField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):
    sku                 = models.CharField(max_length=30)
    name                = models.CharField(max_length=100)
    description         = models.TextField(blank=True)
    price               = models.DecimalField(max_digits=8, decimal_places=2)
    image               = models.ForeignKey("wagtailimages.Image",
        null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    units               = models.CharField(max_length=30)
    quantity_available  = models.IntegerField(default=0)
    moq                 = models.IntegerField(default=1)

    @property
    def image_url(self):
        return self.image.file.url
    

    panels = [
        MultiFieldPanel([
            FieldPanel('sku'),
            FieldPanel('name'),
            FieldPanel('description'),
            FieldPanel('price'),
            ImageChooserPanel('image'),
            FieldPanel('units'),
            FieldPanel('quantity_available'),
            FieldPanel('moq', heading='Minimum Order Quantity'),
        ]),
    ]


    def __str__(self):
        return self.name


class Order(models.Model):
    customer    = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    order_date  = models.DateTimeField(auto_now_add=True)
    complete    = models.BooleanField(default=False)
    transaction_id  = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return str(self).id + str(self).order_date
    

class OrderItem(models.Model):
    product     = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    order       = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
    quantity    = models.IntegerField(default=0)
    date_added  = models.DateField(auto_now_add=True)

    def __str__(self):
        return str(self).id


class ShippingAddress(models.Model):
    customer    = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True)
    address1    = models.CharField(max_length=100, blank=False, null=True)
    address2    = models.CharField(max_length=100, blank=True, null=True)
    city        = models.CharField(max_length=30, blank=False, null=True)
    state       = models.CharField(max_length=30, blank=True, null=True)
    country     = models.CharField(max_length=30, blank=True, null=True)
    pincode     = models.CharField(max_length=100, blank=False, null=True)

    def __str__(self):
        return self.address1 + self.city
