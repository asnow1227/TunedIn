# Generated by Django 3.2.16 on 2023-12-31 00:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_vote'),
    ]

    operations = [
        migrations.AddField(
            model_name='alias',
            name='score',
            field=models.IntegerField(default=0),
        ),
    ]
