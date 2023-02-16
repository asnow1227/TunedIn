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
class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    host = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    gamestate = models.CharField(max_length=50, default='queue')


class Prompt(models.Model):
    user = models.CharField(max_length=50)
    host = models.CharField(max_length=50)
    room_code = models.CharField(max_length=8, null=False)
    prompt_text = models.TextField(null=False)
    prompt_key = models.IntegerField(null=False)
    assigned_user = models.TextField(null=True)
    assigned_round = models.IntegerField(null=True)


class Alias(models.Model):
    user = models.CharField(max_length=50)
    room_code =  models.CharField(max_length=8, null=False)
    alias = models.CharField(max_length=10)
    ready = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['alias', 'room_code'],
                name='unique_aliasing'
            )
        ]


    

