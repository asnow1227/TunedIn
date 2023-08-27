from django.shortcuts import render
from rest_framework import generics, status
from .serializers import (
    RoomSerializer, 
    CreateOrJoinRoomSerializer, 
    SubmitPromptsSerializer,
    UpdateRoomSerializer
)
from .models import Room, Prompt, Alias
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
import django
import json
from game.gamestate import GameState
from decorator import decorator


def clear_all_room_data(room):
    for model in (Prompt, Alias):
        model.objects.filter(room_code=room.code).all().delete()
    room.delete()


def clear_all_user_data(user):
    for model in (Prompt, Alias):
        model.objects.filter(user=user).all().delete()


# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class CreateRoomView(APIView):
    #APIView allows us to overwrite request methods, e.g get, post
    serializer_class = CreateOrJoinRoomSerializer
    
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        alias_name = request.data.get('alias')
        if alias_name is None:
            return Response({
                'Bad Request': 'No Alias provided for User'
            }, status=status.HTTP_400_BAD_REQUEST)
        # serializer = self.serializer_class(data=request.data)
        # if serializer.is_valid():
            # guest_can_pause = serializer.data.get('guest_can_pause')
            # votes_to_skip = serializer.data.get('votes_to_skip')
        host = self.request.session.session_key
        room_query_set = Room.objects.filter(host=host)
        # if we are hosting other rooms, clear the other rooms data (for now this is a hack so that we only have one room at a time)
        if room_query_set.exists():
            for room in room_query_set:
                clear_all_room_data(room)
        clear_all_user_data(host)
        
        room = Room(host=host)
        room.save()
        request.data['room_code'] = room.code
        if self.serializer_class(data=request.data).is_valid():
            alias = Alias(user=host, room_code=room.code, alias=alias_name)
            alias.save()
            self.request.session['room_code'] = room.code
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        
        return Response({'Bad Request': 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST)


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                alias = Alias.objects.filter(room_code=room[0].code, user=self.request.session.session_key)[0]
                data['is_host'] = self.request.session.session_key == room[0].host
                data['alias'] = alias.alias
                data['gamestate'] = room[0].gamestate
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    serializer_class = CreateOrJoinRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        room_code = request.data.get('room_code')
        
        if room_code is None:
            return Response({
                'type': 'room_code',
                'message': 'Room Not Found'
            }, status=status.HTTP_200_OK)
        
        room_result = Room.objects.filter(code=room_code)
        
        if not room_result.exists():
            return Response({
                'type': 'room_code',
                'message': 'Room Not Found'
        }, status=status.HTTP_400_BAD_REQUEST)
            
        if not self.serializer_class(data=request.data).is_valid():
            return Response({
                'type': 'alias',
                'message': 'Invalid Alias'
        }, status=status.HTTP_400_BAD_REQUEST)

        clear_all_user_data(self.request.session.session_key)
        
        try:
            alias = Alias(
                user=self.request.session.session_key,
                alias=request.data.get('alias'),
                room_code=room_code
            )
            alias.save()
        except django.db.utils.IntegrityError:
            return Response({
                'type': 'alias',
                'message': 'Alias exists in Room'
        }, status=status.HTTP_400_BAD_REQUEST)

        self.request.session['room_code'] = room_code
        return Response({'message': 'Room Joined'}, status=status.HTTP_200_OK)
        
 


class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        data = {
            'code': self.request.session.get('room_code')
        }
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            room_code = self.request.session.pop('room_code')
            session_id = self.request.session.session_key
            room_results = Room.objects.filter(host=session_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()
            alias_results = Alias.objects.filter(user=session_id, room_code=room_code)
            if len(alias_results) > 0:
                alias = alias_results[0]
                alias.delete()
            
        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)


class SubmitPrompt(APIView):
    serializer_class = SubmitPromptsSerializer
    def post(self, request, format=None):
        if not self.request.session.session_key:
            self.request.session.create()
        
        serializer = self.serializer_class(data=self.request.data)
        if 'room_code' not in self.request.session:
            return Response(
                {'Bad Request': 'Current User Not in a Room'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not serializer.is_valid():
            return Response(
                {'Bad Request': 'Invalid Post Data'},
                status=status.HTTP_400_BAD_REQUEST
            )

        room_code = self.request.session.get('room_code')
        user = self.request.session.session_key
        prompt_text = serializer.data.get('prompt_text')
        prompt_key = serializer.data.get('prompt_key')
        
        prompt_found = Prompt.objects.filter(
            user=self.request.session.session_key,
            prompt_key=prompt_key,
            room_code=room_code
        )

        if prompt_found:
            prompt = prompt_found[0]
            prompt.prompt_text = prompt_text
            prompt.save(update_fields=['prompt_text'])
            return Response(
                {'Message': 'Successfully Updated Prompt'},
                status=status.HTTP_200_OK
            )

        prompt = Prompt(
            user=user, 
            room_code=room_code, 
            prompt_text=prompt_text,
            prompt_key=prompt_key
        )
        prompt.save()

        all_user_prompts = Prompt.objects.filter(
            user=self.request.session.session_key, room_code=room_code
        )

        if len(all_user_prompts) == 3:
            # if we have submitted all the prompts, then we set the ready status to true
            alias = Alias.objects.filter(user=self.request.session.session_key, room_code=room_code)[0]
            alias.ready = True
            alias.save(update_fields=['ready'])

        return Response(
            {'Message': 'Successfully Submitted Prompt'},
            status=status.HTTP_200_OK
        )


class DeletePrompt(APIView):
    def post(self, request, format=None):
        if not self.request.session.session_key:
            self.request.session.create()
            return Response({
                'Invalid Request': 'No Session Recorded for User'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        room_code = self.request.session.get('room_code')
        prompt_key = request.data.get('prompt_key')

        if prompt_key is None:
            return Response({
                'Invalid Request': 'No prompt_key provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if room_code is None:
            return Response({
                'Invalid Request': 'User not in a room'
            }, status=status.HTTP_400_BAD_REQUEST)

        prompt_found = Prompt.objects.filter(
            user=self.request.session.session_key,
            prompt_key=prompt_key,
            room_code=room_code
        )

        if not prompt_found:
            return Response({
                'Invalid Request': 'Prompt not found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = prompt_found[0]
        prompt.delete()

        alias = Alias.objects.filter(user=self.request.session.session_key, room_code=room_code)[0]
        # after deleting the prompt, set the ready status of the player to False
        alias.ready = False
        alias.save(update_fields=['ready'])
        
        return Response({
            'Message': 'Successfully Deleted Prompt'
        }, status=status.HTTP_200_OK)


class DeletePrompts(APIView):
    def post(self, request, format=None):
        if not self.request.session.session_key:
            self.request.session.create()
            return Response({
                'Invalid Request': 'No Session Recorded for User'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        room_code = self.request.session.get('room_code')
        if room_code is None:
            return Response({
                'Invalid Request': 'User not in a room'
            }, status=status.HTTP_400_BAD_REQUEST)

        prompt_set = Prompt.objects.filter(user=self.request.session.session_key, room_code=room_code)
        
        if not prompt_set:
            return Response({
                'Message': 'Post Submitted Successfully, No Prompts Recorded for User'
            }, status=status.HTTP_200_OK)
        
        for prompt in prompt_set:
            prompt.delete()

        alias = Alias.objects.filter(user=self.request.session.session_key, room_code=room_code)[0]
        alias.ready = False
        alias.save(update_fields=['ready'])
        
        return Response({
            'Message': 'Succesffuly Deleted Prompts for User'
        }, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer
    
    def patch(self, request, format=None):
        if not self.request.session.session_key:
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            query_set = Room.objects.filter(code=code)
            if not query_set.exists():
                return Response({'msg': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

            room = query_set[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'msg': 'You are not the host of this room...'}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            
        return Response({'Bad Request': 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST)


class GetCurrentPlayers(APIView):
    def get(self, request, format=None):
        if not self.request.session.session_key:
            self.request.session.create()
        
        player_id = self.request.session.session_key
        room_code = self.request.session.get('room_code')
        if room_code is None:
            return Response({
                'Invalid Request': 'User not in a room'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        query_set = Alias.objects.filter(user=player_id, room_code=room_code)
        print(query_set.exists())
        if not query_set.exists():
            return Response({'Bad Request': 'Player Not in Room'}, status=status.HTTP_400_BAD_REQUEST)
        
        player_alias = query_set[0]
        data = [player_alias.alias]
        current_players = Alias.objects.filter(room_code=room_code).all()

        data.extend([player.alias for player in current_players if player.alias != player_alias.alias])
        return Response({'data': data}, status=status.HTTP_200_OK)


def ready_check(room_code):
    aliases = Alias.objects.filter(room_code=room_code).all()
    print({alias.alias: (alias.ready, alias.room_code) for alias in aliases})
    return all([alias.ready for alias in aliases])


def set_ready_statuses_to_false(room_code):
    aliases = Alias.objects.filter(room_code=room_code).all()
    for alias in aliases:
        alias.ready = False
        alias.save(update_fields=['ready'])


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

    return fn(self, *args, **kwargs)
    



class NextGamestate(APIView):
    def post(self, request, format=None):
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
        
        room = room_set[0]
        if not self.request.session.session_key == room.host:
            return Response({
                'Invalid Request': 'Only Host Can Update the Gamestate'
            }, status=status.HTTP_400_BAD_REQUEST)

        gamestate = GameState(room)
        if not gamestate.ready_check():
            return Response({
            'Invalid Request': 'Not all Players in Room are Ready'
        }, status=status.HTTP_400_BAD_REQUEST)
        print(f"initial_state: {room.gamestate}")

        gamestate.update()
        # next_gamestate = gamestate.next()
        # room.gamestate = next_gamestate
        # room.save(update_fields=['gamestate', 'room_round'])
        # gamestate.set_ready_statuses_to_false()
        print(f"next_state: {gamestate.gamestate}")
        # set_ready_statuses_to_false(room_code)
        return Response({'gamestate': gamestate.gamestate}, status=status.HTTP_200_OK)


class UpdateReadyState(APIView):
    def post(self, request, format=None):
        if not self.request.session.session_key:
            self.request.session.create()
            return Response({
                'Invalid Request': 'No Session Recorded for User'
            }, status=status.HTTP_400_BAD_REQUEST)
        room_code = self.request.session.get('room_code')
        room_set = Room.objects.filter(code=room_code)
        
        if not room_set.exists():
            return Response({
                'Invalid Request': 'Room does not Exist'
            }, status=status.HTTP_400_BAD_REQUEST)
        alias_set = Alias.objects.filter(user=self.request.session.session_key, room_code=room_code)
        
        if not alias_set.exists():
            return Response({
                'Invalid Request': 'Alias does not Exist in Room'
            }, status=status.HTTP_400_BAD_REQUEST)
        alias = alias_set[0]
        alias.ready = request.data.get('is_ready')
        alias.save(update_fields=['ready'])
        return Response({
            'Success': 'Successfully Updated Ready State'
        }, status=status.HTTP_200_OK)


class CurrentGameState(APIView):
    def get(self, request, format=None):
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
        room = room_set[0]
        return Response({'gamestate': room.gamestate}, status=status.HTTP_200_OK)


class GetPrompts(APIView):
    # get all the prompts at once and have them toggled through by the client
    def get(self, request, format=None):
        if not self.request.session.session_key:
            self.request.session.create()
            return Response({
                'Invalid Request': 'No Session Recorded for User'
            }, status=status.HTTP_400_BAD_REQUEST)
        user = self.request.session.session_key
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
        
        room = room_set[0]
        # the prompts are assigned by round based on the prompt key. This prompt set can contain 
        # multiple objects
        prompt_set = Prompt.objects.raw(
            f"""Select ID, 
                prompt_text
                from api_prompt
                where prompt_key = {room.room_round} and 
                (assigned_user_1 = '{user}' or assigned_user_2 = '{user}')
        """)

        if not prompt_set:
            return Response({
                'Invalid Request': 'User has no more prompts remaining'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = [{'prompt': prompt.prompt_text, 'id': prompt.id} for prompt in prompt_set]

        return Response({'prompts' : data}, status=status.HTTP_200_OK)


class SubmitSongSelections(APIView):
    
    @check_request_key_and_room_status
    def post(self, request, format=None):
        user = self.request.session.session_key
        prompts = request.data.get('prompts')
        if prompts is None:
            return Response({
                'Invalid Request': 'No Prompts Submitted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        prompt_set = Prompt.objects.filter(id__in=[prompt_info['prompt_id'] for prompt_info in prompts])
        if not prompt_set or (len(prompt_set) != len(prompts)):
            return Response({
                'Invalid Request': 'One or more prompt ids do not exist'
            }, status=status.HTTP_400_BAD_REQUEST)

        # prompt = prompt_set[0]
        # if user != prompt.assigned_user_1 and user != prompt.assigned_user_2:
        #     return Response({
        #         'message': 'User not assigned to Prompt Id'
        #     }, status=status.HTTP_400_BAD_REQUEST)
        for prompt, prompt_info in zip(prompt_set, prompts):
            if user == prompt.assigned_user_1:
                prompt.assigned_user_1_song_choice = prompt_info['song_id']
                prompt.save(update_fields=['assigned_user_1_song_choice'])
            else:
                prompt.assigned_user_2_song_choice = prompt_info['song_id']
                prompt.save(update_fields=['assigned_user_2_song_choice'])

        return Response({
                'Success': 'Successfuly Updated Song Vote for User'
            }, status=status.HTTP_200_OK)
        
            

