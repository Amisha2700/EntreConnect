import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./chatbox.css";

const SOCKET_SERVER_URL = "http://localhost:5050";

const ChatPage = () => {
  const { emailid } = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const getUserDetails = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return { email: decoded.emailid, role: decoded.role };
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  const user = getUserDetails();
  const userEmail = user?.email;
  const userRole = user?.role;

  useEffect(() => {
    if (!userEmail || !userRole) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to socket:", newSocket.id);
      newSocket.emit("addUser", { email: userEmail, role: userRole });
    });

    newSocket.on("getMessage", (message) => {
      if (
        (userRole === "investor" && message.senderRole === "entre") ||
        (userRole === "entre" && message.senderRole === "investor")
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    newSocket.on("disconnect", () => {
      console.warn("❌ Disconnected from socket");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userEmail, userRole]);

  const sendMessage = () => {
    if (!emailid || !text.trim() || !socket || !userEmail || !userRole) {
      console.log("Missing required fields!");
      return;
    }

    const messageData = {
      senderId: userEmail,
      senderRole: userRole,
      receiverId: emailid,
      text,
    };

    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setText("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <h2>Chat with {emailid}</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.senderId === userEmail ? "sent" : "received"}`}
          >
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="input-field"
        />
        <button onClick={sendMessage} className="send-button">Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
