from django.db import models
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key

from wagtail.core.models import Page, Orderable
from wagtail.core.fields import RichTextField, StreamField
from wagtail.admin.edit_handlers import FieldPanel, FieldRowPanel, MultiFieldPanel, StreamFieldPanel, PageChooserPanel, InlinePanel
from wagtail.images.edit_handlers import ImageChooserPanel
from modelcluster.fields import ParentalKey
from wagtail.contrib.forms.models import AbstractEmailForm, AbstractFormField

from .blocks import EmployeeCardBlock
from company.models import BusinessAddress, BusinessContact


class HomePage(Page):
    max_count = 1 # Limits site to single homepage

    hero_title      = models.CharField(max_length=100, blank=False, null=True)
    hero_subtitle   = RichTextField(max_length=100, blank=True, null=True)
    hero_image      = models.ForeignKey("wagtailimages.Image",
        null=True, blank=False, on_delete=models.SET_NULL, related_name="+")
    hero_cta        = models.ForeignKey("wagtailcore.Page",
        null=True, blank=True, on_delete=models.SET_NULL, related_name="+")

    content_panels = Page.content_panels + [
        MultiFieldPanel([
            FieldPanel("hero_title"),
            FieldPanel("hero_subtitle"),
            ImageChooserPanel("hero_image"),
            PageChooserPanel("hero_cta"),
        ], heading="Hero"),
        MultiFieldPanel([
            InlinePanel("image_carousel",
            min_num=3, max_num=10, label="Image"),
        ], heading="Product Images"),
    ]

    def save(self, *args, **kwargs):

        key = make_template_fragment_key("home")
        cache.delete(key)

        return super().save(*args, **kwargs)


class ImageCarousel(Orderable):
    page            = ParentalKey("home.HomePage", related_name="image_carousel")
    carousel_image  = models.ForeignKey("wagtailimages.Image",
        null=True, blank=False, on_delete=models.SET_NULL, related_name="add_carousel_image")
    
    panels = [
        ImageChooserPanel("carousel_image"),
    ]


class ContactFormField(AbstractFormField):
    page = ParentalKey(
        'AboutPage',
        on_delete=models.CASCADE,
        related_name='form_fields'
    )


class AboutPage(AbstractEmailForm):
    max_count = 1

    page_heading    = models.CharField(max_length=100, blank=False, null=True)
    header_image    = models.ForeignKey("wagtailimages.Image",
        null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    brand_name      = models.CharField(max_length=100, blank=False, null=True)
    parent_company  = models.CharField(max_length=100, blank=False, null=True)
    company_details = RichTextField(blank=False, null=True)
    team_heading    = models.CharField(max_length=40, blank=True, null=True)
    team_cards      = StreamField([("emp_cards", EmployeeCardBlock(label="Employee"))], null=True, blank=True)
    
    form_heading    = models.CharField(max_length=40, blank=True, null=True)
    form_success_text = models.CharField(max_length=200, blank=False, default='Thank you for getting in touch! We will reply to you as soon as possible.')

    content_panels = AbstractEmailForm.content_panels + [
        MultiFieldPanel([
            FieldPanel("page_heading"),
            ImageChooserPanel("header_image"),
            FieldPanel("brand_name"),
            FieldPanel("parent_company"),
            FieldPanel("company_details"),
        ], heading="Company Summary"),

        MultiFieldPanel([
            FieldPanel("team_heading"),
            StreamFieldPanel("team_cards")
        ], heading="Team Details"),

        MultiFieldPanel([
            FieldPanel('form_heading'),
            InlinePanel('form_fields', label='Form Fields'),
            FieldPanel('form_success_text'),
            MultiFieldPanel([
                FieldRowPanel([
                    FieldPanel('from_address', classname='col6'),
                    FieldPanel('to_address', classname='col6'),
                ]),
                FieldPanel("subject"),
            ], heading="Email Settings")
        ], heading="Contact Form")
    ]

    def get_context(self, request):
        context = super().get_context(request)
        context["addresses"] = BusinessAddress.objects.all()
        context["numbers"] = BusinessContact.objects.all()
        return context

    def save(self, *args, **kwargs):

        key = make_template_fragment_key("about")
        cache.delete(key)

        return super().save(*args, **kwargs)
