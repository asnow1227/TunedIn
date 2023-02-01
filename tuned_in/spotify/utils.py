from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post, put, get
import base64


def b64e(s):
    return base64.b64encode(s.encode()).decode()


BASE_URL = "https://api.spotify.com/v1/me/"

CLIENT_URL = "https://accounts.spotify.com/api/token"


def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    return None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)
    
    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=[
            'access_token',
            'refresh_token',
            'expires_in',
            'token_type'
        ])
    else:
        tokens = SpotifyToken(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            token_type=token_type
        )
        tokens.save()


def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)
        return True
    return False


def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tokens.access_token
    }

    if post_:
        post(BASE_URL + endpoint, headers=headers)

    if put_:
        put(BASE_URL + endpoint, headers=headers)
    
    response = get(BASE_URL + endpoint, {}, headers=headers)
   
    try:
        return response.json()
    except:
        return {'error': 'Issue with request'}


def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", put_=True)


def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", put_=True)


def skip_song(session_id):
    return execute_spotify_api_request(session_id, "player/next", post_=True)


def request_spotify_client_token():
    headers = {
        'Authorization': 'Basic ' + b64e(f"{CLIENT_ID}:{CLIENT_SECRET}"),
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    params = {
        'grant_type': 'client_credentials'
    }
    response = post(CLIENT_URL, headers=headers, params=params)
    return response

def get_or_refresh_spotify_client_token():
    tokens = SpotifyToken.objects.filter(user='client')
    if tokens and tokens[0].expires_in > timezone.now():
        return tokens[0]
    response = request_spotify_client_token()
    if not response.ok:
        return None
    data = response.json()
    access_token = data.get('access_token')
    expires_in = timezone.now() + timedelta(seconds=data.get('expires_in'))
    token_type = data.get('token_type')
    if not tokens:
        token = SpotifyToken(
            user='client',
            refresh_token='None',
            access_token=access_token,
            expires_in=expires_in,
            token_type=token_type
        )
        token.save()
    else:
        token = tokens[0]
        token.expires_in = expires_in
        token.token_type = token_type
        token.access_token = access_token
        token.save(update_fields=[
            'expires_in',
            'token_type',
            'access_token'
        ])
    return token



def get_songs(session_id, q, offset, limit):
    base = BASE_URL.replace('me', 'search')
    token = get_or_refresh_spotify_client_token()
    if not token:
        return None
    print(limit, offset)
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token.access_token
    }
    params = {
        "q": q,
        "type": "track",
        "limit": limit,
        "offset": offset
    }
    response = get(base, headers=headers, params=params).json()
    if not response.get('tracks'):
        return []
    items = response.get('tracks').get('items')
    formatted_items = [
        {
            'artist': ', '.join([
                artist.get('name') for artist in item.get('artists')
            ]),
            'image_url': item.get('album').get('images')[2].get('url'),
            'duration': item.get('duration_ms'),
            'title': item.get('name'),
            'id': item.get('id')
        }
        for item in items
    ]
    return formatted_items