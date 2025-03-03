from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
    two_factor_secret = models.CharField(max_length=16, blank=True, null=True)

    def __str__(self):
        return self.username
