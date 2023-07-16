from flask import Flask, request, session
from flask_session import Session
from flask_cors import CORS
from datetime import timedelta

import spotipy
from spotipy.oauth2 import SpotifyOAuth

# consts
CLIENT_ID = 'e52a52d9d1c94c499c6eca36fa655660'
CLIENT_SECRET = '3676266de1ed45c29ba7b6be13be8e4f'
REDIRECT_URI = 'http://localhost:3000/'
SCOPE = 'user-library-read'
SECRET_KEY = 'mohidtanveer19212389471070713'

access_token = None

sp_oauth = SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope=SCOPE,
)

app = Flask(__name__)
app.secret_key = SECRET_KEY
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_NAME'] = 'momostopsecretcookiemonster1173316'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)
sess = Session()
sess.init_app(app)
CORS(app)

@app.route('/api/spotify-auth', methods=['GET'])
def create_spotify_oauth():
    auth_url = sp_oauth.get_authorize_url()
    return auth_url

@app.route('/api/spotify-token', methods=['GET'])
def create_token():
    token_info = sp_oauth.get_cached_token()
    access_token = token_info['access_token']
    if 'TOKEN_KEY' not in session or session.get('TOKEN_KEY').decode() != access_token:
        print("UPDATING TOKEN")
        session['TOKEN_KEY'] = access_token
        session.modified = True
    return token_info

@app.route('/api/spotify-get_token', methods=['GET'])
def get_token():
    token_info = session.get('TOKEN_KEY', None)
    print(token_info)
    if token_info:
        return token_info.decode()
    return "Token not found" 

@app.route('/api/spotify-get_top_songs', methods=['GET'])
def get_top_songs():
    user_token = get_token()
    print(f"TOKEN_INFO in get_top_songs: {user_token}")
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
    app.run()