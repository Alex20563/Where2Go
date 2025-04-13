from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, update_session_auth_hash
import pyotp
from rest_framework import generics
from ..models import CustomUser, Group, Poll, PollOption
from ..serializers import UserSerializer, GroupSerializer, UserListSerializer, UserDetailSerializer, PollSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.core.mail import send_mail
import random
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.generics import ListAPIView, RetrieveAPIView, DestroyAPIView
from django.shortcuts import get_object_or_404

class UserCreate(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    @swagger_auto_schema(
        operation_description="Создание нового пользователя",
        request_body=UserSerializer,
        responses={
            201: openapi.Response(
                description="Пользователь успешно создан",
                schema=UserSerializer
            ),
            400: openapi.Response(
                description="Неверные входные данные",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            )
        },
    )
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            return Response(
                {'error': 'Ошибка при создании пользователя'},
                status=status.HTTP_400_BAD_REQUEST
            )

class UpdateUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Обновление данных пользователя",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description='Новое имя пользователя'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='Новый пароль')
            }
        ),
        responses={200: 'Данные пользователя обновлены'}
    )
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

class UserListView(ListAPIView):
    """Получение списка всех пользователей"""
    queryset = CustomUser.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Получить список всех пользователей",
        responses={200: UserListSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class UserDetailView(RetrieveAPIView):
    """Получение информации о конкретном пользователе"""
    queryset = CustomUser.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    @swagger_auto_schema(
        operation_description="Получить информацию о пользователе",
        responses={200: UserDetailSerializer()}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class UserDeleteView(DestroyAPIView):
    """Удаление пользователя"""
    queryset = CustomUser.objects.all()
    permission_classes = [IsAdminUser]
    lookup_field = 'id'

    @swagger_auto_schema(
        operation_description="Удалить пользователя",
        responses={204: "Пользователь успешно удален"}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

class UserFriendsView(APIView):
    """Получение списка друзей пользователя"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Получить список друзей пользователя",
        responses={200: UserListSerializer(many=True)}
    )
    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        friends = user.friends.all()
        serializer = UserListSerializer(friends, many=True)
        return Response(serializer.data) 