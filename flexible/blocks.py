from wagtail.core.blocks import StructBlock, ListBlock, CharBlock, RichTextBlock, PageChooserBlock, BooleanBlock, ChoiceBlock, StreamBlock
from wagtail.images.blocks import ImageChooserBlock

    
class StringBlock(StructBlock):
    text    = CharBlock()
    colour  = CharBlock(max_length=20, default="primary-800")
    bold    = BooleanBlock(required=False)
    level   = ChoiceBlock(choices=[
        ('h2','Heading level 2'),
        ('h3','Heading level 3'),
        ('h4','Heading level 4'),
        ('p','Paragraph'),
    ])
    space   = CharBlock(max_length=2, default="0", help_text="Set space below text.")

    class Meta:
        template    = "flexible/blocks/string_block.html"
        icon        = "title"
        label       = "Short Text"


class RichtextBlock(StructBlock):
    text    = RichTextBlock(features=['bold', 'italic', 'link', 'ul'], required=True)
    colour  = CharBlock(max_length=20, default="grey-700")
    leading = CharBlock(max_length=2, default="8", help_text="Set space between lines.")

    class Meta:
        template    = "flexible/blocks/richtext_block.html"
        icon        = "edit"
        label       = "Rich Text"


class FeatureBlock(StructBlock):
    
    feature   = ListBlock(StructBlock([
        ("icon", ImageChooserBlock(required=False)),
        ("heading", StringBlock(required=False)),
        ("text_content", RichtextBlock()),
        ("link", PageChooserBlock(required=False), ),
        ("button_text", CharBlock(required=False, max_length=30))
    ]))
    back_image  = ImageChooserBlock(required=False, help_text="Select a background image.")
    back_colour = CharBlock(max_length=20, required=False, help_text="Select a background colour.")
    margin      = CharBlock(max_length=3, default="4", help_text="Add Spacing to the content.")
    icon_size   = CharBlock(max_length=3, default="40",
        help_text="Ignore if no icon.")
    text_align  = ChoiceBlock(choices=[
        ('left', 'Left'),
        ('center', 'Center'),
        ('right', 'Right'),
        ('justify', 'Justify'),
    ], icon='cup')
    divider     = BooleanBlock(required=False,help_text="Show dividing line at the bottom of block")

    class Meta:
        template    = "flexible/blocks/feature_block.html"
        icon        = "form"
        label       = "Feature Block"


class ImageBlock(StructBlock):
    image       = ImageChooserBlock(required=True)
    description = CharBlock(required=True)
    show_caption    = BooleanBlock(required=False, default=False)
    # text    = StreamBlock([
    #     ("string", StringBlock()),
    # ])

    class Meta:
        template    = "flexible/blocks/image_block.html"
        icon        = "image"
        label       = "Image Block"


class ImageSliderBlock(StreamBlock):
    slides      = ImageBlock()
    # show_thumbs = BooleanBlock(default=True, required=False)

    class Meta:
        template    = "flexible/blocks/image_slider_block.html"
        icon        = "image"
        label       = "Image Slider Block"


class SplitScreenBlock(StructBlock):
    heading = CharBlock(max_length=50, required=False)
    tiles  = StreamBlock([
        ("image", ImageBlock()),
        ("feature", FeatureBlock())
    ])

    class Meta:
        template    = "flexible/blocks/split_screen_block.html"
        icon        = "placeholder"
        label       = "Split Screen Block"
