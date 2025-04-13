from django.test import TestCase, Client
from django.urls import reverse
from .models import CustomUser, Group, Poll, PollOption
from django.utils import timezone
from datetime import timedelta
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

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

class UserAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Создаем суперпользователя
        self.admin_user = CustomUser.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.test_user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123'
        )
        self.test_user2 = CustomUser.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='test123'
        )
        # Добавляем друзей
        self.test_user.friends.add(self.test_user2)
        
        # Аутентифицируем как админа
        self.token = Token.objects.create(user=self.admin_user)
        self.client.force_authenticate(user=self.admin_user, token=self.token)  # Используем force_authenticate

    def test_user_list(self):
        """Тест получения списка пользователей"""
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)  # admin + 2 test users

    def test_user_detail(self):
        """Тест получения информации о пользователе"""
        response = self.client.get(f'/api/users/{self.test_user.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'testuser')

    def test_user_delete(self):
        """Тест удаления пользователя"""
        response = self.client.delete(f'/api/users/{self.test_user.id}/delete/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(CustomUser.objects.filter(id=self.test_user.id).exists())

    def test_user_friends(self):
        """Тест получения списка друзей пользователя"""
        response = self.client.get(f'/api/users/{self.test_user.id}/friends/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'testuser2')

class PollTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Создаем суперпользователя для тестов
        self.user = CustomUser.objects.create_superuser(
            username='testuser',
            email='test@example.com',
            password='test123'
        )
        self.group = Group.objects.create(
            name='Test Group',
            admin=self.user,
            description='Test Description'
        )
        # Добавляем пользователя в группу
        self.group.members.add(self.user)
        
        # Создаем и применяем токен
        self.token = Token.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user, token=self.token)  # Используем force_authenticate вместо credentials

    def test_create_poll(self):
        """Тест создания опроса"""
        data = {
            'question': 'Test Question',
            'group': self.group.id,  # Добавляем ID группы
            'options': [
                {'text': 'Option 1'},
                {'text': 'Option 2'}
            ]
        }
        response = self.client.post(f'/api/groups/{self.group.id}/polls/create/', data, format='json')
        if response.status_code != 201:
            print("Response data:", response.data)  # Выводим детали ошибки
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Poll.objects.count(), 1)
        self.assertEqual(PollOption.objects.count(), 2)

    def test_get_poll(self):
        """Тест получения информации об опросе"""
        poll = Poll.objects.create(
            group=self.group,
            creator=self.user,
            question='Test Question'
        )
        response = self.client.get(f'/api/polls/{poll.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['question'], 'Test Question')

    def test_close_poll(self):
        """Тест закрытия опроса"""
        poll = Poll.objects.create(
            group=self.group,
            creator=self.user,
            question='Test Question'
        )
        response = self.client.post(f'/api/polls/{poll.id}/close/')
        self.assertEqual(response.status_code, 200)
        poll.refresh_from_db()
        self.assertFalse(poll.is_active)

    def test_vote_poll(self):
        """Тест голосования в опросе"""
        poll = Poll.objects.create(
            group=self.group,
            creator=self.user,
            question='Test Question',
            end_time=timezone.now() + timedelta(days=1)
            )
        option = PollOption.objects.create(text='Option 1')
        poll.options.add(option)
    
    # Отправляем choices вместо option_id:
        response = self.client.post(
            f'/api/polls/{poll.id}/vote/',
            {'choices': [option.id]},  # Теперь список
            format='json'
    )
    
        self.assertEqual(response.status_code, 200)
        option.refresh_from_db()
        self.assertEqual(option.votes, 1)

    def test_get_poll_results(self):
        """Тест получения результатов опроса"""
        poll = Poll.objects.create(
            group=self.group,
            creator=self.user,
            question='Test Question',
            is_active=False
        )
        option = PollOption.objects.create(text='Option 1', votes=5)
        poll.options.add(option)
        
        response = self.client.get(f'/api/polls/{poll.id}/results/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_votes'], 5)
        self.assertEqual(response.data['results'][0]['percentage'], 100)

    def test_delete_poll(self):
        """Тест удаления опроса"""
        poll = Poll.objects.create(
            group=self.group,
            creator=self.user,
            question='Test Question'
        )
        
        # Убедитесь, что опрос существует перед удалением
        self.assertEqual(Poll.objects.count(), 1)

        # Удаляем опрос
        response = self.client.delete(f'/api/polls/{poll.id}/')
        self.assertEqual(response.status_code, 204)

        # Проверяем, что опрос был удален
        self.assertEqual(Poll.objects.count(), 0)

    def test_delete_poll_without_permission(self):
        """Тест удаления опроса без прав"""
        # Создаем другого пользователя, который не является создателем опроса
        another_user = CustomUser.objects.create_user(
            username='anotheruser',
            email='another@example.com',
            password='another123'
        )
        
        # Аутентифицируем другого пользователя
        self.client.force_authenticate(user=another_user)

        poll = Poll.objects.create(
            group=self.group,
            creator=self.user,
            question='Test Question'
        )

        # Пытаемся удалить опрос другим пользователем
        response = self.client.delete(f'/api/polls/{poll.id}/')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Poll.objects.count(), 1)  # Опрос не должен быть удален

class AdminAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = CustomUser.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.test_user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123'
        )
        self.test_group = Group.objects.create(
            name='Test Group',
            admin=self.admin_user,
            description='Test Description'
        )
        self.token = Token.objects.create(user=self.admin_user)
        self.client.force_authenticate(user=self.admin_user, token=self.token)

    def test_user_list(self):
        """Тест получения списка пользователей"""
        response = self.client.get('/api/admin/users/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('admin', [user['username'] for user in response.data])
        self.assertIn('testuser', [user['username'] for user in response.data])

    def test_user_delete(self):
        """Тест удаления пользователя"""
        response = self.client.delete(f'/api/admin/users/{self.test_user.id}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(CustomUser.objects.filter(id=self.test_user.id).exists())

    def test_user_ban(self):
        """Тест блокировки пользователя"""
        response = self.client.patch(f'/api/admin/users/{self.test_user.id}/ban/')
        self.assertEqual(response.status_code, 200)
        self.test_user.refresh_from_db()
        self.assertFalse(self.test_user.is_active)

    def test_group_list(self):
        """Тест получения списка групп"""
        response = self.client.get('/api/admin/groups/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Test Group', [group['name'] for group in response.data])

    def test_group_edit(self):
        """Тест редактирования группы"""
        response = self.client.patch(f'/api/admin/groups/{self.test_group.id}/', {'name': 'Updated Group'})
        self.assertEqual(response.status_code, 200)
        self.test_group.refresh_from_db()
        self.assertEqual(self.test_group.name, 'Updated Group')

    def test_group_delete(self):
        """Тест удаления группы"""
        response = self.client.delete(f'/api/admin/groups/{self.test_group.id}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Group.objects.filter(id=self.test_group.id).exists())

    def test_user_session_delete(self):
        """Тест завершения всех сессий пользователя"""
        response = self.client.delete(f'/api/admin/sessions/{self.test_user.id}/')
        self.assertEqual(response.status_code, 200)
        # Проверяем, что токены пользователя удалены
        self.assertEqual(Token.objects.filter(user=self.test_user).count(), 0)

