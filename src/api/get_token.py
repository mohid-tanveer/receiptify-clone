from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

token = None

@app.route('/api/spotify-token', methods=['POST'])
def receive_token():
    global token
    token = request.json.get('token')
    return 'Token received'

@app.route('/api/get-token', methods=['GET'])
def get_token():
    global token
    return token

if __name__ == '__main__':
    app.run()