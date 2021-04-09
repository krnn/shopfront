from django import template

from ..models import BusinessAddress


register = template.Library()

@register.simple_tag()
def get_footer():
    return BusinessAddress.objects.all().filter(show_in_footer=True)
