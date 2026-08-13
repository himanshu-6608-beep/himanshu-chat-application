import { useState, useEffect, useMemo, useRef } from "react";
import { socket } from "../services/socket";
import axios from "axios";
import { Send } from "lucide-react";
import "../css/chatwindow.css";
import logo from "../images/ChatGPT_Image_Jul_30__2026__11_05_27_AM-removebg-preview.png";
import adminLogo from "../images/adminlogo.png"
function ChatWindow({ selectedUser }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const messagesEndRef = useRef(null);

    const loggedInUser = useMemo(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    }, []);
    const token = localStorage.getItem("token")
    useEffect(() => {
        if (loggedInUser?._id) {
            socket.emit("join", loggedInUser._id);
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (!selectedUser) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:1222/api/messages/${selectedUser._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setMessages(data.messages);
            } catch (err) {
                console.log(err);
            }
        };

        loadMessages();
    }, [selectedUser, loggedInUser]);

    useEffect(() => {
        const receiveMessage = (msg) => {
            if (!selectedUser) return;

            const sender = msg.sender.toString();
            const receiver = msg.receiver.toString();

            if (
                selectedUser &&
                (
                    (sender === loggedInUser._id &&
                        receiver === selectedUser._id) ||
                    (sender === selectedUser._id &&
                        receiver === loggedInUser._id)
                )
            ) {
                setMessages((prev) => [...prev, msg]);
            }

            if (
                sender !== loggedInUser._id &&
                Notification.permission === "granted"
            ) {
                new Notification("New Message", {
                    body: msg.message,
                    icon: "/logo.png",
                });
            }
        };

        socket.on("receive-message", receiveMessage);

        return () => {
            socket.off("receive-message", receiveMessage);
        };
    }, [selectedUser, loggedInUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const sendMessage = () => {
        if (!message.trim() || !selectedUser) return;

        socket.emit("send-message", {
            sender: loggedInUser._id,
            receiver: selectedUser._id,
            message: message.trim(),
        });

        setMessage("");
    };

    if (!selectedUser) {
        return (
            <div className="chat-window">
                <div className="no-chat-selected">
                    <img
                        src={logo}
                        alt="KikChat"
                        className="empty-logo"
                    />

                    <h2>Welcome to KikChat</h2>

                    <p>
                        Select a conversation from the left panel and start
                        chatting instantly with your friends.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">

                <div className="chat-user">
                    <img src={selectedUser?.profileImage ? `http://localhost:1222/uploads/${selectedUser.profileImage}` : adminLogo} alt={selectedUser.name || "Profile"} className="settings-profile-image" />

                    <div className="chat-user-info">
                        <h3>{selectedUser.name}</h3>

                        <span>
                            {selectedUser.isOnline ? "🟢Online" : "🔴Offline"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="messages-container">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`message ${msg.sender.toString() === loggedInUser._id
                            ? "sent"
                            : "received"
                            }`}
                    >
                        <p>{msg.message}</p>

                        <span className="message-time">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                ))}

                <div ref={messagesEndRef}></div>
            </div>

            <div className="message-input-area">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                <button
                    className="send-btn"
                    onClick={sendMessage}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}

export default ChatWindow;