from django.contrib import admin
from .models import *

from wagtail.contrib.modeladmin.options import ModelAdmin, ModelAdminGroup, modeladmin_register

admin.site.register(ShippingAddress)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItem)

# class ShippingAddressAdmin(ModelAdmin):
#     model = ShippingAddress
#     menu_label = "ShippingAddresss"
#     menu_icon = "user"
#     add_to_settings_menu = False
#     exclude_from_explorer = False
#     list_display = ("company", )
#     search_fields = ("company",)

# modeladmin_register(ShippingAddressAdmin)


class ProductAdmin(ModelAdmin):
    model = Product
    menu_label = "Products"
    menu_icon = "clipboard-list"
    add_to_settings_menu = False
    exclude_from_explorer = False
    list_display = ("sku", "name")
    search_fields = ("name", "email")

modeladmin_register(ProductAdmin)

