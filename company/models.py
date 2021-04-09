from django.db import models

from wagtail.core.fields import RichTextField, StreamField
from wagtail.admin.edit_handlers import FieldPanel, MultiFieldPanel, StreamFieldPanel, PageChooserPanel, InlinePanel
from wagtail.core.models import Orderable
from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel
from wagtail.contrib.settings.models import BaseSetting, register_setting
from wagtail.snippets.models import register_snippet

@register_setting
class ContactDetails(BaseSetting):
    linkedin    = models.URLField(max_length=40, null=True, blank=True)
    facebook    = models.URLField(max_length=40, null=True, blank=True)
    youtube     = models.URLField(max_length=40, null=True, blank=True)
    instagram   = models.URLField(max_length=40, null=True, blank=True)
    twitter     = models.URLField(max_length=40, null=True, blank=True)

    panels = [
        MultiFieldPanel([
            FieldPanel("linkedin"),
            FieldPanel("facebook"),
            FieldPanel("youtube"),
            FieldPanel("instagram"),
            FieldPanel("twitter")
        ], heading="Social Media Links"),
    ]


class BusinessAddress(models.Model):
    title       = models.CharField(max_length=40, blank=False, null=True)
    address1    = models.CharField(max_length=100, blank=False, null=True)
    address2    = models.CharField(max_length=100, blank=True, null=True)
    city        = models.CharField(max_length=30, blank=False, null=True)
    state       = models.CharField(max_length=30, blank=True, null=True)
    country     = models.CharField(max_length=30, blank=True, null=True)
    pincode     = models.CharField(max_length=100, blank=False, null=True)
    map_link    = models.CharField(max_length=200, blank=True, null=True)
    show_in_footer  =   models.BooleanField(default=False)
       
    panels = [
        FieldPanel("title"),
        MultiFieldPanel([
            FieldPanel("address1"),
            FieldPanel("address2"),
            FieldPanel("city"),
            FieldPanel("state"),
            FieldPanel("country"),
            FieldPanel("pincode"),
            FieldPanel("map_link"),
            FieldPanel("show_in_footer"),
        ], heading="Business Address"),
    ]

    def __str__(self):
        return self.title

register_snippet(BusinessAddress)


class BusinessContact(models.Model):
    department     = models.CharField(max_length=20, blank=True, null=True)
    phone_number   = models.CharField(max_length=20, blank=True, null=True)
    email          = models.CharField(max_length=40, blank=True, null=True)
       
    panels = [
        FieldPanel("department"),
        FieldPanel("phone_number"),
        FieldPanel("email"),
    ]

    def __str__(self):
        return self.department

register_snippet(BusinessContact)


class Menu(ClusterableModel):
    title = models.CharField(max_length=20, unique=True)

    panels = [
        MultiFieldPanel([
            FieldPanel('title'),
        ], heading="Menu"),
        InlinePanel('menu_items', label="Menu Item")
    ]

    def __str__(self):
        return self.title

register_snippet(Menu)

class MenuItem(Orderable):
    menu = ParentalKey('Menu', related_name='menu_items', help_text="Menu to which this item belongs")
    title = models.CharField(max_length=20, help_text="Title of menu item that will be displayed")
    link_page = models.ForeignKey(
        "wagtailcore.Page", blank=True, null=True, related_name='+', on_delete=models.CASCADE, help_text="Add a link to a page",
    )
    section  = models.CharField(max_length=20, blank=True, null=True,
        help_text="Specify page section to link to. Leave blank to link to top of page.")
    submenus = models.CharField(
        blank=True, null=True, max_length=20, help_text="Add a list of submenus by titles. Use a comma to separate titles."
    )

    panels = [
        FieldPanel('title'),
        PageChooserPanel('link_page'),
        FieldPanel('section'),
        FieldPanel('submenus'),
    ]

    def __str__(self):
        return self.title

    @property
    def get_submenus(self):
        if self.submenus:
            return self.submenus.replace(" ", "").split(',')
        else:
            return null

# class PageFooter():

