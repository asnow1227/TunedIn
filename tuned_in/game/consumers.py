import json
from channels.generic.websocket import AsyncWebsocketConsumer
from api.models import Alias, Prompt, Room
from asgiref.sync import sync_to_async
import asyncio
import math


@sync_to_async
def update_gamestate(room_code, gamestate):
    room_set = Room.objects.filter(room_code=room_code)
    if room_set.exists():
        room = room_set[0]
        room.gamestate = gamestate
        room.save(update_fields=['gamestate'])


@sync_to_async
def get_timer(room_code):
    room_set = Room.objects.filter(code=room_code)
    if room_set.exists():
        room = room_set[0]
        return room.current_timer or 0, room.song_selection_timer
    return None, None


def jsonSocketMessage(message_type, data=None):
    return json.dumps(SocketMessage(message_type, data=data))


@sync_to_async
def save_current_timer(room_code, timer):
    room_set = Room.objects.filter(code=room_code)
    if room_set.exists():
        room = room_set[0]
        room.current_timer = timer
        room.save()


class SocketMessage(dict):
    def __init__(self, message_type, data=None):
        super().__init__()
        self['type'] = message_type
        if data is None:
            data = {}
        self['data'] = data


@sync_to_async
def clear_room_data(room_code):
    Room.objects.filter(code=room_code).all().delete()
    Alias.objects.filter(room_code=room_code).all().delete()
    Prompt.objects.filter(room_code=room_code).all().delete()


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.group_name = f"room_{self.room_code}"
        self.stop_timer = asyncio.Event()

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

        await self.send(text_data=jsonSocketMessage('connection_established', data={
            'message': f'You are now connected to room {self.room_code}'
        }))

    async def disconnect(self, close_code):
        self.stop_timer.set()
        if hasattr(self, 'timer'):
            await save_current_timer(self.room_code, self.timer)

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        if message_type == 'start_host_timer':
            self.stop_timer.clear()
            await self.start_host_timer()
            return
        
        if message_type == 'kill_host_timer':
            # the timer will be set when we call this method, or disconnect
            self.stop_timer.set()
            return
        
        data = text_data_json['data']

        await self.channel_layer.group_send(
            self.group_name,
            SocketMessage(message_type, data)
        )

    async def start_host_timer(self):
        self.timer_task = asyncio.create_task(self._start_host_timer())

    async def _start_host_timer(self):
        self.timer, timer_max = await get_timer(self.room_code)
        while self.timer < timer_max:
            await asyncio.sleep(1)
            self.timer += 1
            if not self.stop_timer.is_set():
                ## this is to prevent firing another send after the socket object has disconnected and then reconnected immediately (e.g. on page refresh)
                await self.channel_layer.group_send(
                    self.group_name,
                    SocketMessage('host_timer', {'timer': math.floor(( self.timer / timer_max) * 100)})
                )
        # once the timer reaches max, the host will call updateGamestate from the frontend
    
    async def host_timer(self, event):
        timer = event['data']['timer']
        await self.send(text_data=jsonSocketMessage('host_timer', data={
            'timer': timer
        }))

    async def host_leave(self, event):
        room_code = event['data']['room_code']
        await clear_room_data(room_code)

        await self.send(text_data=jsonSocketMessage('host_leave'))
        
    async def message(self, event):
        username = event['data']['username']
        await self.send(
            text_data=jsonSocketMessage('message', data={
                'username': username
            })
        )

    async def player_add(self, event):
        player = event['data']['player']
        player.pop('isWaiting', None)
        
        await self.send(
            text_data=jsonSocketMessage('player_add', data={
                'player': player
            })
        )

    async def player_leave(self, event):
        id = event['data']['id']
        await self.send(
            text_data=jsonSocketMessage('player_leave', data={
                'id': id
            })
        )

    async def gamestate_update(self, event):
        gamestate = event['data']['gamestate']
        await self.send(
            text_data=jsonSocketMessage('gamestate_update', data={
                'gamestate': gamestate
            })
        )
    
    async def check_user_authenticated(self, event):
        player_id = event['data']['player_id']
        await self.send(
            text_data=jsonSocketMessage('check_user_authenticated', data={
                'player_id': player_id
            })
        )

    async def user_logout_spotify(self, event):
        player_id = event['data']['player_id']
        await self.send(
            text_data=jsonSocketMessage('user_logout_spotify', data={
                'player_id': player_id
            })
        )
    
    async def player_update(self, event):
        player_id = event['data'].pop('player_id')
        await self.send(
            text_data=jsonSocketMessage('player_update', data={
                'player_id': player_id,
                'updates': event['data']
            })
        )

    async def settings_update(self, event):
        settings = event['data']
        await self.send(
            text_data=jsonSocketMessage('settings_update', data=settings)
        )
    