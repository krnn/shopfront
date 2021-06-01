# Generated by Django 3.1.7 on 2021-05-31 10:06

from django.db import migrations
import wagtail.core.blocks
import wagtail.core.fields
import wagtail.images.blocks


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0019_auto_20210531_1003'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='images',
            field=wagtail.core.fields.StreamField([('image', wagtail.images.blocks.ImageChooserBlock())], blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='product',
            name='videos',
            field=wagtail.core.fields.StreamField([('video_URL', wagtail.core.blocks.CharBlock(icon='media'))], blank=True, null=True),
        ),
    ]