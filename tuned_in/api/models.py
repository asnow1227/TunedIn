from django.db import models
from django.utils.translation import gettext_lazy as _
import string 
import random


def generate_room_code():
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=6))
        if not Room.objects.filter(code=code).count():
            break
    return code


def generate_prompt_id():
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=10))
        if not Prompt.objects.filter(unique_id=code).count():
            break
    return code

# Create your models here. 
# Note that all models have a unique "id" field that we don't have to define but can 
# access to get a unique record if we want.
class Room(models.Model):

    class GameState(models.TextChoices):
        QUEUE = 'Q', _('Queue')
        PROMPT = 'P', _('Prompt')
        SELECT = 'SEL', _('Select')
        VOTE = 'V', _('Vote')
        SCORE = 'SCR', _('Score')
    
    # unique code for each room
    code = models.CharField(max_length=8, default=generate_room_code, unique=True)
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
    gamestate = models.CharField(max_length=3, choices=GameState.choices, default=GameState.QUEUE)
    # the game flow consists of queue and then 2 or more 'rounds' that toggle 
    # through the remaining gamestates above.
    main_round = models.IntegerField(default=1)
    # number of players at the start of the game
    num_players = models.IntegerField(null=True)
    # voting round, will be used to order the prompts for the voting phase
    voting_round = models.IntegerField(default=1)
    # prompts per player, decided by the number of players
    prompts_per_player = models.IntegerField(default=3)

    # objects = RoomManager()

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
    # when the user submits a prompt on the front end, this variable is included so that 
    # when they want to delete a specific prompt they can map it back to this prompt key. 
    # change this to be 'main_round' aligned with the main_round on the room object
    prompt_key = models.IntegerField(null=False)
    # unique id for the prompt
    unique_id = models.CharField(max_length=10, default=generate_prompt_id, unique=True)
    # voting round for the prompt, will default to 0 and will align with the gamestate voting round
    voting_round = models.IntegerField(default=0)


class PromptAssignments(models.Model):
    # the user that is assigned the prompt (a request session id)
    assigned_user = models.CharField(max_length=50)
    # room code for the given room
    room_code = models.CharField(max_length=8, null=False)
    # prompt id
    prompt_unique_id = models.CharField(max_length=8, null=False) 
    # song choice. We will set to non-null value on timeout of the selection page
    assigned_user_song_choice = models.TextField(null=True)
    # votes for the user's song choice
    assigned_user_votes = models.IntegerField(default=0)


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
    # convenience for checking if user is spotify authenticated
    authenticated = models.BooleanField(default=False)

    avatar_name = models.CharField(max_length=50, null=True)
    avatar_url = models.CharField(max_length=200, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['room_code', 'alias'],
                name='unique_aliasing'
            )
        ]


class Image(models.Model):
    name = models.CharField(max_length=50, unique=True)


    

