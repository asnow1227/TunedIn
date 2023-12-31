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
    SubmitSongSelection,
    ClearRoomSession,
    CheckUserAuthenticated,
    GetAvailableAvatars,
    SetPlayerAvatarUrl,
    PlayerLeave,
    UpdateSettings,
    VotingRound
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
    path('submit-song-selection', SubmitSongSelection.as_view()),
    path('clear-room-session', ClearRoomSession.as_view()),
    path('check-user-authenticated', CheckUserAuthenticated.as_view()),
    path('available-avatars', GetAvailableAvatars.as_view()),
    path('select-avatar', SetPlayerAvatarUrl.as_view()),
    path('player-leave', PlayerLeave.as_view()),
    path('update-settings', UpdateSettings.as_view()),
    path('voting-round', VotingRound.as_view())
]
