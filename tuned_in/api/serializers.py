from rest_framework import serializers
from .models import Room, Prompt

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


class SubmitPromptsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prompt
        fields = (
            'prompt_text',
            'prompt_key',
        )

class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        #ensures that when we send a post request, these fields are handled and included
        fields = ('guest_can_pause', 'votes_to_skip', 'code')