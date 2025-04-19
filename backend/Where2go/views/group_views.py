from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import CustomUser, Group
from ..serializers import GroupSerializer
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.shortcuts import get_object_or_404


class CreateGroupView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Создание новой группы",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='Название группы'),
                'members': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_INTEGER),
                    description='Список ID участников группы'
                ),
                'description': openapi.Schema(type=openapi.TYPE_STRING, description='Описание группы')
            }
        ),
        responses={
            201: GroupSerializer,
            400: 'Ошибка в данных',
            401: 'Неавторизованный доступ'
        }
    )
    def post(self, request):
        serializer = GroupSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            group = serializer.save()
            return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JoinGroupView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Присоединение к группе",
        responses={200: 'Вы вступили в группу'}
    )
    def post(self, request, group_id):
        group = Group.objects.get(id=group_id)
        user = request.user
        group.members.add(user)
        return Response({'message': 'Вы вступили в группу.'}, status=status.HTTP_200_OK)


class LeaveGroupView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Выход из группы",
        responses={200: 'Вы покинули группу'}
    )
    def post(self, request, group_id):
        group = Group.objects.get(id=group_id)
        user = request.user
        group.members.remove(user)
        return Response({'message': 'Вы покинули группу.'}, status=status.HTTP_200_OK)


class ManageGroupView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Управление группой",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='Новое имя группы')
            }
        ),
        responses={200: 'Группа обновлена'}
    )
    def post(self, request, group_id):
        group = Group.objects.get(id=group_id)
        if group.admin != request.user:
            return Response({'error': 'Вы не являетесь администратором этой группы.'}, status=status.HTTP_403_FORBIDDEN)

        # Логика управления группой (например, изменение имени группы)
        new_name = request.data.get('name')
        if new_name:
            group.name = new_name
            group.save()
            return Response({'message': 'Группа обновлена.'}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Удаление группы",
        responses={204: 'Группа расформирована'}
    )
    def delete(self, request, group_id):
        group = Group.objects.get(id=group_id)
        if group.admin != request.user:
            return Response({'error': 'Вы не являетесь администратором этой группы.'}, status=status.HTTP_403_FORBIDDEN)

        group.delete()
        return Response({'message': 'Группа расформирована.'}, status=status.HTTP_200_OK)


# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# Swagger
# Группы согласнно доку
class GroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Создание группы
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            group = serializer.save(admin=request.user)  # Устанавливаем текущего пользователя как администратора
            # Отправка письма участникам
            members = request.data.get('members', [])
            for member_id in members:
                member = get_object_or_404(CustomUser, id=member_id)
                send_mail(
                    'Приглашение в группу',
                    f'Вы были добавлены в группу: {group.name}. Ссылка на группу: http://localhost:8000/groups/{group.id}/',
                    'where2go-verification@yandex.ru',
                    [member.email],
                    fail_silently=False,
                )
            return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        # Добавление участника
        group = get_object_or_404(Group, id=group_id)
        user_id = request.data.get('user_id')
        member = get_object_or_404(CustomUser, id=user_id)
        group.members.add(member)
        return Response({'message': 'Участник добавлен.'}, status=status.HTTP_200_OK)

    def delete(self, request, group_id):
        # Удаление участника
        group = get_object_or_404(Group, id=group_id)
        user_id = request.data.get('user_id')
        member = get_object_or_404(CustomUser, id=user_id)
        group.members.remove(member)
        return Response({'message': 'Участник удален.'}, status=status.HTTP_200_OK)


class DeleteGroupView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Удаление группы",
        responses={
            204: 'Группа успешно удалена',
            403: 'Нет прав для удаления группы'
        }
    )
    def delete(self, request, group_id):
        # Логика удаления группы
        group = get_object_or_404(Group, id=group_id)
        if group.admin != request.user:
            return Response({'error': 'У вас нет прав для удаления этой группы.'}, status=status.HTTP_403_FORBIDDEN)

        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ListUserGroupsView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Получение списка групп, в которых состоит пользователь",
        responses={200: GroupSerializer(many=True)}
    )
    def get(self, request):
        user = request.user
        groups = Group.objects.filter(members=user)
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GroupDetailView(APIView):

    @swagger_auto_schema(
        operation_description="Получение информации о группе по ID",
        responses={200: GroupSerializer()}
    )
    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = GroupSerializer(group)
        return Response(serializer.data)