from flask import Flask, request
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime


import spotipy
from spotipy.oauth2 import SpotifyOAuth

# consts
CLIENT_ID = 'e52a52d9d1c94c499c6eca36fa655660'
CLIENT_SECRET = '3676266de1ed45c29ba7b6be13be8e4f'
REDIRECT_URI = 'http://localhost:3000/'
SCOPE = 'user-top-read user-library-read'

sp_oauth = SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope=SCOPE,
)

app = Flask(__name__)
client = MongoClient('localhost', 27017)
db = client['welikethis']
users = db['users']
CORS(app)

@app.route('/api/spotify-auth', methods=['GET'])
def create_spotify_oauth():
    auth_url = sp_oauth.get_authorize_url()
    return auth_url

@app.route('/api/spotify-token', methods=['POST'])
def create_token():
    code = request.json.get('code')
    user = request.json.get('user')
    token_info = sp_oauth.get_access_token(code)
    token = token_info['access_token']
    expiration = datetime.fromtimestamp(token_info['expires_at'])
    existing_user = users.find_one({'user': user})
    if existing_user:
        users.update_one({'user': user}, {'$set': {'code': code, 'expiration': expiration, 'token': token}})
    else:
        users.insert_one({'user': user, 'code': code, 'expiration': expiration, 'token': token})
    return token_info

def is_token_expired(expiration):
    return datetime.now() > expiration

@app.route('/api/spotify-get_token', methods=['POST'])
def get_token():
    user = request.json.get('user')
    token_info = users.find_one({'user': user}, {'_id': 0, 'token': 1, 'expiration': 1})
    if token_info:
        if is_token_expired(token_info['expiration']):
            token = refresh_token(user)
        else:
            token = token_info['token']
        return token
    return "Token not found"

def get_token(user):
    token_info = users.find_one({'user': user}, {'_id': 0, 'token': 1, 'expiration': 1})
    if token_info:
        if is_token_expired(token_info['expiration']):
            token = refresh_token(user)
        else:
            token = token_info['token']
        return token
    return "Token not found"

def refresh_token(user):
    code = users.find_one({'user': user}, {'_id': 0, 'code': 1})
    if code:
        token_info = sp_oauth.get_access_token(code['code'])
        token = token_info['access_token']
        expiration = datetime.fromtimestamp(token_info['expires_at'])
        users.update_one({'user': user}, {'$set': {'expiration': expiration, 'token': token}})
        return token
    return "Code not found"

@app.route('/api/spotify-get_top_songs', methods=['POST'])
def get_top_songs():
    user = request.json.get('user')
    time_range = request.json.get('time_range')
    user_token = get_token(user)
    if user_token:
        sp = spotipy.Spotify(auth=user_token)
        user_top_songs = sp.current_user_top_tracks(
            limit=10,
            offset=0,
            time_range=time_range
        )

        top_songs = []
        for track in user_top_songs['items']:
            title = track['name']
            artists = ', '.join([artist['name'] for artist in track['artists']])
            duration = track['duration_ms']
            top_songs.append({'title': title, 'artists': artists, 'duration': duration})
        return top_songs
    return 'Error retrieving token from the server'

if __name__ == '__main__':
    app.run(debug=True)