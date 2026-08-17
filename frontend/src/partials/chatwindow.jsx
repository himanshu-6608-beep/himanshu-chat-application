import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import { socket } from "../services/socket";

import "../css/chatwindow.css";

import logo from "../images/ChatGPT_Image_Jul_30__2026__11_05_27_AM-removebg-preview.png";
import adminLogo from "../images/adminlogo.png";

const API_URL = "http://localhost:1222";

function ChatWindow({ selectedUser }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const loggedInUser = useMemo(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Invalid user data:", error);
            return null;
        }
    }, []);

    const token = localStorage.getItem("token");

    const loggedInUserId = loggedInUser?._id?.toString();
    const selectedUserId = selectedUser?._id?.toString();

    /*
     * Join socket room
     */
    useEffect(() => {
        if (!loggedInUserId) return;

        socket.emit("join", loggedInUserId);

        return () => {
            socket.emit("leave", loggedInUserId);
        };
    }, [loggedInUserId]);

    /*
     * Load conversation
     */
    useEffect(() => {
        if (!selectedUserId || !token) {
            setMessages([]);
            return;
        }

        let cancelled = false;

        const loadMessages = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/api/messages/${selectedUserId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!cancelled) {
                    setMessages(response.data?.messages || []);
                }
            } catch (error) {
                console.error(
                    "Load messages error:",
                    error.response?.data || error
                );

                if (!cancelled) {
                    setMessages([]);
                }
            }
        };

        loadMessages();

        return () => {
            cancelled = true;
        };
    }, [selectedUserId, token]);

    /*
     * Receive messages
     */
    useEffect(() => {
        if (!loggedInUserId) return;

        const receiveMessage = (msg) => {
            if (!msg?.sender || !msg?.receiver) return;

            const senderId = msg.sender.toString();
            const receiverId = msg.receiver.toString();

            const belongsToCurrentChat =
                (senderId === loggedInUserId &&
                    receiverId === selectedUserId) ||
                (senderId === selectedUserId &&
                    receiverId === loggedInUserId);

            if (belongsToCurrentChat) {
                setMessages((prev) => {
                    /*
                     * Prevent duplicate socket messages
                     */
                    const alreadyExists = prev.some(
                        (item) => item._id === msg._id
                    );

                    if (alreadyExists) {
                        return prev;
                    }

                    return [...prev, msg];
                });
            }

            /*
             * Browser notification
             */
            if (
                senderId !== loggedInUserId &&
                typeof window !== "undefined" &&
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                new Notification("New Message", {
                    body: msg.message,
                    icon: logo,
                });
            }
        };

        socket.on("receive-message", receiveMessage);

        return () => {
            socket.off("receive-message", receiveMessage);
        };
    }, [loggedInUserId, selectedUserId]);

    /*
     * Auto scroll
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    /*
     * Focus input when changing conversation
     */
    useEffect(() => {
        if (selectedUserId) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [selectedUserId]);

    /*
     * Send message
     */
    const sendMessage = () => {
        const trimmedMessage = message.trim();

        if (
            !trimmedMessage ||
            !loggedInUserId ||
            !selectedUserId ||
            sending
        ) {
            return;
        }

        setSending(true);

        socket.emit("send-message", {
            sender: loggedInUserId,
            receiver: selectedUserId,
            message: trimmedMessage,
        });

        setMessage("");
        setSending(false);

        inputRef.current?.focus();
    };

    /*
     * Enter to send
     */
    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    /*
     * Empty state
     */
    if (!selectedUser) {
        return (
            <div className="chat-window">
                <div className="no-chat-selected">
                    <img
                        src={logo}
                        alt="KikChat"
                        className="empty-logo"
                    />

                    <h2>
                        Welcome to <span>KikChat</span>
                    </h2>

                    <p>
                        Select a conversation from the left panel and start
                        chatting instantly with your friends.
                    </p>
                </div>
            </div>
        );
    }

    const profileImage = selectedUser.profileImage
        ? `${API_URL}/uploads/${selectedUser.profileImage}`
        : adminLogo;

    return (
        <div className="chat-window">

            {/* ================= HEADER ================= */}

            <div className="chat-header">
                <div className="chat-user">

                    <img
                        src={profileImage}
                        alt={selectedUser.name || "Profile"}
                        onError={(event) => {
                            event.currentTarget.src = adminLogo;
                        }}
                    />

                    <div className="chat-user-info">
                        <h3>{selectedUser.name}</h3>

                        <span
                            className={`online-status ${
                                selectedUser.isOnline
                                    ? "is-online"
                                    : "is-offline"
                            }`}
                        >
                            {selectedUser.isOnline
                                ? "Online"
                                : "Offline"}
                        </span>
                    </div>
                </div>
            </div>

            {/* ================= MESSAGES ================= */}

            <div className="messages-container">

                {messages.length === 0 ? (
                    <div className="empty-conversation">
                        <div className="empty-conversation-icon">
                            💬
                        </div>

                        <h4>No messages yet</h4>

                        <p>
                            Start a conversation with {selectedUser.name}.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isSent =
                            msg.sender?.toString() === loggedInUserId;

                        return (
                            <div
                                key={
                                    msg._id ||
                                    `${msg.createdAt}-${msg.message}`
                                }
                                className={`message ${
                                    isSent ? "sent" : "received"
                                }`}
                            >
                                <p>{msg.message}</p>

                                {msg.createdAt && (
                                    <span className="message-time">
                                        {new Date(
                                            msg.createdAt
                                        ).toLocaleString([], {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* ================= INPUT ================= */}

            <div className="message-input-area">

                <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Message ${selectedUser.name}...`}
                    value={message}
                    onChange={(event) =>
                        setMessage(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    autoComplete="off"
                />

                <button
                    type="button"
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={!message.trim() || sending}
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}

export default ChatWindow;