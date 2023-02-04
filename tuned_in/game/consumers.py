import json
from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import async_to_sync


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
        message = text_data_json['message']
        username = text_data_json['username']

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'game_message',
                'message': message,
                'username': username
            }
        )
    
    async def game_message(self, event):
        message = event['message']
        username = event['username']
        await self.send(
            text_data=json.dumps({
                'message': message,
                'username': username
            })
        )

    