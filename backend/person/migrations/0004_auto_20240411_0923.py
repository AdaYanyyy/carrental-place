# Generated by Django 3.2.19 on 2024-04-11 09:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0003_alter_parkingspace_img_path'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='occupy',
            name='parking_space',
        ),
        migrations.RemoveField(
            model_name='usercoupons',
            name='coupon_type',
        ),
        migrations.AddField(
            model_name='usercoupons',
            name='discount',
            field=models.FloatField(default=0.9),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='usercoupons',
            name='end_time',
            field=models.DateTimeField(default='2024-05-01 00:00:00'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='usercoupons',
            name='start_time',
            field=models.DateTimeField(default='2024-04-01 00:00:00'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='usercoupons',
            name='status',
            field=models.CharField(default='able', max_length=255),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='CouponType',
        ),
        migrations.DeleteModel(
            name='Occupy',
        ),
    ]