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
from rest_framework.generics import ListAPIView, RetrieveAPIView, DestroyAPIView, RetrieveDestroyAPIView
from django.shortcuts import get_object_or_404

class CreatePollView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Создание нового опроса в группе",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['question', 'options'],
            properties={
                'question': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Вопрос опроса'
                ),
                'options': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'text': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='Текст варианта ответа'
                            )
                        }
                    ),
                    description='Список вариантов ответа'
                )
            }
        ),
        responses={
            201: PollSerializer,
            400: 'Неверный формат данных',
            403: 'Нет прав доступа'
        }
    )
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        if group.admin != request.user and request.user not in group.members.all():
            return Response({'error': 'Вы не являетесь участником этой группы.'}, 
                          status=status.HTTP_403_FORBIDDEN)

        # Добавляем группу в данные запроса
        data = request.data.copy()
        data['group'] = group_id

        serializer = PollSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        serializer.save(creator=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PollDetailView(RetrieveDestroyAPIView):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    @swagger_auto_schema(
        operation_description="Получение информации об опросе",
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description='ID опроса',
                type=openapi.TYPE_INTEGER,
                required=True
            )
        ],
        responses={
            200: PollSerializer,
            404: 'Опрос не найден'
        }
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Удаление опроса",
        responses={
            204: 'Опрос удален',
            403: 'Нет прав для удаления опроса',
            404: 'Опрос не найден'
        }
    )
    def delete(self, request, *args, **kwargs):
        poll = self.get_object()
        if poll.creator != request.user and poll.group.admin != request.user:
            return Response({'error': 'У вас нет прав для удаления этого опроса.'}, status=status.HTTP_403_FORBIDDEN)
        return super().delete(request, *args, **kwargs)

class ClosePollView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Закрытие опроса",
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description='ID опроса',
                type=openapi.TYPE_INTEGER,
                required=True
            )
        ],
        responses={
            200: 'Опрос успешно закрыт',
            403: 'Нет прав для закрытия опроса',
            404: 'Опрос не найден'
        }
    )
    def post(self, request, id):
        poll = get_object_or_404(Poll, id=id)
        if poll.creator != request.user and poll.group.admin != request.user:
            return Response({'error': 'У вас нет прав для закрытия этого опроса.'},
                          status=status.HTTP_403_FORBIDDEN)

        poll.is_active = False
        poll.save()
        return Response({'message': 'Опрос успешно закрыт.'}, status=status.HTTP_200_OK)

class PollListView(ListAPIView):
    serializer_class = PollSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Получение списка всех опросов в группе",
        manual_parameters=[
            openapi.Parameter(
                'group_id',
                openapi.IN_PATH,
                description='ID группы',
                type=openapi.TYPE_INTEGER,
                required=True
            )
        ],
        responses={
            200: PollSerializer(many=True),
            404: 'Группа не найдена'
        }
    )
#    def get(self, request, *args, **kwargs):
#        return super().get(request, *args, **kwargs)
    
    def get_queryset(self):
        group_id = self.kwargs['group_id']  
        return Poll.objects.filter(group_id=group_id) 

class VotePollView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['choices'],
            properties={
                'choices': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_INTEGER),
                    description='Список ID вариантов'
                )
            }
        )
    )
    def post(self, request, id):
        poll = get_object_or_404(Poll, id=id)
        
        # Проверки:
        if poll.is_expired:
            return Response({'error': 'Срок опроса истек'}, status=400)
        if request.user not in poll.group.members.all():
            return Response({'error': 'Вы не участник группы'}, status=403)
        if request.user in poll.voted_users.all():
            return Response({'error': 'Вы уже голосовали'}, status=403)

        choices = request.data.get('choices')
        if not choices:
            return Response({'error': 'Не выбраны варианты'}, status=400)

        # Голосование:
        for option_id in choices:
            option = get_object_or_404(poll.options, id=option_id)
            option.votes += 1
            option.save()
        
        poll.voted_users.add(request.user)
        return Response({'message': 'Голос учтён'}, status=200)

class PollResultsView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Получение результатов опроса",
        responses={
            200: PollSerializer,
            403: 'Нет прав для просмотра результатов',
            404: 'Опрос не найден'
        }
    )
    def get(self, request, id):
        poll = get_object_or_404(Poll, id=id)
        
        # Проверяем права на просмотр результатов
        if not (poll.is_expired or not poll.is_active or request.user == poll.creator 
                or request.user == poll.group.admin):
            return Response({'error': 'Результаты будут доступны после завершения опроса.'}, 
                          status=status.HTTP_403_FORBIDDEN)
            
        # Формируем данные для ответа
        results_data = poll.get_results()
        return Response(results_data)
