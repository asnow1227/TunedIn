# Generated by Django 3.2.16 on 2023-08-27 02:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_prompt_submitted'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='prompt',
            name='submitted',
        ),
    ]
