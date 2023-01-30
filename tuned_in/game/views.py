from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render

# Create your views here.
def game(request):
    return render(request, 'game/lobby.html')
