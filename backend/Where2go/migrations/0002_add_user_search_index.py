# Generated by Django 5.1.7 on 2025-04-22 14:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("Where2go", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                    CREATE INDEX user_search_idx
                    ON public."Where2go_customuser"
                    USING GIN (to_tsvector('simple', username || ' ' || email));
                """,
            reverse_sql="DROP INDEX IF EXISTS user_search_idx;",
        ),
    ]
