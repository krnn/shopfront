# Generated by Django 3.1.7 on 2021-04-03 14:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('company', '0003_remove_businessaddress_site'),
    ]

    operations = [
        migrations.CreateModel(
            name='BusinessNumber',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('department', models.CharField(blank=True, max_length=20, null=True)),
                ('phone_number', models.CharField(blank=True, max_length=20, null=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='businessaddress',
            name='email',
        ),
        migrations.RemoveField(
            model_name='businessaddress',
            name='phone1',
        ),
        migrations.RemoveField(
            model_name='businessaddress',
            name='phone2',
        ),
    ]