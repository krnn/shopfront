from django.db import models
from django.contrib.auth.models import User


class Customer(models.Model):
    user    = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name    = models.CharField(max_length=100)
    email   = models.EmailField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):
    sku     = models.CharField(max_length=30)
    name    = models.CharField(max_length=100)
    price   = models.DecimalField(max_digits=8, decimal_places=2)

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