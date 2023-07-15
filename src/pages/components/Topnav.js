import React from 'react';
import './topnav.css';
import { Link } from 'react-router-dom';

const Topnav = () => {
  return (
    <div className="topnav">
      <div className="grid-container">
        <div><small><Link to="/">Home</Link></small></div>
        <div><small><Link to="/receiptify">Receiptify</Link></small></div>
      </div>
    </div>
  );
}

export default Topnav;