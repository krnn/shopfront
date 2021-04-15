from wagtail.core import blocks
from wagtail.images.blocks import ImageChooserBlock

class EmployeeCardBlock(blocks.StructBlock):
    name        = blocks.CharBlock(required=True, help_text="Add employee name")
    job_title   = blocks.CharBlock(required=False, help_text="Add job title")
    photo       = ImageChooserBlock(required=False)
    short_bio   = blocks.TextBlock(required=False, help_text="Add a short bio (OPTIONAL)")
    phone       = blocks.CharBlock(required=False, help_text="Add phone number")
    whatsapp    = blocks.CharBlock(required=False, help_text="Add full phone number in international format without any zeroes, brackets, or dashes.")
    email       = blocks.EmailBlock(required=False, help_text="Add employee email id")
    linkedin    = blocks.URLBlock(required=False, help_text="Add URL for LinkedIn account")


    class Meta:
        template = "home/blocks/employee_block.html"
        label = "Team Member"
        icon = "user"
        
    def save(self, *args, **kwargs):

        key = make_template_fragment_key("about")
        cache.delete(key)

        return super().save(*args, **kwargs)