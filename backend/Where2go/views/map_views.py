# views.py
from django.http import JsonResponse
import requests
from django.conf import settings
import math
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView


class NearbyPlacesView(APIView):
    @swagger_auto_schema(
        operation_description="Получение ближайших мест по координатам.",
        manual_parameters=[
            openapi.Parameter('lat', openapi.IN_QUERY, description="Широта", type=openapi.TYPE_NUMBER, required=True),
            openapi.Parameter('lon', openapi.IN_QUERY, description="Долгота", type=openapi.TYPE_NUMBER, required=True),
            openapi.Parameter('radius', openapi.IN_QUERY, description="Радиус поиска в метрах",
                              type=openapi.TYPE_INTEGER, default=500),
            openapi.Parameter('category', openapi.IN_QUERY, description="Категория мест", type=openapi.TYPE_STRING,
                              default='кафе'),
            openapi.Parameter('min_rating', openapi.IN_QUERY, description="Минимальный рейтинг",
                              type=openapi.TYPE_NUMBER, default=4.0),
        ],
        responses={
            200: openapi.Response(
                description="Список ближайших мест",
                examples={
                    "application/json": {
                        "search_point": {
                            "lat": 55.7558,
                            "lon": 37.6173,
                            "radius": 500
                        },
                        "places": [
                            {
                                "name": "Кафе",
                                "address": "ул. Примерная, 1",
                                "rating": 4.5,
                                "reviews_count": 10,
                                "coordinates": {
                                    "lat": 55.7558,
                                    "lon": 37.6173
                                },
                                "distance": 100,
                                "2gis_link": "https://2gis.ru/maps?m=37.6173%2C55.7558&q=Кафе",
                                "direction_links": {
                                    "google": "https://www.google.com/maps/dir/?api=1&origin=55.7558,37.6173&destination=55.7558,37.6173",
                                    "yandex": "https://yandex.ru/maps/?rtext=55.7558%2C37.6173~55.7558%2C37.6173&rtt=auto"
                                }
                            }
                        ]
                    }
                }
            ),
            400: 'Неверные параметры'
        }
    )
    def get(self, request):
        # Парсим параметры
        try:
            base_lat = float(request.GET.get('lat'))
            base_lon = float(request.GET.get('lon'))
            radius = int(request.GET.get('radius', 500))  # метров
            category = request.GET.get('category', 'кафе')
            min_rating = float(request.GET.get('min_rating', 4.0))
        except (TypeError, ValueError) as e:
            return JsonResponse(
                {'error': 'Invalid parameters', 'details': str(e)},
                status=400
            )

        # Получаем места из 2GIS
        places = self._get_2gis_places(
            base_lat=base_lat,
            base_lon=base_lon,
            category=category,
            radius=radius,
            min_rating=min_rating
        )

        return JsonResponse({
            'search_point': {
                'lat': base_lat,
                'lon': base_lon,
                'radius': radius
            },
            'places': places
        })

    def _get_2gis_places(self, base_lat, base_lon, category, radius, min_rating):
        url = "https://catalog.api.2gis.com/3.0/items"

        params = {
            'q': category,
            'point': f"{base_lon},{base_lat}",
            'radius': radius,
            'type': 'branch',
            'fields': 'items.point,items.reviews,items.address',
            'key': settings.DGIS_API_KEY
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            results = []
            for item in data.get('result', {}).get('items', []):
                rating = item.get('reviews', {}).get('rating', 0)
                if rating >= min_rating:
                    place_lat = item['point']['lat']
                    place_lon = item['point']['lon']

                    # Рассчитываем расстояние от исходной точки
                    distance = self._calculate_distance(
                        base_lat, base_lon, place_lat, place_lon
                    )

                    results.append({
                        'name': item['name'],
                        'address': item.get('address_name'),
                        'rating': rating,
                        'reviews_count': item.get('reviews', {}).get('count', 0),
                        'coordinates': {
                            'lat': place_lat,
                            'lon': place_lon
                        },
                        'distance': distance,  # в метрах
                        '2gis_link': self._generate_2gis_link(place_lat, place_lon, item['name']),
                        'direction_links': {
                            'google': self._generate_direction_link(
                                'google', base_lat, base_lon, place_lat, place_lon),
                            'yandex': self._generate_direction_link(
                                'yandex', base_lat, base_lon, place_lat, place_lon)
                        }
                    })

            # Сортируем по расстоянию
            results.sort(key=lambda x: x['distance'])
            return results

        except requests.exceptions.RequestException as e:
            print(f"2GIS API error: {e}")
            return []

    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Расчет расстояния между точками (в метрах) по формуле гаверсинусов"""
        R = 6371000  # радиус Земли в метрах
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (math.sin(delta_phi / 2) ** 2 +
             math.cos(phi1) * math.cos(phi2) *
             math.sin(delta_lambda / 2) ** 2)
        return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

    def _generate_2gis_link(self, lat, lon, name):
        return (f"https://2gis.ru/maps?m={lon}%2C{lat}"
                f"&q={name.replace(' ', '%20')}")

    def _generate_direction_link(self, service, from_lat, from_lon, to_lat, to_lon):
        """Генерация ссылки на построение маршрута"""
        if service == 'google':
            return (f"https://www.google.com/maps/dir/?api=1"
                    f"&origin={from_lat},{from_lon}"
                    f"&destination={to_lat},{to_lon}")
        elif service == 'yandex':
            return (f"https://yandex.ru/maps/?rtext={from_lat}%2C{from_lon}"
                    f"~{to_lat}%2C{to_lon}&rtt=auto")
