# Generated by Django 3.2.16 on 2022-12-25 23:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_auto_20221225_2344'),
    ]

    operations = [
        migrations.AlterField(
            model_name='prompt',
            name='assigned_round',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='prompt',
            name='assigned_user',
            field=models.TextField(null=True),
        ),
    ]
