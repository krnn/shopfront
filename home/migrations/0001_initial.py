# Generated by Django 3.1.7 on 2021-04-10 10:21

from django.db import migrations, models
import django.db.models.deletion
import modelcluster.fields
import wagtail.core.blocks
import wagtail.core.fields
import wagtail.images.blocks


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('wagtailcore', '0060_fix_workflow_unique_constraint'),
        ('wagtailimages', '0023_add_choose_permissions'),
    ]

    operations = [
        migrations.CreateModel(
            name='AboutPage',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.page')),
                ('to_address', models.CharField(blank=True, help_text='Optional - form submissions will be emailed to these addresses. Separate multiple addresses by comma.', max_length=255, verbose_name='to address')),
                ('from_address', models.CharField(blank=True, max_length=255, verbose_name='from address')),
                ('subject', models.CharField(blank=True, max_length=255, verbose_name='subject')),
                ('page_heading', models.CharField(max_length=100, null=True)),
                ('brand_name', models.CharField(max_length=100, null=True)),
                ('parent_company', models.CharField(max_length=100, null=True)),
                ('company_details', wagtail.core.fields.RichTextField(null=True)),
                ('team_heading', models.CharField(blank=True, max_length=40, null=True)),
                ('team_cards', wagtail.core.fields.StreamField([('emp_cards', wagtail.core.blocks.StructBlock([('name', wagtail.core.blocks.CharBlock(help_text='Add employee name', required=True)), ('job_title', wagtail.core.blocks.CharBlock(help_text='Add job title', required=False)), ('photo', wagtail.images.blocks.ImageChooserBlock(required=False)), ('short_bio', wagtail.core.blocks.TextBlock(help_text='Add a short bio (OPTIONAL)', required=False)), ('phone', wagtail.core.blocks.CharBlock(help_text='Add phone number', required=False)), ('whatsapp', wagtail.core.blocks.CharBlock(help_text='Add full phone number in international format without any zeroes, brackets, or dashes.', required=False)), ('email', wagtail.core.blocks.EmailBlock(help_text='Add employee email id', required=False)), ('linkedin', wagtail.core.blocks.URLBlock(help_text='Add URL for LinkedIn account', required=False))], label='Employee'))], blank=True, null=True)),
                ('form_heading', models.CharField(blank=True, max_length=40, null=True)),
                ('form_success_text', models.CharField(default='Thank you for getting in touch! We will reply to you as soon as possible.', max_length=200)),
                ('header_image', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='wagtailimages.image')),
            ],
            options={
                'abstract': False,
            },
            bases=('wagtailcore.page',),
        ),
        migrations.CreateModel(
            name='HomePage',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.page')),
                ('hero_title', models.CharField(max_length=100, null=True)),
                ('hero_subtitle', wagtail.core.fields.RichTextField(blank=True, max_length=100, null=True)),
                ('hero_cta', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='wagtailcore.page')),
                ('hero_image', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='wagtailimages.image')),
            ],
            options={
                'abstract': False,
            },
            bases=('wagtailcore.page',),
        ),
        migrations.CreateModel(
            name='ContactFormField',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sort_order', models.IntegerField(blank=True, editable=False, null=True)),
                ('clean_name', models.CharField(blank=True, default='', help_text='Safe name of the form field, the label converted to ascii_snake_case', max_length=255, verbose_name='name')),
                ('label', models.CharField(help_text='The label of the form field', max_length=255, verbose_name='label')),
                ('field_type', models.CharField(choices=[('singleline', 'Single line text'), ('multiline', 'Multi-line text'), ('email', 'Email'), ('number', 'Number'), ('url', 'URL'), ('checkbox', 'Checkbox'), ('checkboxes', 'Checkboxes'), ('dropdown', 'Drop down'), ('multiselect', 'Multiple select'), ('radio', 'Radio buttons'), ('date', 'Date'), ('datetime', 'Date/time'), ('hidden', 'Hidden field')], max_length=16, verbose_name='field type')),
                ('required', models.BooleanField(default=True, verbose_name='required')),
                ('choices', models.TextField(blank=True, help_text='Comma separated list of choices. Only applicable in checkboxes, radio and dropdown.', verbose_name='choices')),
                ('default_value', models.CharField(blank=True, help_text='Default value. Comma separated values supported for checkboxes.', max_length=255, verbose_name='default value')),
                ('help_text', models.CharField(blank=True, max_length=255, verbose_name='help text')),
                ('page', modelcluster.fields.ParentalKey(on_delete=django.db.models.deletion.CASCADE, related_name='form_fields', to='home.aboutpage')),
            ],
            options={
                'ordering': ['sort_order'],
                'abstract': False,
            },
        ),
    ]
