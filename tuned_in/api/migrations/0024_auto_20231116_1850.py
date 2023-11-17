# Generated by Django 3.2.16 on 2023-11-16 23:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_alias_avatar_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='alias',
            name='avatar_url',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='alias',
            name='avatar_name',
            field=models.CharField(max_length=50, null=True),
        ),
    ]
