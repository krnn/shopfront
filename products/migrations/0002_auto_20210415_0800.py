# Generated by Django 3.1.7 on 2021-04-15 08:00

from django.db import migrations, models
import django.db.models.deletion
import wagtail.core.blocks
import wagtail.core.fields
import wagtail.images.blocks


class Migration(migrations.Migration):

    dependencies = [
        ('wagtailredirects', '0006_redirect_increase_max_length'),
        ('wagtailimages', '0023_add_choose_permissions'),
        ('wagtailcore', '0060_fix_workflow_unique_constraint'),
        ('wagtailforms', '0004_add_verbose_name_plural'),
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductPage',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.page')),
                ('product_name', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('images_and_video', wagtail.core.fields.StreamField([('image', wagtail.core.blocks.StructBlock([('photo', wagtail.images.blocks.ImageChooserBlock(required=False)), ('description', wagtail.core.blocks.CharBlock(help_text='Add full phone number in international format without any zeroes, brackets, or dashes.', required=False))]))])),
            ],
            options={
                'abstract': False,
            },
            bases=('wagtailcore.page',),
        ),
        migrations.AddField(
            model_name='brochurepage',
            name='header_image',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='wagtailimages.image'),
        ),
        migrations.DeleteModel(
            name='Product',
        ),
    ]
