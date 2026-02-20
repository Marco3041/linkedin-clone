import React, { useState, useEffect } from 'react';
import './Messaging.css';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import { Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function Messaging() {
    const { currentUser } = useAuth();
    const [connections, setConnections] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // 1. Fetch current user's connections
    useEffect(() => {
        if (!currentUser) return;
        const fetchConnections = async () => {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists() && userDoc.data().connections) {
                const connIds = userDoc.data().connections;
                // Fetch details for each connection (in a real app, do this more efficiently)
                const connDetails = [];
                for (let id of connIds) {
                    const cDoc = await getDoc(doc(db, 'users', id));
                    if (cDoc.exists()) {
                        connDetails.push({ id: cDoc.id, ...cDoc.data() });
                    }
                }
                setConnections(connDetails);
            }
        };
        fetchConnections();
    }, [currentUser]);

    // Generate a unique 1-to-1 chat ID
    const getChatId = (uid1, uid2) => {
        return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
    };

    // 2. Fetch messages when an active chat is selected
    useEffect(() => {
        if (!activeChatUser || !currentUser) return;

        const chatId = getChatId(currentUser.uid, activeChatUser.id);
        const q = query(
            collection(db, "messages"),
            where("chatId", "==", chatId),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [activeChatUser, currentUser]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChatUser) return;

        const chatId = getChatId(currentUser.uid, activeChatUser.id);

        try {
            await addDoc(collection(db, "messages"), {
                chatId: chatId,
                senderId: currentUser.uid,
                text: newMessage,
                timestamp: serverTimestamp()
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    return (
        <div className="messaging">
            {/* Sidebar with connections */}
            <div className="messaging__sidebar">
                <div className="messaging__header">
                    <h3>Messaging</h3>
                </div>
                <div className="messaging__connections">
                    {connections.length === 0 ? (
                        <p style={{ padding: '20px', color: 'gray' }}>Connect with people on the Network page to chat.</p>
                    ) : (
                        connections.map(user => (
                            <div
                                key={user.id}
                                className={`messaging__connection ${activeChatUser?.id === user.id && 'messaging__connection--active'}`}
                                onClick={() => setActiveChatUser(user)}
                            >
                                <Avatar src={user.photoUrl}>{user.name?.[0]}</Avatar>
                                <div className="messaging__connectionInfo">
                                    <h4>{user.name}</h4>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="messaging__chat">
                {!activeChatUser ? (
                    <div className="messaging__placeholder">
                        <p>Select a connection to start messaging.</p>
                    </div>
                ) : (
                    <>
                        <div className="messaging__chatHeader">
                            <Avatar src={activeChatUser.photoUrl}>{activeChatUser.name?.[0]}</Avatar>
                            <h3>{activeChatUser.name}</h3>
                        </div>

                        <div className="messaging__messages">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`message ${msg.senderId === currentUser.uid ? 'message__sent' : 'message__received'}`}
                                >
                                    <p>{msg.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="messaging__input">
                            <form onSubmit={sendMessage}>
                                <input
                                    type="text"
                                    placeholder="Write a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" disabled={!newMessage.trim()}>
                                    <SendIcon />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Messaging;
