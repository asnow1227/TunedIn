from django.urls import path, include
from .views import index

app_name = 'frontend'

urlpatterns = [
    path('', index, name=''),
    path('join', index),
    path('create', index),
    path('create-prompts', index),
    path('room/<str:roomCode>', index),
    path('authenticate', index),
    path('select-song', index),
    path('embed', index),
    path('box', index),
    path('room/<str:roomCode>/host-timer', index),
    path('display-votes', index)
]