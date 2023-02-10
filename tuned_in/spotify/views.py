from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from .models import SpotifyToken
from api.models import Room
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .utils import (
    update_or_create_user_tokens, 
    is_spotify_authenticated,
    execute_spotify_api_request,
    pause_song,
    play_song,
    skip_song,
    get_songs,
    get_oembed,
    get_track
)

# Create your views here.
class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url
        print(url)
        return Response({'url': url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({'Ivalid Request': 'User not currently in a room'}, status=status.HTTP_400_BAD_REQUEST)
        host = room.host
        if not is_spotify_authenticated(host):
            return Response({'Invalid Request': 'Host not Currently Authenticated'}, status=status.HTTP_400_BAD_REQUEST)
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        # artist_string = ""

        artists = [artist.get('name') for artist in item.get('artists')]
        artist_string = ', '.join(artists)

        # for i, artist in enumerate(item.get('artist')):
        #     if i > 0:
        #         artist_string += ', '
        #     name = artist.get('name')
        #     artist_string += name

        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': 0,
            'id': song_id
        }


        return Response(song, status=status.HTTP_200_OK)


class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if self.request.session.session_key == room.host:
            skip_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class GetTrack(APIView):
    def get(self, request, format=None):
        track_id = request.GET.get('id')
        return Response({'data': get_track(track_id)}, status=status.HTTP_200_OK)
    pass

class GetSongs(APIView):
    def get(self, request, format=None):
        q = request.GET.get('query')
        page = int(request.GET.get('page'))
        if request.GET.get('limit') is None:
            limit = 0
        else:
            limit = int(request.GET.get('limit'))
        offset = (page - 1) * limit

        if not q:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
            
        data = get_songs(q, offset, limit)
        if data is None:
            return Response({'Bad Request': 'No Client Auth Token Found'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'data': data}, status=status.HTTP_200_OK)


class GetOembed(APIView):
    def get(self, request, format=None):
        return Response({'data' : get_oembed()}, status=status.HTTP_200_OK)