import json
from channels.generic.websocket import AsyncWebsocketConsumer
from api.models import Alias
from asgiref.sync import sync_to_async

@sync_to_async
def delete_all_aliases_in_room(room_code):
    Alias.objects.filter(room_code=room_code).all().delete()
    print('success')

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.group_name = f"room_{self.room_code}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

        await self.send(text_data=json.dumps({
            'type': 'connection_established',
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
            {
                'type': message_type,
                'data': data
            }
        )

    async def host_leave(self, event):
        room_code = event['data']['room_code']
        await delete_all_aliases_in_room(room_code)

        await self.send(text_data=json.dumps({
            'event_type': 'host_leave'
        }))
        
    async def game_message(self, event):
        message = event['message']
        username = event['username']
        await self.send(
            text_data=json.dumps({
                'message': message,
                'username': username
            })
        )

    