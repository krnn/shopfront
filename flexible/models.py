from django.db import models
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key

from wagtail.core.models import Page
from wagtail.core.fields import StreamField
from wagtail.admin.edit_handlers import FieldPanel, MultiFieldPanel, StreamFieldPanel
from wagtail.images.edit_handlers import ImageChooserPanel
from modelcluster.fields import ParentalKey
from modelcluster.contrib.taggit import ClusterTaggableManager
from taggit.models import TaggedItemBase

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
        blog_entries = BlogPostPage.objects.child_of(self).live().order_by('-first_published_at')
        tag = request.GET.get('tag')
        if tag:
            blog_entries = blog_entries.filter(tags__slug=tag)

        paginator = Paginator(blog_entries, 8)
        page = request.GET.get("page")
        try:
            posts = paginator.page(page)
        except PageNotAnInteger:
            posts = paginator.page(1)
        except EmptyPage:
            posts = paginator.page(1)

        context["posts"] = posts
        return context

    content_panels = Page.content_panels + [
        FieldPanel("subtitle"),
    ]


class BlogTag(TaggedItemBase):
    content_object = ParentalKey('BlogPostPage', related_name='tagged_items', on_delete=models.CASCADE)


class BlogPostPage(Page):
    banner  = models.ForeignKey("wagtailimages.Image", blank=True, null=True, related_name="+", on_delete=models.SET_NULL)
    brief   = models.TextField(blank=False)
    date    = models.DateField(auto_now=True)
    tags    = ClusterTaggableManager(through=BlogTag, blank=True)
    content = StreamField([
        ("heading", blocks.StringBlock()),
        ("text_body", blocks.RichtextBlock()),
        ("image", blocks.ImageBlock()),
        # video
    ])

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        blog_entries = BlogPostPage.objects.sibling_of(self).live()
        blog_entries = blog_entries.filter(tags__name__in=self.tags.all()).distinct().exclude(id=self.id)[:3]

        context["posts"] = blog_entries
        return context

    content_panels = Page.content_panels + [
        ImageChooserPanel("banner"),
        FieldPanel("tags"),
        FieldPanel("brief"),
        StreamFieldPanel("content")
    ]

    def save(self, *args, **kwargs):

        key1 = make_template_fragment_key("blog_preview", [self.id])
        cache.delete(key1)
        key2 = make_template_fragment_key("blog_view", [self.id])
        cache.delete(key2)

        return super().save(*args, **kwargs)
