from django.urls import path
from .views import (
    AuthURL, 
    spotify_callback, 
    IsAuthenticated, 
    CurrentSong,
    PauseSong,
    PlaySong,
    SkipSong,
    GetSongs,
    GetOembed,
    GetTrack,
    LogoutSpotify
)

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('pause', PauseSong.as_view()),
    path('play', PlaySong.as_view()),
    path('skip', SkipSong.as_view()),
    path('get-songs', GetSongs.as_view()),
    path('get-oembed', GetOembed.as_view()),
    path('get-track', GetTrack.as_view()),
    path('logout', LogoutSpotify.as_view())
]
