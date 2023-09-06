from django.db import models
import string 
import random

def generate_unique_code():
    length = 6
    
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        if not Room.objects.filter(code=code).count():
            break

    return code


# Create your models here. 
# Note that all models have a unique "id" field that we don't have to define but can 
# access to get a unique record if we want.
class Room(models.Model):
    # unique code for each room
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    # host for the room. this is a request session id
    host = models.CharField(max_length=50, unique=True)
    # ...
    created_at = models.DateTimeField(auto_now_add=True)
    # start at the queue state, since it's the first page that we see when we join a room (gamestate)
    # doesn't technically exist outside of the room
    # gamestates are:
    # 'queue': displays the players in the room
    # 'prompt': page for creating prompts
    # 'select': page for selecting a song based on the assigned prompt
    # 'vote': page where the prompts are displayed and user selections are voted
    # 'score': page where scores are displayed
    gamestate = models.CharField(max_length=50, default='queue')
    # the game flow consists of queue and then 2 or more 'rounds' that toggle 
    # through the remaining gamestates above. I've defaulted the round to 0
    # since I am used to indexing
    room_round = models.IntegerField(default=0)
    # voting round, will be used to order the prompts for the voting phase
    voting_round = models.IntegerField(default=0)

# stores information about the prompts. Many prompts exist for one 
# room
class Prompt(models.Model):
    # the user that created the prompt (a request session id)
    user = models.CharField(max_length=50)
    # the host of the room (in case we need it)
    host = models.CharField(max_length=50)
    # the room code
    room_code = models.CharField(max_length=8, null=False)
    # the prompt text
    prompt_text = models.TextField(null=False)
    # assign a key to the prompt. This will be unique at the user level and 
    # something like '1', '2', '3'
    prompt_key = models.IntegerField(null=False)
    # first assigned user for the prompt (a request session id)
    assigned_user_1 = models.CharField(max_length=50, null=True)
    # second assigned user for the prompt (a request session id)
    assigned_user_2 = models.CharField(max_length=50, null=True)
    # song id that user 1 selected
    assigned_user_1_song_choice = models.TextField(null=True)
    # song id that user 2 selected
    assigned_user_2_song_choice = models.TextField(null=True)
    # tracks the votes for each of the users prompts
    assigned_user_1_votes = models.IntegerField(default=0)
    assigned_user_2_votes = models.IntegerField(default=0)
    # voting round for the prompt, will default to 0 and will align with the gamestate voting round
    voting_round = models.IntegerField(default=0)

# table to store the player aliases for each room
class Alias(models.Model):
    # request session id for the player
    user = models.CharField(max_length=50, unique=True)
    # room code
    room_code =  models.CharField(max_length=8, null=False)
    # alias they chose
    alias = models.CharField(max_length=10)
    # ready status. This is used to control for the host transitioning gamestates
    # certain gamestates will require a 'ready check' to see if all players in the room 
    # are currently ready to continue
    ready = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['room_code', 'alias'],
                name='unique_aliasing'
            )
        ]


    

