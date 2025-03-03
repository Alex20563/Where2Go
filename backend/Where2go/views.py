from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
import pyotp
from rest_framework import generics
from .models import CustomUser
from .serializers import UserSerializer  # Убедитесь, что у вас есть сериализатор
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class Generate2FASecretView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        user.two_factor_secret = pyotp.random_base32()
        user.save()
        return Response({'secret': user.two_factor_secret}, status=status.HTTP_200_OK)

class Verify2FAView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        token = request.data.get('token')
        user = request.user
        totp = pyotp.TOTP(user.two_factor_secret)
        if totp.verify(token):
            return Response({'message': '2FA verification successful'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid 2FA token'}, status=status.HTTP_400_BAD_REQUEST)

class UserCreate(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
