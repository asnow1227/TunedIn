# Generated by Django 3.2.16 on 2023-08-27 01:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_auto_20230622_0123'),
    ]

    operations = [
        migrations.AddField(
            model_name='prompt',
            name='submitted',
            field=models.BooleanField(default=False),
        ),
    ]