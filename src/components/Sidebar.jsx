import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useSearch } from '../context/SearchContext';

function Sidebar() {
    const { currentUser } = useAuth();
    const { setSearchTerm } = useSearch();
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        // Seed groups if empty
        const seedGroups = async () => {
            const groupsSnapshot = await getDocs(collection(db, 'groups'));
            if (groupsSnapshot.empty) {
                const initialGroups = [
                    { name: 'React Developers', members: [] },
                    { name: 'Frontend Engineers', members: [] },
                    { name: 'UI/UX Designers', members: [] }
                ];
                initialGroups.forEach(async (group) => {
                    await addDoc(collection(db, 'groups'), group);
                });
            }
        };
        seedGroups();

        // Listen to groups
        const unsubscribe = onSnapshot(collection(db, 'groups'), (snapshot) => {
            setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, []);

    const joinGroup = async (groupId) => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, 'groups', groupId), {
                members: arrayUnion(currentUser.uid)
            });
        } catch (error) {
            console.error("Error joining group:", error);
        }
    };

    const recentItem = (topic) => (
        <div className="sidebar__recentItem" onClick={() => setSearchTerm(topic)} style={{ cursor: 'pointer' }}>
            <span className="sidebar__hash">#</span>
            <p>{topic}</p>
        </div>
    );

    const groupItem = (group) => {
        const isMember = group.members?.includes(currentUser?.uid);
        return (
            <div key={group.id} className="sidebar__recentItem" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="sidebar__hash">#</span>
                    <p>{group.name}</p>
                </div>
                {!isMember && (
                    <span
                        onClick={() => joinGroup(group.id)}
                        style={{ color: '#0a66c2', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                    >
                        + Join
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="sidebar">
            <div className="sidebar__top">
                <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHw%3D&w=1000&q=80" alt="" />
                <Avatar src={currentUser?.photoURL} className="sidebar__avatar">
                    {currentUser?.displayName?.[0]}
                </Avatar>
                <h2>{currentUser?.displayName}</h2>
                <h4>{currentUser?.email}</h4>
            </div>

            <div className="sidebar__bottom">
                <p>Recent</p>
                {recentItem('reactjs')}
                {recentItem('programming')}
                {recentItem('softwareengineering')}
                {recentItem('design')}
                {recentItem('developer')}
            </div>

            <div className="sidebar__bottom">
                <p>Groups</p>
                {groups.map(group => groupItem(group))}
            </div>
        </div>
    );
}

export default Sidebar;
