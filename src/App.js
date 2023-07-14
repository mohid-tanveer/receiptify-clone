import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Homepage } from './pages';

function App() {
return (
      <Router>
        <AppContent />
      </Router>
  );
}

function AppContent() {

  return (
      <div>
        <Routes>
          <Route path="/" element={<Homepage />} />
        </Routes>
      </div>
  );
}

export default App;