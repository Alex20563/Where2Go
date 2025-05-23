# Generated by Django 5.1.7 on 2025-04-23 07:54

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Where2go", "0003_alter_poll_end_time"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="poll",
            name="options",
        ),
        migrations.AddField(
            model_name="poll",
            name="voted_categories",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.CharField(max_length=100),
                blank=True,
                default=list,
                size=None,
                verbose_name="Выбранные категории",
            ),
        ),
    ]
