from django.http import JsonResponse
from rest_framework.views import APIView

POPULAR_CATEGORIES = [
    'кафе', 'ресторан', 'аптека', 'магазин', 'банк', 'школа', 'больница',
    'кинотеатр', 'парк', 'автостоянка', 'фитнес', 'супермаркет'
]


class PlaceCategoriesView(APIView):
    def get(self, request):
        return JsonResponse({'categories': POPULAR_CATEGORIES})
