from flask import Flask, request
from flask_cors import CORS
from pymongo import MongoClient


import spotipy
from spotipy.oauth2 import SpotifyOAuth

# consts
CLIENT_ID = 'e52a52d9d1c94c499c6eca36fa655660'
CLIENT_SECRET = '3676266de1ed45c29ba7b6be13be8e4f'
REDIRECT_URI = 'http://localhost:3000/'
SCOPE = 'user-library-read'

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
    existing_user = users.find_one({'user': user})
    if existing_user:
        users.update_one({'user': user}, {'$set': {'token': token}})
    else:
        users.insert_one({'user': user, 'token': token})
    return token_info

@app.route('/api/spotify-get_token', methods=['POST'])
def get_token():
    user = request.json.get('user')
    token_info = users.find_one({'user': user}, {'_id': 0, 'token': 1})
    if token_info:
        return token_info['token']
    return "Token not found"

def get_token(user):
    token_info = users.find_one({'user': user}, {'_id': 0, 'token': 1})
    if token_info:
        return token_info['token']
    return "Token not found"

@app.route('/api/spotify-get_top_songs', methods=['GET'])
def get_top_songs():
    user = request.json.get('user')
    user_token = get_token(user)
    if user_token:
        sp = spotipy.Spotify(auth=user_token)
        user_top_songs = sp.current_user_top_tracks(
            limit=10,
            offset=0,
            time_range='medium_term'
        )
        return str(user_top_songs['items'])
    else:
        return 'Error retrieving token from the server'

if __name__ == '__main__':
    app.run(debug=True)