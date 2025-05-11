// ChatArea.js
import React from 'react';

function ChatArea() {
  return (
    <div className="chat-area">
      <div className="header">
        <h2>Chat Room</h2>
      </div>
      <div className="messages">
        <p>
          <strong>User1:</strong> Hello, everyone!
        </p>
        <p>
          <strong>User2:</strong> Hi there!
        </p>
        {/* More messages can appear here */}
      </div>
      <div className="input-area">
        <input type="text" placeholder="Type your message..." />
      </div>
    </div>
  );
}

export default ChatArea;