from django.db import models

from wagtail.core.models import Page
from wagtail.core.fields import StreamField
from wagtail.admin.edit_handlers import FieldPanel, MultiFieldPanel, StreamFieldPanel
from wagtail.images.edit_handlers import ImageChooserPanel

from . import blocks


class FlexiblePage(Page):

    content = StreamField([
        ('features_block', blocks.FeatureBlock()),
        ('image_block', blocks.ImageBlock()),
        ('image_slider_block', blocks.ImageSliderBlock()),
        ('split_screen_block', blocks.SplitScreenBlock())
    ])

    content_panels = Page.content_panels + [
        StreamFieldPanel("content")
    ]


class BlogIndexPage(Page):
    subtitle = models.CharField(max_length=100, blank=True, help_text="Add custom title")

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        context["posts"] = BlogPostPage.objects.live().public()
        return context

    content_panels = Page.content_panels + [
        FieldPanel("subtitle"),
    ]


class BlogPostPage(Page):
    banner  = models.ForeignKey("wagtailimages.Image", blank=True, null=True, related_name="+", on_delete=models.SET_NULL)
    brief   = models.TextField(blank=False)
    date    = models.DateField(auto_now=True)
    content = StreamField([
        ("heading", blocks.StringBlock()),
        ("content", blocks.RichtextBlock()),
        ("image", blocks.ImageBlock()),
        # video
    ])

    content_panels = Page.content_panels + [
        ImageChooserPanel("banner"),
        FieldPanel("brief"),
        StreamFieldPanel("content")
    ]
