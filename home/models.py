from django.db import models

from wagtail.core.models import Page
from wagtail.core.fields import RichTextField, StreamField
from wagtail.admin.edit_handlers import FieldPanel, MultiFieldPanel, StreamFieldPanel, PageChooserPanel, InlinePanel
from wagtail.images.edit_handlers import ImageChooserPanel

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
    ]
    

class AboutPage(Page):
    max_count = 1

    page_heading    = models.CharField(max_length=100, blank=False, null=True)
    header_image    = models.ForeignKey("wagtailimages.Image",
        null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    brand_name      = models.CharField(max_length=100, blank=False, null=True)
    parent_company  = models.CharField(max_length=100, blank=False, null=True)
    company_details = RichTextField(blank=False, null=True)
    team_heading    = models.CharField(max_length=40, blank=True, null=True)
    team_cards      = StreamField([("emp_cards", EmployeeCardBlock(label="Employee"))], null=True, blank=True)

    content_panels = Page.content_panels + [
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
    ]

    def get_context(self, request):
        context = super().get_context(request)
        context["addresses"] = BusinessAddress.objects.all()
        context["numbers"] = BusinessContact.objects.all()
        return context
