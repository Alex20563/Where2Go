"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView
from Where2go.views import UserCreate, LoginView, Generate2FASecretView, UpdateUserView, CreateGroupView, JoinGroupView, LeaveGroupView, ManageGroupView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Where2go-api",
        default_version='v1',
        description="API documentation for Where2go project",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@Where2go.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', UserCreate.as_view(), name='user-register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/generate-2fa-secret/', Generate2FASecretView.as_view(), name='generate-2fa-secret'),
    path('api/update-user/', UpdateUserView.as_view(), name='update-user'),
    path('api/create-group/', CreateGroupView.as_view(), name='create-group'),
    path('api/join-group/<int:group_id>/', JoinGroupView.as_view(), name='join-group'),
    path('api/leave-group/<int:group_id>/', LeaveGroupView.as_view(), name='leave-group'),
    path('api/manage-group/<int:group_id>/', ManageGroupView.as_view(), name='manage-group'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # Обслуживание Vue.js приложения
    re_path(r'^$', TemplateView.as_view(template_name='index.html')),
    re_path(r'^(?!api/).*$', TemplateView.as_view(template_name='index.html')),
]

