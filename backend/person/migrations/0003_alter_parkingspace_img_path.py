# Generated by Django 3.2.19 on 2024-04-07 10:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20240404_1141'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parkingspace',
            name='img_path',
            field=models.TextField(blank=True, null=True),
        ),
    ]