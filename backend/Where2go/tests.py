from django.test import TestCase, Client
from django.urls import reverse
from .models import CustomUser, Group
from django.utils import timezone
from datetime import timedelta

# Create your tests here.

class AdminTests(TestCase):
    def setUp(self):
        # Создаем админа
        self.client = Client()
        self.admin_user = CustomUser.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.client.login(username='admin', password='admin123')

        # Создаем тестового пользователя
        self.test_user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123'
        )

        # Создаем тестовую группу
        self.test_group = Group.objects.create(
            name='Test Group',
            admin=self.admin_user,
            description='Test Description'
        )
        self.test_group.members.add(self.test_user)

    def test_admin_login(self):
        """Тест входа в админ-панель"""
        response = self.client.get(reverse('admin:index'))
        self.assertEqual(response.status_code, 200)

    def test_admin_user_list(self):
        """Тест списка пользователей в админке"""
        response = self.client.get(reverse('admin:Where2go_customuser_changelist'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'admin')
        self.assertContains(response, 'testuser')

    def test_admin_group_list(self):
        """Тест списка групп в админке"""
        response = self.client.get(reverse('admin:Where2go_group_changelist'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Group')

    def test_admin_user_change(self):
        """Тест страницы редактирования пользователя"""
        response = self.client.get(
            reverse('admin:Where2go_customuser_change', args=[self.test_user.id])
        )
        self.assertEqual(response.status_code, 200)

    def test_admin_group_change(self):
        """Тест страницы редактирования группы"""
        response = self.client.get(
            reverse('admin:Where2go_group_change', args=[self.test_group.id])
        )
        self.assertEqual(response.status_code, 200)

    def test_admin_user_add(self):
        """Тест создания нового пользователя через админку"""
        response = self.client.get(reverse('admin:Where2go_customuser_add'))
        self.assertEqual(response.status_code, 200)

    def test_admin_group_add(self):
        """Тест создания новой группы через админку"""
        response = self.client.get(reverse('admin:Where2go_group_add'))
        self.assertEqual(response.status_code, 200)

    def test_admin_group_delete(self):
        """Тест удаления группы через админку"""
        response = self.client.post(
            reverse('admin:Where2go_group_delete', args=[self.test_group.id]),
            {'post': 'yes'}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Group.objects.count(), 0)

    def test_admin_user_search(self):
        """Тест поиска пользователей в админке"""
        response = self.client.get(
            reverse('admin:Where2go_customuser_changelist'),
            {'q': 'test'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'testuser')

    def test_admin_group_search(self):
        """Тест поиска групп в админке"""
        response = self.client.get(
            reverse('admin:Where2go_group_changelist'),
            {'q': 'Test Group'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Group')

class GroupModelTests(TestCase):
    def setUp(self):
        self.admin_user = CustomUser.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.test_group = Group.objects.create(
            name='Test Group',
            admin=self.admin_user,
            description='Test Description'
        )

    def test_group_creation(self):
        """Тест создания группы"""
        self.assertEqual(self.test_group.name, 'Test Group')
        self.assertEqual(self.test_group.admin, self.admin_user)
        self.assertEqual(self.test_group.description, 'Test Description')
        self.assertTrue(isinstance(self.test_group.created_at, timezone.datetime))

    def test_group_str_representation(self):
        """Тест строкового представления группы"""
        self.assertEqual(str(self.test_group), 'Test Group')

    def test_group_members(self):
        """Тест добавления участников в группу"""
        test_user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123'
        )
        self.test_group.members.add(test_user)
        self.assertEqual(self.test_group.members.count(), 1)
        self.assertTrue(test_user in self.test_group.members.all())
