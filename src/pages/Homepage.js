import React, { useEffect, useState, } from 'react'
import Topnav from './components/Topnav'
import axios from 'axios'
import './pages.css'


function Homepage() {
    const [token, setToken] = useState('')
    const [user, setUser] = useState(null)
    const [code, setCode] = useState(null)

    useEffect(() => {
        setCode(new URLSearchParams(window.location.search).get('code'))
    }, [])
    
    const handleAuthorization = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/spotify-auth')
            const {data} = res
            window.location.href = data
        } catch (err) {
            console.error("Error during authorization: ", err)
        }
    }

    const handleLogout = () => {
        window.localStorage.removeItem('token')
        setToken('')
    }

    const handleUser = () => {
        window.localStorage.setItem('user', user)
    }

    useEffect(() => {
        const handleCodeExchange = async () => {
            if (code && localStorage.getItem('user')){
                try {
                    const userPassed = localStorage.getItem('user')
                    const res = await axios.post('http://127.0.0.1:5000/api/spotify-token', {code, user: userPassed})
                    const { data } = res
                    console.log(data.access_token)
                    window.localStorage.setItem('token', data.access_token)
                    const urlWithoutCode = window.location.origin + window.location.pathname
                    window.history.replaceState({}, document.title, urlWithoutCode)
                  } catch (err) {
                    console.error('Error during code exchange: ', err)
                  }
            }
            setToken(window.localStorage.getItem('token'))
        }
        
        handleCodeExchange()
    }, [code])

    return (
        <div className='container'>
            <Topnav />
            <div className='homepage'>
                <h1>weLikethis</h1>
                {!localStorage.getItem('user') ? 
                    <form onSubmit={handleUser}>
                        <label>Enter username: 
                            <input type='text' value={user} onChange={(e) => setUser(e.target.value)} />
                        </label>
                        <input type='submit' value='submit' />
                    </form>
                : <h2>Welcome, {localStorage.getItem('user')}</h2>}
                {!token ?
                    <button className='login-button' onClick={handleAuthorization}>Login with Spotify</button>
                : <button className='logout-button' onClick={handleLogout}>Logout from Spotify</button>}
            </div>
        </div>
    )
}

export default Homepage