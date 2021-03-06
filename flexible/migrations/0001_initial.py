# Generated by Django 3.1.7 on 2021-04-10 10:21

from django.db import migrations, models
import django.db.models.deletion
import modelcluster.contrib.taggit
import modelcluster.fields
import wagtail.core.blocks
import wagtail.core.fields
import wagtail.images.blocks


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('taggit', '0003_taggeditem_add_unique_index'),
        ('wagtailcore', '0060_fix_workflow_unique_constraint'),
        ('wagtailimages', '0023_add_choose_permissions'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlogIndexPage',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.page')),
                ('subtitle', models.CharField(blank=True, help_text='Add custom title', max_length=100)),
            ],
            options={
                'abstract': False,
            },
            bases=('wagtailcore.page',),
        ),
        migrations.CreateModel(
            name='BlogPostPage',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.page')),
                ('brief', models.TextField()),
                ('date', models.DateField(auto_now=True)),
                ('content', wagtail.core.fields.StreamField([('heading', wagtail.core.blocks.StructBlock([('text', wagtail.core.blocks.CharBlock()), ('colour', wagtail.core.blocks.CharBlock(default='primary-800', max_length=20)), ('bold', wagtail.core.blocks.BooleanBlock(required=False)), ('level', wagtail.core.blocks.ChoiceBlock(choices=[('h2', 'Heading level 2'), ('h3', 'Heading level 3'), ('h4', 'Heading level 4'), ('p', 'Paragraph')])), ('space', wagtail.core.blocks.CharBlock(default='0', help_text='Set space below text.', max_length=2))])), ('content', wagtail.core.blocks.StructBlock([('text', wagtail.core.blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ul'], required=True)), ('colour', wagtail.core.blocks.CharBlock(default='grey-700', max_length=20)), ('leading', wagtail.core.blocks.CharBlock(default='8', help_text='Set space between lines.', max_length=2))])), ('image', wagtail.core.blocks.StructBlock([('image', wagtail.images.blocks.ImageChooserBlock(required=True)), ('description', wagtail.core.blocks.CharBlock(required=True)), ('show_caption', wagtail.core.blocks.BooleanBlock(default=False, required=False))]))])),
                ('banner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='wagtailimages.image')),
            ],
            options={
                'abstract': False,
            },
            bases=('wagtailcore.page',),
        ),
        migrations.CreateModel(
            name='FlexiblePage',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.page')),
                ('content', wagtail.core.fields.StreamField([('features_block', wagtail.core.blocks.StructBlock([('feature', wagtail.core.blocks.ListBlock(wagtail.core.blocks.StructBlock([('icon', wagtail.images.blocks.ImageChooserBlock(required=False)), ('heading', wagtail.core.blocks.StructBlock([('text', wagtail.core.blocks.CharBlock()), ('colour', wagtail.core.blocks.CharBlock(default='primary-800', max_length=20)), ('bold', wagtail.core.blocks.BooleanBlock(required=False)), ('level', wagtail.core.blocks.ChoiceBlock(choices=[('h2', 'Heading level 2'), ('h3', 'Heading level 3'), ('h4', 'Heading level 4'), ('p', 'Paragraph')])), ('space', wagtail.core.blocks.CharBlock(default='0', help_text='Set space below text.', max_length=2))], required=False)), ('text_content', wagtail.core.blocks.StructBlock([('text', wagtail.core.blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ul'], required=True)), ('colour', wagtail.core.blocks.CharBlock(default='grey-700', max_length=20)), ('leading', wagtail.core.blocks.CharBlock(default='8', help_text='Set space between lines.', max_length=2))])), ('link', wagtail.core.blocks.PageChooserBlock(required=False)), ('button_text', wagtail.core.blocks.CharBlock(max_length=30, required=False))]))), ('back_image', wagtail.images.blocks.ImageChooserBlock(help_text='Select a background image.', required=False)), ('back_colour', wagtail.core.blocks.CharBlock(help_text='Select a background colour.', max_length=20, required=False)), ('margin', wagtail.core.blocks.CharBlock(default='4', help_text='Add Spacing to the content.', max_length=3)), ('icon_size', wagtail.core.blocks.CharBlock(default='40', help_text='Ignore if no icon.', max_length=3)), ('text_align', wagtail.core.blocks.ChoiceBlock(choices=[('left', 'Left'), ('center', 'Center'), ('right', 'Right'), ('justify', 'Justify')], icon='cup')), ('divider', wagtail.core.blocks.BooleanBlock(help_text='Show dividing line at the bottom of block', required=False))])), ('image_block', wagtail.core.blocks.StructBlock([('image', wagtail.images.blocks.ImageChooserBlock(required=True)), ('description', wagtail.core.blocks.CharBlock(required=True)), ('show_caption', wagtail.core.blocks.BooleanBlock(default=False, required=False))])), ('image_slider_block', wagtail.core.blocks.StreamBlock([('slides', wagtail.core.blocks.StructBlock([('image', wagtail.images.blocks.ImageChooserBlock(required=True)), ('description', wagtail.core.blocks.CharBlock(required=True)), ('show_caption', wagtail.core.blocks.BooleanBlock(default=False, required=False))]))])), ('split_screen_block', wagtail.core.blocks.StructBlock([('heading', wagtail.core.blocks.CharBlock(max_length=50, required=False)), ('tiles', wagtail.core.blocks.StreamBlock([('image', wagtail.core.blocks.StructBlock([('image', wagtail.images.blocks.ImageChooserBlock(required=True)), ('description', wagtail.core.blocks.CharBlock(required=True)), ('show_caption', wagtail.core.blocks.BooleanBlock(default=False, required=False))])), ('feature', wagtail.core.blocks.StructBlock([('feature', wagtail.core.blocks.ListBlock(wagtail.core.blocks.StructBlock([('icon', wagtail.images.blocks.ImageChooserBlock(required=False)), ('heading', wagtail.core.blocks.StructBlock([('text', wagtail.core.blocks.CharBlock()), ('colour', wagtail.core.blocks.CharBlock(default='primary-800', max_length=20)), ('bold', wagtail.core.blocks.BooleanBlock(required=False)), ('level', wagtail.core.blocks.ChoiceBlock(choices=[('h2', 'Heading level 2'), ('h3', 'Heading level 3'), ('h4', 'Heading level 4'), ('p', 'Paragraph')])), ('space', wagtail.core.blocks.CharBlock(default='0', help_text='Set space below text.', max_length=2))], required=False)), ('text_content', wagtail.core.blocks.StructBlock([('text', wagtail.core.blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ul'], required=True)), ('colour', wagtail.core.blocks.CharBlock(default='grey-700', max_length=20)), ('leading', wagtail.core.blocks.CharBlock(default='8', help_text='Set space between lines.', max_length=2))])), ('link', wagtail.core.blocks.PageChooserBlock(required=False)), ('button_text', wagtail.core.blocks.CharBlock(max_length=30, required=False))]))), ('back_image', wagtail.images.blocks.ImageChooserBlock(help_text='Select a background image.', required=False)), ('back_colour', wagtail.core.blocks.CharBlock(help_text='Select a background colour.', max_length=20, required=False)), ('margin', wagtail.core.blocks.CharBlock(default='4', help_text='Add Spacing to the content.', max_length=3)), ('icon_size', wagtail.core.blocks.CharBlock(default='40', help_text='Ignore if no icon.', max_length=3)), ('text_align', wagtail.core.blocks.ChoiceBlock(choices=[('left', 'Left'), ('center', 'Center'), ('right', 'Right'), ('justify', 'Justify')], icon='cup')), ('divider', wagtail.core.blocks.BooleanBlock(help_text='Show dividing line at the bottom of block', required=False))]))]))]))])),
            ],
            options={
                'abstract': False,
            },
            bases=('wagtailcore.page',),
        ),
        migrations.CreateModel(
            name='BlogTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content_object', modelcluster.fields.ParentalKey(on_delete=django.db.models.deletion.CASCADE, related_name='tagged_items', to='flexible.blogpostpage')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='flexible_blogtag_items', to='taggit.tag')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='blogpostpage',
            name='tags',
            field=modelcluster.contrib.taggit.ClusterTaggableManager(blank=True, help_text='A comma-separated list of tags.', through='flexible.BlogTag', to='taggit.Tag', verbose_name='Tags'),
        ),
    ]
