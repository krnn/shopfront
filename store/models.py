from django.db import models
from django.contrib.auth.models import User

from wagtail.admin.edit_handlers import FieldPanel, MultiFieldPanel
from wagtail.images.edit_handlers import ImageChooserPanel


class Customer(models.Model):
    user        = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    company     = models.CharField(max_length=100)
    address1    = models.CharField(max_length=100, blank=False, null=True)
    address2    = models.CharField(max_length=100, blank=True, null=True)
    city        = models.CharField(max_length=30, blank=False, null=True)
    state       = models.CharField(max_length=30, blank=True, null=True)
    country     = models.CharField(max_length=30, blank=True, null=True)
    pincode     = models.CharField(max_length=100, blank=False, null=True)

    def __str__(self):
        return self.company


class Category(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField()

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return f'/{self.slug}/'


class Product(models.Model):
    sku                 = models.CharField(max_length=30)
    category            = models.ForeignKey(Category, null=True, blank=True, related_name='products', on_delete=models.SET_NULL)
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
            FieldPanel('category'),
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
    customer    = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name="cart")
    order_date  = models.DateTimeField(auto_now_add=True)
    complete    = models.BooleanField(default=False)
    transaction_id  = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return str(self.id) + str(self.order_date)

    @property
    def get_cart_total(self):
        orderitems = self.items.all()
        total = sum([item.get_total for item in orderitems])
        return total

    @property
    def get_cart_items(self):
        orderitems = self.items.all()
        total = sum([item.quantity for item in orderitems])
        return total
    

class OrderItem(models.Model):
    product     = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    order       = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    quantity    = models.IntegerField(default=0)
    date_added  = models.DateField(auto_now_add=True)

    def __str__(self):
        return str(self.id)

    @property
    def get_total(self):
        total = self.product.price * self.quantity
        return total


# class ShippingAddress(models.Model):
#     customer    = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True)
#     address1    = models.CharField(max_length=100, blank=False, null=True)
#     address2    = models.CharField(max_length=100, blank=True, null=True)
#     city        = models.CharField(max_length=30, blank=False, null=True)
#     state       = models.CharField(max_length=30, blank=True, null=True)
#     country     = models.CharField(max_length=30, blank=True, null=True)
#     pincode     = models.CharField(max_length=100, blank=False, null=True)

#     def __str__(self):
#         return self.address1 + self.city
