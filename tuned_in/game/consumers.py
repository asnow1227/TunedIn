import json
from channels.generic.websocket import AsyncWebsocketConsumer
from api.models import Alias, Prompt
from asgiref.sync import sync_to_async


@sync_to_async
def update_gamestate(room_code, gamestate):
    room_set = Room.objects.filter(room_code=room_code)
    if room_set.exists():
        room = room[0]
        room.gamestate = gamestate
        room.save(update_fields=['gamestate'])


def jsonSocketMessage(message_type, data=None):
    return json.dumps(SocketMessage(message_type, data=data))


class SocketMessage(dict):
    def __init__(self, message_type, data=None):
        super().__init__()
        self['type'] = message_type
        if data is None:
            data = {}
        self['data'] = data


@sync_to_async
def clear_room_data(room_code):
    Alias.objects.filter(room_code=room_code).all().delete()
    Prompt.objects.filter(room_code=room_code).all().delete()
    print('success')


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.group_name = f"room_{self.room_code}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

        await self.send(text_data=jsonSocketMessage('connection_established', data={
            'message': f'You are now connected to room {self.room_code}'
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        data = text_data_json['data']

        await self.channel_layer.group_send(
            self.group_name,
            SocketMessage(message_type, data)
        )

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
        alias = event['data']['alias']
        await self.send(
            text_data=jsonSocketMessage('player_add', data={
                'alias': alias
            })
        )

    async def player_leave(self, event):
        alias = event['data']['alias']
        await self.send(
            text_data=jsonSocketMessage('player_leave', data={
                'alias': alias
            })
        )

    async def gamestate_update(self, event):
        gamestate = event['data']['gamestate']
        await self.send(
            text_data=jsonSocketMessage('gamestate_update', data={
                'gamestate': gamestate
            })
        )
    

    