from django.shortcuts import render
from rest_framework import generics, status
from .serializers import (
    RoomSerializer, CreateRoomSerializer, SubmitPromptsSerializer
)
from .models import Room, Prompt
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

# Create your views here.

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class CreateRoomView(APIView):
    #APIView allows us to overwrite request methods, e.g get, post
    serializer_class = CreateRoomSerializer
    
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            query_set = Room.objects.filter(host=host)
            if query_set.exists():
                room = query_set[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
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
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if room_result:
                room = room_result[0]
                self.request.session['room_code'] = code
                return Response({'message': 'Room Joined'}, status=status.HTTP_200_OK)
            
            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'Bad Request': 'Invalid post data, did not find a room code in request'}, status=status.HTTP_400_BAD_REQUEST)


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
            self.request.session.pop('room_code')
            session_id = self.request.session.session_key
            room_results = Room.objects.filter(host=session_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()
            
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


        