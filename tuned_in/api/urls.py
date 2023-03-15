from django.urls import path
from .views import (
    RoomView, 
    CreateRoomView, 
    GetRoom, 
    JoinRoom, 
    UserInRoom, 
    LeaveRoom,
    SubmitPrompt,
    DeletePrompts, 
    UpdateRoom,
    GetCurrentPlayers,
    DeletePrompt,
    NextGamestate,
    UpdateReadyState
)

urlpatterns = [
    path('', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('get-room', GetRoom.as_view()),
    path('join-room', JoinRoom.as_view()),
    path('user-in-room', UserInRoom.as_view()),
    path('leave-room', LeaveRoom.as_view()),
    path('submit-prompt', SubmitPrompt.as_view()),
    path('delete-prompts', DeletePrompts.as_view()),
    path('update-room', UpdateRoom.as_view()),
    path('get-current-players', GetCurrentPlayers.as_view()),
    path('delete-prompt', DeletePrompt.as_view()),
    path('next-gamestate', NextGamestate.as_view()),
    path('update-ready-status', UpdateReadyState.as_view())
]
