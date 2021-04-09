# Generated by Django 3.1.7 on 2021-04-07 17:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('wagtailcore', '0060_fix_workflow_unique_constraint'),
        ('company', '0007_remove_menuitem_show_when'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='menuitem',
            name='title_of_submenu',
        ),
        migrations.AddField(
            model_name='menuitem',
            name='submenus',
            field=models.CharField(blank=True, help_text='Add a list of submenus by titles. Use a comma to separate titles.', max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='mainmenu',
            name='title',
            field=models.CharField(max_length=20, unique=True),
        ),
        migrations.AlterField(
            model_name='menuitem',
            name='link_page',
            field=models.ForeignKey(blank=True, help_text='Add a link to a page', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='wagtailcore.page'),
        ),
    ]