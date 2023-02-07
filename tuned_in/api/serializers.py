from rest_framework import serializers
from .models import Room, Prompt, Alias

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = (
            'id', 
            'code', 
            'host', 
            'created_at'
        )


class CreateOrJoinRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alias
        #ensures that when we send a post request, these fields are handled and included
        fields = (
            'alias',
            'room_code'
        )


class SubmitPromptsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prompt
        fields = (
            'prompt_text',
            'prompt_key',
        )

class UpdateRoomSerializer(serializers.ModelSerializer):
    #allows us to get away with code not being unique
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        #ensures that when we send a post request, these fields are handled and included
        fields = ('guest_can_pause', 'votes_to_skip', 'code')

    
class SubmitAliasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alias
        fields = (
            'alias'
        )