from django.db import models

# Create your models here.
class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField(max_length=150)
    access_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)


class UsersSpotify(models.Model):
    user = models.CharField(max_length=50, unique=True)
    image_url = models.CharField(max_length=200, null=True)
    display_name = models.CharField(max_length=50)
    spotify_id = models.CharField(max_length=200)
    