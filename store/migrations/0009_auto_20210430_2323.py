# Generated by Django 3.1.7 on 2021-04-30 23:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0008_auto_20210430_2322'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customer',
            name='email',
        ),
        migrations.AddField(
            model_name='customer',
            name='address1',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='address2',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='city',
            field=models.CharField(max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='country',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='pincode',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='state',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.DeleteModel(
            name='ShippingAddress',
        ),
    ]
