from django.urls import path
from .views import (
    RoomView, 
    CreateRoomView, 
    GetRoom, 
    JoinRoom, 
    UserInRoom, 
    LeaveRoom,
    SubmitPrompts,
    NextGamestate,
    ReadyUp,
    GetPrompts,
    SubmitSongSelections,
    ClearRoomSession
)

urlpatterns = [
    path('', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('get-room', GetRoom.as_view()),
    path('join-room', JoinRoom.as_view()),
    path('user-in-room', UserInRoom.as_view()),
    path('leave-room', LeaveRoom.as_view()),
    path('submit-prompts', SubmitPrompts.as_view()),
    path('next-gamestate', NextGamestate.as_view()),
    path('ready-up', ReadyUp.as_view()),
    path('prompt', GetPrompts.as_view()),
    path('submit-song-selections', SubmitSongSelections.as_view()),
    path('clear-room-session', ClearRoomSession.as_view())
]
