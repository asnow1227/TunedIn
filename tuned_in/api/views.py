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
        if room_query_set.exists():
            room = room_query_set[0]
            alias_query_set = Alias.objects.filter(user=host, room_code=room.code)
            if alias_query_set.exists():
                alias = alias_query_set[0]
                alias.alias = alias_name
                alias.save(update_fields=['alias'])
            # room.guest_can_pause = guest_can_pause
            # room.votes_to_skip = votes_to_skip
            # room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            self.request.session['room_code'] = room.code
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        else:
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
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    serializer_class = CreateOrJoinRoomSerializer

    def post(self, request, format=None):
        print(request.data)
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
            print('wtf')
            return Response({
                'type': 'room_code',
                'message': 'Room Not Found'
        }, status=status.HTTP_400_BAD_REQUEST)
            
        if not self.serializer_class(data=request.data).is_valid():
            print('wtf')
            return Response({
                'type': 'alias',
                'message': 'Invalid Alias'
        }, status=status.HTTP_400_BAD_REQUEST)
        
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
            prompt_key=prompt_key
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

        return Response(
            {'Message': 'Successfully Submitted Prompt'},
            status=status.HTTP_200_OK
        )


class DeletePrompts(APIView):
    def post(self, request, format=None):
        if not self.request.session.session_key:
            self.request.session.create()
            return Response({
                'Invalid Request': 'No Session Recorded for User'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        prompt_set = Prompt.objects.filter(user=self.request.session.session_key)
        
        if not prompt_set:
            return Response({
                'Message': 'Post Submitted Successfully, No Prompts Recorded for User'
            }, status=status.HTTP_200_OK)
        
        for prompt in prompt_set:
            prompt.delete()
        
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
