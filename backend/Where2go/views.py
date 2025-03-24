from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, update_session_auth_hash
import pyotp
from rest_framework import generics
from .models import CustomUser
from .serializers import UserSerializer  
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
import random

# Create your views here.

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        code = request.data.get('code')  # Получаем код 2FA из запроса
        user = authenticate(username=username, password=password)

        if user is not None:
            # Если код 2FA не был предоставлен, генерируем и отправляем его
            if code is None:
                verification_code = random.randint(100000, 999999)
                user.verification_code = verification_code  # Сохраняем код в модели пользователя
                user.save()
                # Отправка кода на почту
                send_mail(
                    'Ваш код 2FA',
                    f'Ваш код: {verification_code}',
                    'where2go-verification@yandex.ru',
                    [user.email],
                    fail_silently=False,
                )
                return Response({'message': 'Код 2FA отправлен на вашу почту.'}, status=status.HTTP_200_OK)
            
            # Проверка кода 2FA
            if str(user.verification_code) == str(code):
                user.verification_code = None  # Сброс кода после успешной проверки
                user.save()
                
                # Получение или создание токена
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'message': 'Успешная аутентификация.',
                    'token': token.key  # Возвращаем токен
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Неверный код 2FA.'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Неверные учетные данные.'}, status=status.HTTP_401_UNAUTHORIZED)

class Generate2FASecretView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        # Генерация случайного кода
        verification_code = random.randint(100000, 999999)
        user.verification_code = verification_code
        user.save()

        # Отправка кода на электронную почту
        try:
            send_mail(
                'Ваш код двухфакторной аутентификации',
                f'Ваш код: {verification_code}',
                'where2go-verification@yandex.ru',  
                [user.email],
                fail_silently=False,
            )
            return Response({'message': 'Код отправлен на вашу электронную почту.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserCreate(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

class UpdateUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        new_username = request.data.get('username')
        new_password = request.data.get('password')

        if new_username:
            user.username = new_username
        if new_password:
            user.set_password(new_password)  # Устанавливаем новый пароль

        user.save()
        update_session_auth_hash(request, user)  # Обновляем сессию пользователя

        return Response({'message': 'Данные пользователя обновлены успешно.'}, status=status.HTTP_200_OK)
