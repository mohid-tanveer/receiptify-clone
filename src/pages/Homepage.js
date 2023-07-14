import React, { useEffect, useState } from 'react'


function Homepage() {
    const CLIENT_ID = 'e52a52d9d1c94c499c6eca36fa655660'
    const REDIRECT_URI = 'http://localhost:3000/'
    const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize/'
    const RESPONSE_TYPE = 'token'

    const [token, setToken] = useState('')

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        let token = window.localStorage.getItem('token');

        if (!token && hash) {
            token = hash.split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
            window.location.hash = '';
            window.localStorage.setItem('token', token);
        }
        setToken(token);
    }, [])

    const handleLogout = () => {
        window.localStorage.removeItem('token');
        setToken('');
    }

    const handleSendToken = () => {
        const apiUrl = 'http://127.0.0.1:5000/api/spotify-token';

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        })
            .then((response) => {
                if (response.ok) {
                    //Token sent successfully
                    console.log('Working Now...');
                } else {
                    //Token not sent successfully
                    console.log('Error relaying User Info, Try Again');
                }
            })
            .catch((error) => {
                console.error('Error sending token:', error);
            });
    }
    return (
        <div className='homepage'>
            <h1>weLikethis</h1>
            {!token 
                ? <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Authorize
                with Spotify.</a>
                : <button onClick={handleLogout}>Logout</button>
            }
            {token ? <button onClick={handleSendToken}>Send Token</button> : null}
        </div>
    )
}

export default Homepage