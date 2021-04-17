from wagtail.core.blocks import StructBlock, CharBlock
from wagtail.images.blocks import ImageChooserBlock


class ProductImage(StructBlock):
    photo       = ImageChooserBlock(required=False)
    description = CharBlock(required=False, help_text="Add full phone number in international format without any zeroes, brackets, or dashes.")

    class Meta:
        template = "home/blocks/product_image.html"
        label = "Product Image"
        icon = "placeholder"