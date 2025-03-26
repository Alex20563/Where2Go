from rest_framework import serializers
from .models import CustomUser, Group

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'email']  # Шо еще добавить?
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser(**validated_data)
        user.set_password(validated_data['password'])  # Надо пароль в зашифрованном виде
        user.save()
        return user

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'admin', 'members', 'description']
        read_only_fields = ['admin']  # admin будет установлен автоматически

    def create(self, validated_data):
        # Получаем текущего пользователя из контекста
        user = self.context['request'].user
        # Создаем группу с текущим пользователем как админом
        group = Group.objects.create(
            name=validated_data['name'],
            admin=user,
            description=validated_data.get('description', '')
        )
        # Добавляем участников, если они были указаны
        if 'members' in validated_data:
            group.members.set(validated_data['members'])
        # Добавляем админа как участника группы
        group.members.add(user)
        return group
