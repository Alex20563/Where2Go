import random

from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import update_session_auth_hash
from rest_framework import generics

from django.db import IntegrityError
from ..management.captcha import verify_captcha
from ..models import CustomUser
from ..serializers import UserSerializer, UserListSerializer, UserDetailSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.generics import ListAPIView, RetrieveAPIView, DestroyAPIView
from django.shortcuts import get_object_or_404


class UserCreate(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Создание нового пользователя",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'email', 'password', 'captcha'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING),
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'password': openapi.Schema(type=openapi.TYPE_STRING),
                'captcha': openapi.Schema(type=openapi.TYPE_STRING, description='reCAPTCHA токен')
            }
        ),
        responses={
            201: openapi.Response(description="Пользователь успешно создан", schema=UserSerializer),
            400: openapi.Response(description="Неверные входные данные"),
        },
    )
    def post(self, request, *args, **kwargs):
        captcha_token = request.data.get('captcha')
        if not verify_captcha(captcha_token):
            return Response({'error': 'Проверка капчи не пройдена'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(is_active=False)  # Создаем неактивного пользователя

        # Генерация кода подтверждения
        confirmation_code = random.randint(100000, 999999)
        user.verification_code = confirmation_code
        user.save()

        # Отправка кода на почту
        send_mail(
            'Код подтверждения',
            f'Ваш код подтверждения: {confirmation_code}',
            'where2go-verification@yandex.ru',
            [user.email],
            fail_silently=False,
        )

        return Response({'message': 'Пользователь создан. Проверьте вашу почту для подтверждения.'},
                        status=status.HTTP_201_CREATED)


class UpdateUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Обновление данных пользователя",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'newUsername': openapi.Schema(type=openapi.TYPE_STRING, description='Новое имя пользователя'),
                'old_password': openapi.Schema(type=openapi.TYPE_STRING, description='Текущий пароль'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='Новый пароль')
            },
            required=[],
        ),
        responses={200: 'Данные пользователя обновлены'}
    )
    def post(self, request):
        user = request.user
        new_username = request.data.get('newUsername')
        old_password = request.data.get('old_password')
        new_password = request.data.get('password')

        if not new_username and not new_password:
            return Response({'message': 'Нет данных для обновления.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password:
            if not old_password:
                return Response({'error': 'Необходимо указать текущий пароль для смены.'},
                                status=status.HTTP_400_BAD_REQUEST)
            if not user.check_password(old_password):
                return Response({'error': 'Неверный текущий пароль.'},
                                status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        if new_username:
            user.username = new_username

        try:
            user.save()
        except IntegrityError as e:
            error_message = str(e)
            if 'customuser_username_key' in error_message:
                return Response({'error': 'Пользователь с таким именем уже существует.'},
                                status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'Ошибка сохранения данных пользователя.'},
                                status=status.HTTP_400_BAD_REQUEST)

        update_session_auth_hash(request, user)

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


class GetMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })


class UserSearchView(APIView):
    """Полнотекстовый поиск пользователей"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Полнотекстовый поиск пользователей по username и email",
        manual_parameters=[],
        responses={200: UserListSerializer(many=True)}
    )
    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response([])

        search_vector = SearchVector("username", "email", config="simple")
        search_query = SearchQuery(query, config="simple")

        users = (
            CustomUser.objects
            .annotate(rank=SearchRank(search_vector, search_query))
            .filter(rank__gte=0.01)  # Может надо убрать, потому что из-за фильтрации может быть нулевой результат
            .exclude(id=request.user.id)
            .order_by("-rank")
            [:20]
        )

        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)
