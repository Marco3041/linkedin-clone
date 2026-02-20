import React, { useState, useEffect } from 'react';
import './Notifications.css';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import NotificationsIcon from '@mui/icons-material/Notifications';

function Notifications() {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", currentUser.uid),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        });

        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className="notifications">
            <div className="notifications__header">
                <h2>Notifications</h2>
            </div>

            <div className="notifications__list">
                {notifications.length === 0 ? (
                    <div className="notifications__empty">
                        <NotificationsIcon style={{ fontSize: 50, color: 'gray' }} />
                        <p>No new notifications right now.</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} className="notification__item">
                            <NotificationsIcon className="notification__icon" />
                            <div className="notification__info">
                                <p>{notif.message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Notifications;
