from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .map_views import NearbyPlacesView
from ..models import Group, Poll
from ..serializers import PollSerializer
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.generics import ListAPIView, RetrieveDestroyAPIView, UpdateAPIView
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

        serializer = PollSerializer(data=data, context={'request': request})
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

        # Вычисляем среднюю точку
        average_point = poll.calculate_average_point()

        return Response({'message': 'Опрос успешно закрыт.', 'average_point': average_point}, status=status.HTTP_200_OK)


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


class PollListAllView(ListAPIView):
    serializer_class = PollSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Получение списка всех опросов",
        responses={
            200: PollSerializer(many=True),
        }
    )
    def get_queryset(self):
        return Poll.objects.all()


class VotePollView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['coordinates'],
            properties={
                'coordinates': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    required=['lat', 'lon', 'categories'],
                    properties={
                        'lat': openapi.Schema(type=openapi.TYPE_NUMBER, description='Широта'),
                        'lon': openapi.Schema(type=openapi.TYPE_NUMBER, description='Долгота'),
                        'categories': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Items(type=openapi.TYPE_STRING),
                            description='Категории (например, кафе, бар)'
                        )
                    },
                    description='Координаты и категории пользователя'
                )
            }
        )
    )
    def post(self, request, id):
        poll = get_object_or_404(Poll, id=id)

        # Проверки
        if poll.is_expired:
            return Response({'error': 'Срок опроса истек'}, status=400)
        if request.user not in poll.group.members.all():
            return Response({'error': 'Вы не участник группы'}, status=403)
        if request.user in poll.voted_users.all():
            return Response({'error': 'Вы уже голосовали'}, status=403)

        coordinates = request.data.get('coordinates')
        if not coordinates:
            return Response({'error': 'Координаты не предоставлены'}, status=400)

        # Проверим наличие обязательных полей
        if not all(k in coordinates for k in ('lat', 'lon', 'categories')):
            return Response({'error': 'lat, lon и categories обязательны'}, status=400)

        if not isinstance(coordinates['categories'], list):
            return Response({'error': 'categories должен быть списком'}, status=400)

        # Голосование:
        poll.voted_users.add(request.user)

        # Сохраняем координаты
        poll.coordinates.append(coordinates)
        poll.save()

        return Response({'message': 'Голос учтён'}, status=200)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class PollResultsView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Получение результатов опроса",
        responses={
            200: openapi.Response(
                description='Результаты опроса и список подходящих мест',
                examples={
                    'application/json': {
                        "total_votes": 5,
                        "average_point": {"lat": 55.75, "lon": 37.62},
                        "most_popular_category": "кафе",
                        "places": [
                            {"name": "Кафе 'Вкусно'", "lat": 55.751, "lon": 37.618},
                            {"name": "Кафе 'Кофейня'", "lat": 55.749, "lon": 37.622}
                        ]
                    }
                }
            ),
            403: 'Нет прав для просмотра результатов',
            404: 'Опрос не найден'
        }
    )
    def get(self, request, id):
        poll = get_object_or_404(Poll, id=id)

        # Проверка прав
        if not (poll.is_expired or not poll.is_active or request.user == poll.creator
                or request.user == poll.group.admin):
            return Response({'error': 'Результаты будут доступны после завершения опроса.'},
                            status=status.HTTP_403_FORBIDDEN)

        results_data = poll.get_results()
        lat, lon = results_data['average_point']
        category = results_data['most_popular_category']

        # Создаём экземпляр NearbyPlacesView
        nearby_view = NearbyPlacesView()

        # TODO: так плохо делать, надо вынести эту функцию из класса, так как это приватный метод
        places = nearby_view._get_2gis_places(
            base_lat=lat,
            base_lon=lon,
            category=category,
            radius=500,
            min_rating=4.0
        )

        return Response({
            'results': results_data,
            'recommended_places': places
        })


class PollUpdateView(UpdateAPIView):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Обновление вопроса или времени окончания опроса",
        responses={
            200: PollSerializer(),
            403: 'Нет прав на редактирование опроса',
            404: 'Опрос не найден',
            400: 'Неверные данные'
        }
    )
    def patch(self, request, *args, **kwargs):
        poll = self.get_object()

        if poll.creator != request.user:
            return Response({'error': 'У вас недостаточно прав для обновления опроса.'},
                            status=status.HTTP_403_FORBIDDEN)

        return super().patch(request, *args, **kwargs)
