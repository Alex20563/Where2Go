from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Test sending an email"

    def handle(self, *args, **kwargs):
        try:
            send_mail(
                "Тестовое сообщение",
                "Это тестовое сообщение для проверки отправки электронной почты.",
                settings.EMAIL_HOST_USER,
                ["yasyr.ma@yandex.ru"],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS("Email sent successfully!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error sending email: {str(e)}"))
