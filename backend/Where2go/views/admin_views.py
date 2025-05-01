from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import CustomUser, Group
from ..serializers import GroupSerializer, UserSerializer


class UserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден."}, status=status.HTTP_404_NOT_FOUND
            )


class UserBanView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            user.is_active = False  # Блокируем пользователя
            user.save()
            return Response(
                {"message": "Пользователь заблокирован."}, status=status.HTTP_200_OK
            )
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден."}, status=status.HTTP_404_NOT_FOUND
            )


class GroupListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        groups = Group.objects.all()
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)


class GroupEditView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            serializer = GroupSerializer(group, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Group.DoesNotExist:
            return Response(
                {"error": "Группа не найдена."}, status=status.HTTP_404_NOT_FOUND
            )


class GroupDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            group.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Group.DoesNotExist:
            return Response(
                {"error": "Группа не найдена."}, status=status.HTTP_404_NOT_FOUND
            )


class UserSessionDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            Token.objects.filter(user=user).delete()
            return Response(
                {"message": "Все сессии пользователя завершены."},
                status=status.HTTP_200_OK,
            )
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден."}, status=status.HTTP_404_NOT_FOUND
            )
