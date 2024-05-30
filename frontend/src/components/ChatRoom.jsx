import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const ChatRoom = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.post(
          "http://localhost:3000/api/auth",
          null,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const { userName, email, userId } = response.data;
        setUserName(userName);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserDetails();
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    newSocket.on("message", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: data.message, userName: data.userName },
      ]);
    });
    newSocket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });
    newSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("message", { message, userName });
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 bg-gray-200 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="bg-white p-2 rounded-md mb-2">
            <span className="font-bold">{msg.userName}:</span> {msg.message}
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