from django.db import models
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key

from wagtail.core.models import Page, Orderable
from wagtail.core.fields import StreamField
from wagtail.admin.edit_handlers import FieldPanel, StreamFieldPanel
from wagtail.images.edit_handlers import ImageChooserPanel

from .blocks import ProductImage

class BrochurePage(Page):
    header_image  = models.ForeignKey("wagtailimages.Image",
        null=True, blank=False, on_delete=models.SET_NULL, related_name="+")

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        context["products"] = ProductPage.objects.child_of(self).live()
        
        return context

    content_panels = Page.content_panels + [
            ImageChooserPanel("header_image"),
        ]


class ProductPage(Page):
    product_name     = models.CharField(max_length=200)
    description      = models.TextField()
    image            = models.ForeignKey("wagtailimages.Image",
        null=True, blank=False, on_delete=models.SET_NULL, related_name="+")
    additional_media = StreamField([
        ("image", ProductImage()),
        ], null=True, blank=True)

    content_panels = Page.content_panels + [
            FieldPanel("product_name"),
            FieldPanel("description"),
            ImageChooserPanel("image"),
            StreamFieldPanel("additional_media")
    ]

    def save(self, *args, **kwargs):

        key1 = make_template_fragment_key("brochure", [self.id])
        cache.delete(key1)
        # key2 = make_template_fragment_key("product_page", [self.id])
        # cache.delete(key2)

        return super().save(*args, **kwargs)