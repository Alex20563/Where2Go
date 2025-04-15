from rest_framework import serializers
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


class PollOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollOption
        fields = ['id', 'text', 'votes']


class PollOptionResultSerializer(serializers.ModelSerializer):
    percentage = serializers.FloatField()

    class Meta:
        model = PollOption
        fields = ['id', 'text', 'votes', 'percentage']


class PollSerializer(serializers.ModelSerializer):
    options = PollOptionSerializer(many=True)
    results = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    total_votes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Poll
        fields = ['id', 'group', 'creator', 'question', 'options', 'created_at', 'end_time', 'is_active', 'results',
                  'is_expired', 'total_votes']
        read_only_fields = ['creator', 'created_at']

    def get_results(self, obj):
        if obj.is_expired or not obj.is_active:
            return obj.get_results()
        return None

    def create(self, validated_data):
        options_data = validated_data.pop('options')
        poll = Poll.objects.create(**validated_data)

        for option_data in options_data:
            option = PollOption.objects.create(text=option_data['text'])
            poll.options.add(option)

        return poll
