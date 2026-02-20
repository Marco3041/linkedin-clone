import React, { useState, useEffect } from 'react';
import './Network.css';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import { Avatar } from '@mui/material';

function Network() {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [myConnections, setMyConnections] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists() && doc.data().connections) {
                setMyConnections(doc.data().connections);
            }
        });

        const usersCollection = collection(db, 'users');
        const unsubscribeUsers = onSnapshot(usersCollection, (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        });

        return () => {
            unsubscribeUser();
            unsubscribeUsers();
        };
    }, [currentUser]);

    const handleConnect = async (targetUserId) => {
        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                connections: arrayUnion(targetUserId)
            });
        } catch (error) {
            console.error("Error connecting: ", error);
        }
    };

    const suggestions = users.filter(user =>
        user.id !== currentUser?.uid && !myConnections.includes(user.id)
    );

    const connectRequest = (user) => (
        <div key={user.id} className="network__person">
            <div className='network__personLeft' style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={user.photoUrl}>{user.name?.[0]}</Avatar>
                <div style={{ marginLeft: '10px' }}>
                    <h3>{user.name}</h3>
                    <p style={{ fontSize: '12px', color: 'gray' }}>{user.email}</p>
                </div>
            </div>
            <button onClick={() => handleConnect(user.id)}>Connect</button>
        </div>
    );

    return (
        <div className="network">
            <div className="network__header">
                <h2>My Network</h2>
            </div>

            <div className="network__body">
                <p style={{ marginBottom: '15px', color: 'gray' }}>Connections: {myConnections.length}</p>

                <h3>People you may know</h3>
                <div className="network__list">
                    {suggestions.length > 0 ? (
                        suggestions.map(user => connectRequest(user))
                    ) : (
                        <p style={{ marginTop: '10px', color: 'gray' }}>No new suggestions at the moment.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Network;
