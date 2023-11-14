from django.shortcuts import render
from rest_framework import generics, status
from .serializers import (
    RoomSerializer, 
    CreateOrJoinRoomSerializer, 
    SubmitPromptsSerializer,
    UpdateRoomSerializer
)
from .models import Room, Prompt, Alias, PromptAssignments
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
import django
import json
from game.gamestate import GameState
from decorator import decorator
from .exceptions import RoomNotReadyError
from .utils import update_gamestate
from spotify.utils import is_spotify_authenticated


# convenience method to clear room data on host leave
def clear_all_room_data(room):
    for model in (Prompt, Alias):
        model.objects.filter(room_code=room.code).all().delete()
    room.delete()


# convenience method to clear the given user data if they leave
def clear_all_user_data(user):
    for model in (Prompt, Alias):
        model.objects.filter(user=user).all().delete()


@decorator
def check_request_key_and_room_status(fn, self, *args, **kwargs):
    if not self.request.session.session_key:
        self.request.session.create()
        return Response({
            'Invalid Request': 'No Session Recorded for User'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    room_code = self.request.session.get('room_code')
    if room_code is None:
        return Response({
            'Invalid Request': 'User not in Room'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    room_set = Room.objects.filter(code=room_code)
    if not room_set.exists():
        return Response({
            'Invalid Request': 'Room does not Exist'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    kwargs['room'] = room_set[0]

    return fn(self, *args, **kwargs)


# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


# view for creating a room
class CreateRoomView(APIView):
    #APIView allows us to overwrite request methods, e.g get, post
    serializer_class = CreateOrJoinRoomSerializer
    
    def post(self, request, format=None):
        # call post on this view to create the room 
        
        # if no session exists for the current user, create one
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # grab the alias name from the packet recieved
        alias_name = request.data.get('alias')
        # if no alias is provided, return a bad request
        if alias_name is None:
            return Response({
                'Bad Request': 'No Alias provided for User'
            }, status=status.HTTP_400_BAD_REQUEST)

        # host is the user requesting to create a room
        host = self.request.session.session_key
        room_query_set = Room.objects.filter(host=host)
        # if we are hosting other rooms, clear the other rooms data 
        # for now this is a hack so that we only have one room at a time, we need to have a process that clears the data 
        # for expired sessions every so often from the backend
        if room_query_set.exists():
            for room in room_query_set:
                clear_all_room_data(room)
        clear_all_user_data(host)
        
        # create the room object with the requesting user as the host and save it
        room = Room(host=host)
        room.save()
        request.data['room_code'] = room.code
        # add a 'room_code' key to the request.data dictionary so it can be accessed easily by other 
        # methods
        
        # validate the data with the serializer
        if self.serializer_class(data=request.data).is_valid():
            # create the alias for the user and save it
            alias = Alias(user=host, room_code=room.code, alias=alias_name)
            alias.save()
            # add the room code and alias to the request session object for ease of access
            self.request.session['room_code'] = room.code
            self.request.session['alias'] = alias.alias
            is_authenticated, _ = is_spotify_authenticated(host)
            # return the room data back to the client
            return Response({
                    'roomCode': room.code,
                    'isAuthenticated': is_authenticated
                }, 
                status=status.HTTP_200_OK
            )
        
        # if the data is not valid through the serializer, send a response back that it's a bad request
        return Response({'Bad Request': 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST)


class CheckUserAuthenticated(APIView):
    def get(self, request):
        player_id = request.GET.get('id')
        if player_id is None:
            return Response({'status': False, 'spotify_details': {}}, status=status.HTTP_200_OK)
        players = Alias.objects.filter(id=player_id)
        if not players:
            return Response({'status': False, 'spotify_details': {}}, status=status.HTTP_200_OK)
        player_alias = players[0]
        is_authenticated, spotify_meta = is_spotify_authenticated(player_alias.user)
        
        return Response({'status': is_authenticated, 'spotify_details': spotify_meta}, status=status.HTTP_200_OK)

def get_player(player_alias, host_id):
    is_authenticated, spotify_meta = is_spotify_authenticated(player_alias.user)
    player = {
        'id': player_alias.id,
        'isReady': player_alias.ready,
        'isHost': player_alias.user == host_id,
        'alias': player_alias.alias,
        'isAuthenticated': is_authenticated
    }
    if spotify_meta:
        player.update(spotify_meta)
    return player

# view to get details about the room
class GetRoom(APIView):
    serializer_class = RoomSerializer

    def get(self, request, format=None):
        code = request.GET.get('code')
        if code is None:
            # if no code provided in the get request, return a bad request
            return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST) 
        
        room_set = Room.objects.filter(code=code)
        # if no room found, return a bad request
        if not room_set.exists():
            return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        
        room = room_set[0]
        current_players = Alias.objects.filter(room_code=room.code).all()
        user_alias = [alias for alias in current_players if alias.user == self.request.session.session_key][0]
        # user_id = user_alias.id
        # others = 
        # players = [player_alias.alias]
        # players.extend([alias.alias for alias in current_players if alias.alias != player_alias.alias])
        # data = {
        #     'is_ready': player_alias.ready,
        #     'is_host': self.request.session.session_key == room.host,
            # 'is_waiting': player_alias.ready and any([not alias.ready for alias in current_players if alias.alias != player_alias.alias]) and room.gamestate != Room.GameState.QUEUE,
        #     'gamestate': room.gamestate,
        #     'players': players
        # }

        data = {
            'gamestate': room.gamestate,
            'user': get_player(user_alias, room.host),
            'players': [get_player(player_alias, room.host) for player_alias in current_players if player_alias.user != user_alias.user]
        }
  
        return Response(data, status=status.HTTP_200_OK)
        
# view to join the room
class JoinRoom(APIView):

    def post(self, request, format=None):
        # if the session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # get the room code from the request data
        room_code = request.data.get('room_code')
        
        # no room code was provided return a bad request.
        if room_code is None:
            return Response({
                'type': 'room_code',
                'message': 'Room Not Found'
            }, status=status.HTTP_200_OK)
        
        # get the room objects that match the code (should be one)
        room_result = Room.objects.filter(code=room_code)
        
        # if no rooms, return a bad response
        if not room_result.exists():
            return Response({
                'type': 'room_code',
                'message': 'Room Not Found'
        }, status=status.HTTP_400_BAD_REQUEST)

        # clear the current user's data before fetching any user related data
        # this is a hack and prevents user's from being in multiple rooms at once
        # may need a workaround for this
        clear_all_user_data(self.request.session.session_key)
        
        # try to create the alias on the given room
        try:
            alias = Alias(
                user=self.request.session.session_key,
                alias=request.data.get('alias'),
                room_code=room_code
            )
            alias.save()
        # if the same alias exists in the room, return a bad response
        except django.db.utils.IntegrityError:
            return Response({
                'type': 'alias',
                'message': 'Alias exists in Room'
        }, status=status.HTTP_400_BAD_REQUEST)

        # set the room code for the user's session
        self.request.session['room_code'] = room_code
        is_authenticated, _ = is_spotify_authenticated(self.request.session.session_key)
        # return a success response
        return Response({'isAuthenticated': is_authenticated}, status=status.HTTP_200_OK)
    

class UserInRoom(APIView):
    # view to check if a user is in a room. Used to validate joining a room.
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            # if there is no session key, create the session one
            self.request.session.create()
        # if the user has joined a room, we would have stored the room_code on the 
        # session object. Send this back to the client as a response.
        room_code = self.request.session.get('room_code')
        user_id = None
        is_host = None
        if room_code:
            room_set = Room.objects.filter(code=room_code)
            alias_set = Alias.objects.filter(user=self.request.session.session_key, room_code=room_code)
            if room_set.exists:
                room = room_set[0]
                is_host = room.host == self.request.session.session_key
            if alias_set.exists:
                user_id = alias_set[0].id
        
        data = {
            'code': self.request.session.get('room_code'),
            'id': user_id,
            'isHost': is_host
        }
        
        return JsonResponse(data, status=status.HTTP_200_OK)


class ClearRoomSession(APIView):
    def post(self, request, format=None):
        self.request.session.pop('room_code', None)
        return Response({'Success': 'Request Successful'}, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    # view to leave a room
    @check_request_key_and_room_status
    def post(self, request, format=None, room=None):
        room_code = room.code
        session_id = self.request.session.session_key
        room_results = Room.objects.filter(host=session_id)
        # clear the room and alias results if they exist
        if len(room_results) > 0:
            room = room_results[0]
            room.delete()
        alias_results = Alias.objects.filter(user=session_id, room_code=room_code)
        if len(alias_results) > 0:
            alias = alias_results[0]
            alias.delete()

        self.request.session.pop('room_code')
            
        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)


class SubmitPrompts(APIView):

    @check_request_key_and_room_status
    def post(self, request, format=None, **kwargs):
        room = kwargs.get('room')
        prompts = self.request.data
        print(prompts)
        if not prompts:
            return Response({'Bad Request': 'Invalid Post Data'}, status=status.HTTP_400_BAD_REQUEST)

        user = self.request.session.session_key
        for prompt in prompts:
            prompt_text = prompt.get('text')
            prompt_key = prompt.get('key')
            prompt_found = Prompt.objects.filter(
                user=user,
                prompt_key=prompt.get('key'),
                room_code=room.code
            )

            if prompt_found:
                prompt = prompt_found[0]
                prompt.prompt_text = prompt_text
                prompt.save()
            else:
                prompt = Prompt(
                    user=user, 
                    room_code=room.code, 
                    prompt_text=prompt_text,
                    prompt_key=prompt_key
                )
                prompt.save()

        return Response({'Message': 'Successfully Submitted Prompts'}, status=status.HTTP_200_OK)


class NextGamestate(APIView):
    # view to fetch the next gamestate
    @check_request_key_and_room_status
    def post(self, request, format=None, **kwargs):
        room = kwargs.get('room')
        if room.gamestate == Room.GameState.QUEUE and not self.request.session.session_key == room.host:
            return Response({
                'Invalid Request': 'Only Host Can Update the Gamestate'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            room = update_gamestate(room)
        except RoomNotReadyError:
             return Response({
                'Invalid Request': 'Not all Players in Room are Ready'
            }, status=status.HTTP_409_CONFLICT)
        
        return Response({'gamestate': room.gamestate}, status=status.HTTP_200_OK)


class ReadyUp(APIView):
    @check_request_key_and_room_status
    def post(self, request, format=None, **kwargs):
        room = kwargs.get('room')
        alias = Alias.objects.filter(user=self.request.session.session_key, room_code=room.code)[0]
        alias.ready = True
        alias.save()
        room_aliases = Alias.objects.filter(room_code=room.code)
        is_waiting = any([not alias.ready for alias in room_aliases])
        print(is_waiting)
        return Response({'is_waiting': is_waiting}, status=status.HTTP_200_OK)


class GetPrompts(APIView):
    # get all the prompts at once and have them toggled through by the client
    @check_request_key_and_room_status
    def get(self, request, format=None, **kwargs):
        room = kwargs.get('room')
        user = self.request.session.session_key
        assigned_prompts = PromptAssignments.objects.filter(assigned_user=user, room_code=room.code)
        prompts = Prompt.objects.filter(unique_id__in=[assigned_prompt.prompt_unique_id for assigned_prompt in assigned_prompts if assigned_prompt.assigned_user_song_choice is None],
                                        prompt_key=room.main_round-1)
        
        if not prompts:
            return Response({
                'Invalid Request': 'User has no more prompts remaining'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = {'text': prompts[0].prompt_text, 'id': prompts[0].unique_id}
        print(data)
        return Response(data, status=status.HTTP_200_OK)


class SubmitSongSelections(APIView):
    # view to submit the song selections
    # want to split this into separate endpoints, submit song selections
    # one at a time
    @check_request_key_and_room_status
    def post(self, request, format=None, **kwargs):
        user = self.request.session.session_key
        prompts = request.data.get('prompts')
        if prompts is None:
            return Response({
                'Invalid Request': 'No Prompts Submitted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        assigned_prompts = PromptAssignments.objects.filter(prompt_unique_id__in=[prompt_info['prompt_id'] for prompt_info in prompts],
                                                            assigned_user=user)
        if not assigned_prompts or (len(assigned_prompts) != len(prompts)):
            return Response({
                'Invalid Request': 'One or more prompt ids do not exist'
            }, status=status.HTTP_400_BAD_REQUEST)

        for assigned_prompt, prompt_info in zip(assigned_prompts, prompts):
            assigned_prompt.assigned_user_song_choice = prompt_info['song_id']
            assigned_prompt.save()

        return Response({
                'Success': 'Successfuly Updated Song Vote for User'
            }, status=status.HTTP_200_OK)
        

class VotingRound(APIView):
    # want to split this into separate endpoints, one for each prompt
    # uniquely
    @check_request_key_and_room_status
    def get(self, request, format=None, room=None):
        # room_code = self.request.session['room_code']
        # room = Room.objects.filter(code=room_code)
        aliases = Alias.objects.filter(room_code=room.code)
        alias_map = {alias.user: alias.alias for alias in aliases}
        voting_round = room.voting_round
        prompt = Prompt.objects.filter(room_code=room.code, voting_round=voting_round)
        data = {
            'prompt_id': prompt.id,
            'prompt_text': prompt.prompt_text,
            'assigned_user_1': alias_map[prompt.assigned_user_1],
            'assigned_user_2': alias_map[prompt.assigned_user_2],
            'assigned_user_1_song_selection': prompt.assigned_user_1_song_selection,
            'assigned_user_2_song_selection': prompt.assigned_user_2_song_selection
        }
        return Response({'prompt' : data}, status=status.HTTP_200_OK)