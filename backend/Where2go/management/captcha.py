import requests
from django.conf import settings


def verify_captcha(token):
    """
    Проверяет капча-токен через Google reCAPTCHA.
    Возвращает True при успехе, иначе False.
    """
    url = "https://www.google.com/recaptcha/api/siteverify"
    payload = {
        "secret": settings.RECAPTCHA_SECRET_KEY,
        "response": token,
    }
    try:
        response = requests.post(url, data=payload)
        return response.json().get("success", False)
    except requests.RequestException:
        return False
