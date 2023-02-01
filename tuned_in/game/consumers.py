import json
from channels.generic.websocket import WebsocketConsumer


class GameConsumer(WebsocketConsumer):
    def connect(self):
        room = self.scope['url_route']['kwargs']['room_code']
        self.accept()
        self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'You are now connected to room {room}'
        }))

    