from django.db import models
from django.contrib.auth.models import AbstractUser, User
from django.utils import timezone

# Create your models here.

class CustomUser(AbstractUser):
    two_factor_secret = models.CharField(max_length=16, blank=True, null=True)
    verification_code = models.IntegerField(blank=True, null=True)  # Поле для хранения кода 2FA

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
