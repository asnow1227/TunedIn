from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 
            'votes_to_skip', 'created_at')


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        #ensures that when we send a post request, these fields are handled and included
        fields = ('guest_can_pause', 'votes_to_skip')