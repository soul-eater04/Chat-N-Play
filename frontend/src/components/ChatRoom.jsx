import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const ChatRoom = () => {
  const [id, setId] = useState("");
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setId(`YOUR ID IS ${newSocket.id}`);
    });

    newSocket.on("message", (data, senderId) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: data, senderId },
      ]);
    });

    return () => newSocket.disconnect();
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 bg-gray-200 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="bg-white p-2 rounded-md mb-2">
            <span className="font-bold">{msg.senderId}:</span> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex p-4 bg-gray-100">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 mr-2 p-2 rounded-md"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
