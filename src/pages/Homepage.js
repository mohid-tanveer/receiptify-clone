import React, { useEffect, useState, } from 'react'
import Topnav from './components/Topnav'
import axios from 'axios'
import './pages.css'


function Homepage() {
    const [token, setToken] = useState('');

    const handleAuthorization = async () => {
        try {
            const res = await axios.post('http://127.0.0.1:5000/api/spotify-auth')
            const {data} = res
            window.location.href = data
        } catch (err) {
            console.error("Error during authorization: ", err)
        }
    }

    const handleCodeExchange = async () => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code){
            try {
                const res = await axios.post('http://127.0.0.1:5000/api/spotify-token');
                const { data } = res;
                console.log(data.access_token)
                window.localStorage.setItem('token', data.access_token);
                const urlWithoutCode = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, urlWithoutCode);
              } catch (err) {
                console.error('Error during code exchange: ', err);
              }
        }
        setToken(window.localStorage.getItem('token'));
    };

    const handleLogout = () => {
        window.localStorage.removeItem('token');
        setToken('');
    }

    useEffect(() => {
        handleCodeExchange();
    }, []);
    return (
        <div>
            <Topnav />
            <div className='homepage'>
                <h1>weLikethis</h1>
                {!token ?
                    <button className='login-button' onClick={handleAuthorization}>Login with Spotify</button>
                : <button className='logout-button' onClick={handleLogout}>Logout</button>}
            </div>
        </div>
    )
}

export default Homepage