from django.http import JsonResponse
from rest_framework.views import APIView

POPULAR_CATEGORIES = [
    "кафе",
    "ресторан",
    "магазин",
    "банк",
    "больница",
    "кинотеатр",
    "парк",
    "автостоянка",
    "фитнес",
    "супермаркет",
    "бар",
]


class PlaceCategoriesView(APIView):
    def get(self, request):
        return JsonResponse(
            {"categories": POPULAR_CATEGORIES},
            json_dumps_params={"ensure_ascii": False},
        )
