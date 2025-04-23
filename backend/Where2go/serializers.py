from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import CustomUser, Group, PollOption, Poll


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'password',
            'email',
            'first_name',
            'last_name',
            'friends'
        ]
        extra_kwargs = {
            'email': {
                'validators': [UniqueValidator(queryset=CustomUser.objects.all(),
                                               message="A user with that email already exists.")]
            },
            'password': {'write_only': True},
            'friends': {'read_only': True},  # Друзей нельзя установить при создании
            'id': {'read_only': True}  # ID генерируется автоматически
        }

    def create(self, validated_data):
        user = CustomUser(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'admin', 'members', 'description']
        read_only_fields = ['admin']  # admin будет установлен автоматически

    def create(self, validated_data):
        # Создание группы с текущим пользователем как администратором
        user = self.context['request'].user
        group = Group.objects.create(
            name=validated_data['name'],
            admin=user,
            description=validated_data.get('description', '')
        )
        # Добавление участников, если они были указаны
        if 'members' in validated_data:
            group.members.set(validated_data['members'])
        # Добавление админа как участника группы
        group.members.add(user)
        return group


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserDetailSerializer(serializers.ModelSerializer):
    friends = UserListSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'friends']


class PollSerializer(serializers.ModelSerializer):
    results = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = ['id', 'group', 'creator', 'question', 'created_at', 'end_time', 'is_active', 'results',
                  'is_expired', 'has_voted']
        read_only_fields = ['creator', 'created_at']

    def get_results(self, obj):
        if obj.is_expired or not obj.is_active:
            return obj.get_results()
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data.pop('creator', None)
        poll = Poll.objects.create(**validated_data, creator=request.user)

        return poll

    def get_has_voted(self, obj):
        """Проверка, голосовал ли текущий пользователь за опрос"""
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.voted_users.filter(id=user.id).exists()
        return False


class ActivationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
