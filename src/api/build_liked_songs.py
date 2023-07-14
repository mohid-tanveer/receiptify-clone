import requests

def use_token(token):
    print(f"{token}")

def get_token():
    response = requests.get('http://127.0.0.1:5000/api/get-token')
    if response.status_code == 200:
        return response.text
    else:
        print('Error retrieving token from the server')

if __name__ == '__main__':
    token = get_token()
    if token:
        use_token(token)