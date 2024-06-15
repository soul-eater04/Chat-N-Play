import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
const ChatRoom = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("");
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const initializeChat = async () => {
      await fetchUserDetails();
      
      const newSocket = io("http://localhost:3000");
      setSocket(newSocket);
      
      newSocket.emit("setUsername", userName);
      
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
  
      newSocket.on("chess-challenge", ({ challenger }) => {
        Swal.fire({
          title: `${challenger} wants to challenge you to a chess game`,
          showCancelButton: true,
          confirmButtonText: 'Accept',
          cancelButtonText: 'Decline',
        }).then((result) => {
          if (result.isConfirmed) {
            newSocket.emit("chess-challenge-response", { challenger, accepted: true });
            navigate('/chess');
          } else {
            newSocket.emit("chess-challenge-response", { challenger, accepted: false });
          }
        });
      });
  
      newSocket.on("chess-challenge-result", ({ accepted }) => {
        if (accepted) {
          Swal.fire('Challenge Accepted!', 'Redirecting to chess game...', 'success');
          navigate('/chess');
        } else {
          Swal.fire('Challenge Declined', 'The player declined your challenge', 'info');
        }
      });
    };
    const fetchUserDetails = async () => {
      try { 
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.post(
          "http://localhost:3000/api/auth",
          null,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const { userName } = response.data; // Removed unused variables email and userId
        setUserName(userName);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserDetails().then(() => {
      newSocket.emit("setUsername", userName);
    });
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

    newSocket.on("chess-challenge", ({ challenger }) => {
      Swal.fire({
        title: `${challenger} wants to challenge you to a chess game`,
        showCancelButton: true,
        confirmButtonText: 'Accept',
        cancelButtonText: 'Decline',
      }).then((result) => {
        if (result.isConfirmed) {
          newSocket.emit("chess-challenge-response", { challenger, accepted: true });
          navigate('/chess');
        } else {
          newSocket.emit("chess-challenge-response", { challenger, accepted: false });
        }
      });
    });

    newSocket.on("chess-challenge-result", ({ accepted }) => {
      if (accepted) {
        Swal.fire('Challenge Accepted!', 'Redirecting to chess game...', 'success');
        navigate('/chess');
      } else {
        Swal.fire('Challenge Declined', 'The player declined your challenge', 'info');
      }
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
  const handleChessButton = () => {
    Swal.fire({
      title: "Enter your friend's username",
      input: "text",
      showCancelButton: true,
      confirmButtonText: 'Challenge',
      preConfirm: (opponent) => {
        if (!opponent) {
          Swal.showValidationMessage('Please enter a username');
        }
        return opponent;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const opponent = result.value;
        socket.emit("chess-challenge-request", { challenger: userName, opponent });
        Swal.fire('Challenge Sent!', 'Waiting for opponent to respond...', 'info');
      }
    });
  };
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 bg-gray-200 p-12 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              userName === msg.userName ? "justify-end" : "justify-start"
            } `}
          >
            <div className="bg-white p-2 w-fit rounded-md mb-2">
              <span className="font-bold">
                {userName === msg.userName ? "YOU" : msg.userName}:
              </span>{" "}
              {msg.message}
            </div>
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
          onClick={handleChessButton}
          className="bg-green-500 mx-2 text-white px-4 py-2 rounded-md"
        >
          Chess
        </button>
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
