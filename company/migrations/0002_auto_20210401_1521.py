# Generated by Django 3.1.7 on 2021-04-01 15:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('wagtailcore', '0060_fix_workflow_unique_constraint'),
        ('company', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='AddressSettings',
            new_name='BusinessAddress',
        ),
    ]
