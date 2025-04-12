from django.db import models
from django.contrib.auth.models import AbstractUser, User
from django.utils import timezone

# Create your models here.

class CustomUser(AbstractUser):
    two_factor_secret = models.CharField(max_length=16, blank=True, null=True)
    verification_code = models.IntegerField(blank=True, null=True)  # Поле для хранения кода 2FA
    friends = models.ManyToManyField(
        'self',
        symmetrical=True,
        blank=True,
        verbose_name='Друзья'
    )

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

class Group(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название группы')
    admin = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='admin_groups',
        verbose_name='Администратор'
    )
    members = models.ManyToManyField(
        CustomUser,
        related_name='member_groups',
        verbose_name='Участники'
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        verbose_name='Дата создания'
    )
    description = models.TextField(
        blank=True, 
        null=True,
        verbose_name='Описание'
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'
        ordering = ['-created_at']

class PollOption(models.Model):
    text = models.CharField(max_length=200, verbose_name='Вариант ответа')
    votes = models.IntegerField(default=0, verbose_name='Количество голосов')

    def __str__(self):
        return self.text

    class Meta:
        verbose_name = 'Вариант ответа'
        verbose_name_plural = 'Варианты ответов'

class Poll(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='polls', verbose_name='Группа')
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_polls', verbose_name='Создатель')
    question = models.CharField(max_length=255, verbose_name='Вопрос')
    options = models.ManyToManyField(PollOption, related_name='polls', verbose_name='Варианты ответов')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    end_time = models.DateTimeField(verbose_name='Время окончания', null=True, blank=True)
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    voted_users = models.ManyToManyField(CustomUser, related_name='voted_polls', blank=True, verbose_name='Проголосовавшие')

    @property
    def is_expired(self):
        if self.end_time:
            return timezone.now() >= self.end_time
        return False

    @property
    def total_votes(self):
        return sum(option.votes for option in self.options.all())

    def get_results(self):
        total = self.total_votes
        results = []
        for option in self.options.all():
            percentage = (option.votes / total * 100) if total > 0 else 0
            results.append({
                'text': option.text,
                'votes': option.votes,
                'percentage': round(percentage, 2)
            })
        return {
            'total_votes': total,
            'results': results
        }

    def __str__(self):
        return f"{self.question} ({self.group.name})"

    class Meta:
        verbose_name = 'Опрос'
        verbose_name_plural = 'Опросы'
        ordering = ['-created_at']
