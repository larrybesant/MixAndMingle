// App.js
import React from 'react';
import './App.css';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

function App() {
  return (
    <div className="App">
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default App;