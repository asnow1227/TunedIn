# Generated by Django 3.2.16 on 2023-02-16 00:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_auto_20230215_2221'),
    ]

    operations = [
        migrations.AddField(
            model_name='alias',
            name='ready',
            field=models.BooleanField(default=False),
        ),
    ]
