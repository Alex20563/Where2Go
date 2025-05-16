
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .mocks import mock_google_oauth2_token_response, mock_google_user_info_response

User = get_user_model()


class SocialAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.social_auth_url = reverse("social_auth")
        self.callback_url = reverse("social_auth_callback")

        # Тестовые данные пользователя Google
        self.google_user_data = {
            "id": "123456789",
            "email": "test@example.com",
            "name": "Test User",
            "given_name": "Test",
            "family_name": "User",
            "picture": "https://example.com/photo.jpg",
            "locale": "en",
        }

    def test_google_auth_redirect(self):
        """Тест перенаправления на Google OAuth"""
        response = self.client.get(self.social_auth_url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertTrue("accounts.google.com" in response.url)

    @mock_google_oauth2_token_response()
    @mock_google_user_info_response()
    def test_user_creation_after_oauth(self, mock_user_info, mock_token):
        """Тест создания пользователя после OAuth"""
        # Имитируем успешный OAuth callback
        response = self.client.get(
            self.callback_url, {"code": "test_code"}, format="json"
        )

        # Проверяем, что пользователь создан
        user = User.objects.filter(email=self.google_user_data["email"]).first()
        self.assertIsNotNone(user)
        self.assertEqual(user.email, self.google_user_data["email"])
        self.assertEqual(user.username, self.google_user_data["email"].split("@")[0])
        self.assertEqual(user.first_name, self.google_user_data["given_name"])
        self.assertEqual(user.last_name, self.google_user_data["family_name"])

    @mock_google_oauth2_token_response()
    @mock_google_user_info_response()
    def test_duplicate_user_handling(self, mock_user_info, mock_token):
        """Тест обработки повторной авторизации существующего пользователя"""
        # Создаем пользователя
        user = User.objects.create_user(
            username="test", email="test@example.com", password="testpass123"
        )

        # Имитируем повторную авторизацию
        response = self.client.get(
            self.callback_url, {"code": "test_code"}, format="json"
        )

        # Проверяем, что пользователь не дублируется
        user_count = User.objects.filter(email="test@example.com").count()
        self.assertEqual(user_count, 1)
