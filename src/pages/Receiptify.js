import React, { useEffect, useState, } from 'react'
import Topnav from './components/Topnav'
import axios from 'axios'
import './pages.css'
import './receipt.css'


function Receiptify() {
    const [ChoiceMade, setChoiceMade] = useState('none')
    const [receipts, setReceipts] = useState({short_term: '', medium_term: '', long_term: ''})

    useEffect(() => {
      const getTopSongs = async (choice) => {
        try {
          const userPassed = localStorage.getItem('user')
          const res = await axios.post('http://127.0.0.1:5000/api/spotify-get_top_songs', { user: userPassed, time_range: choice })
          return res.data
          } catch (err) {
            console.error('Error during getting top songs: ', err)
          }
      }
      const generateReceipts = async () => {
        const user = localStorage.getItem('user')
        const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
        const currentYear = new Date().getFullYear()
        const generatedReceipts = {short_term: '', medium_term: '', long_term: ''}
        
        for (const choice of ['short_term', 'medium_term', 'long_term']) {
          let receipt = ''
          const topSongs = await getTopSongs(choice)

          var period = ''
          if (choice === 'short_term') {
            period = 'LAST MONTH'
          } else if (choice === 'medium_term') {
            period = 'LAST 6 MONTHS'
          } else if (choice === 'long_term') {
            period = 'ALL TIME'
          }

          // Generate the receipt header
          receipt += `<div class="receiptContainer" id="{{ id }}">`
          receipt += `<div class="period"><p class="period">${period.toUpperCase()}</p></div>`
          receipt += `<p class="date">ORDER #0001 FOR ${user.toUpperCase()}</br> ${currentDate.toUpperCase()}</p>`

          // Generate the receipt table
          receipt += `<table class="tracks">`
          receipt += `<thead>`
          receipt += `<tr>`
          receipt += `<td colspan="3"><hr></td>`
          receipt += `</tr>`
          receipt += `<tr>`
          receipt += `<td class="begin">QTY</td>`
          receipt += `<td>ITEM</td>`
          receipt += `<td class="length">AMT</td>`
          receipt += `</tr>`
          receipt += `<tr>`
          receipt += `<td colspan="3"><hr></td>`
          receipt += `</tr>`
          receipt += `</thead>`

          topSongs.forEach((song, index) => {
            const { title, artists, duration } = song
            const durationInMinutes = Math.floor(duration / 60000)
            const durationInSeconds = Math.floor((duration % 60000) / 1000)
            const formattedDuration = `${durationInMinutes}:${durationInSeconds.toString().padStart(2, '0')}`
    
            receipt += `<tr>`
            receipt += `<td class="begin">${index + 1}</td>`
            receipt += `<td class="name">${title} - ${artists}</td>`
            receipt += `<td class="length">${formattedDuration}</td>`
            receipt += `</tr>`
          })
        
          // Generate the receipt footer
          receipt += `<tr class="total-counts">`
          receipt += `<td class="begin" colspan="2">ITEM COUNT:</td>`
          receipt += `<td class="length">${topSongs.length}</td>`
          receipt += `</tr>`
          receipt += `<tr class="total-counts-end">`
          receipt += `<td class="begin" colspan="2">TOTAL:</td>`
          const totalDuration = topSongs.reduce((acc, song) => acc + song.duration, 0)
          const totalDurationInMinutes = Math.floor(totalDuration / 60000)
          const totalDurationInSeconds = Math.floor((totalDuration % 60000) / 1000)
          const formattedTotalDuration = `${totalDurationInMinutes}:${totalDurationInSeconds.toString().padStart(2, '0')}`
          receipt += `<td class="length">${formattedTotalDuration}</td>`
          receipt += `</tr>`
          receipt += `</table>`

          receipt += `<p class="date">CARD #: **** **** **** ${currentYear}</p>`
          receipt += `<p class="date">AUTH CODE: 123421</p>`
          receipt += `<p class="date">CARDHOLDER: ${user.toUpperCase()}</p>`

          receipt += `<div class="thanks">`
          receipt += `<p>THANK YOU FOR VISITING!</p>`
          receipt += `<div class="barcode"><img style="width: 80%" src="/images/barcode.png" alt="Barcode" /></div>`
          receipt += `</div>`
          receipt += `</div>`
          generatedReceipts[choice] = receipt
        }
        

        setReceipts(generatedReceipts)
      }
      generateReceipts()
    }, [])

    return (
        <div className='container'>
            <Topnav />
            <div className='homepage'>
                <h1>Receiptify Clone</h1>
                {ChoiceMade === 'none' ?
                  (<div className='receiptify-buttons'>
                    <button className='receiptify-button' onClick={() => setChoiceMade('short_term')}>Short-Term</button>
                    <button className='receiptify-button' onClick={() => setChoiceMade('medium_term')}>Medium-Term</button>
                    <button className='receiptify-button' onClick={() => setChoiceMade('long_term')}>Long-Term</button>
                  </div>
                  ) : (
                    <div>
                      <button className='logout-button' onClick={() => setChoiceMade('none')}>Choose Another</button><br /><br />
                      <div className='receipt' dangerouslySetInnerHTML={{ __html: receipts[ChoiceMade] }}></div>
                    </div>)
                }

            </div>
        </div>
    )
}

export default Receiptify