import React, { useEffect, useState, } from 'react'
import Topnav from './components/Topnav'
import axios from 'axios'
import './pages.css'


function Receiptify() {
    const [ChoiceMade, setChoiceMade] = useState('none');

    const getTopSongs = async () => {
      try {
          const res = await axios.post('http://127.0.0.1:5000/api/spotify-get_top_songs');
          const { data } = res;
          console.log(data.access_token)
          window.localStorage.setItem('token', data.access_token);
          const urlWithoutCode = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, urlWithoutCode);
        } catch (err) {
          console.error('Error during code exchange: ', err);
        }
  };

    return (
        <div>
            <Topnav />
            <div className='homepage'>
                <h1>Receiptify Clone</h1>
                {ChoiceMade === 'none' ?
                  <div className='receiptify-buttons'>
                    <button className='receiptify-button' onClick={() => setChoiceMade('small')}>Short-Term</button>
                    <button className='receiptify-button' onClick={() => setChoiceMade('medium')}>Medium-Term</button>
                    <button className='receiptify-button' onClick={() => setChoiceMade('long')}>Long-Term</button>
                  </div>
                  : <button className='logout-button' onClick={() => setChoiceMade('none')}>Choose Another</button>  
                }

            </div>
        </div>
    )
}

export default Receiptify