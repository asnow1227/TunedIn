# Generated by Django 3.2.16 on 2023-10-28 04:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_alter_prompt_unique_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='alias',
            name='authenticated',
            field=models.BooleanField(default=False),
        ),
    ]
