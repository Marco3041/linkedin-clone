import React, { useState, useEffect } from 'react';
import './Feed.css';
import CreateIcon from '@mui/icons-material/Create';
import ImageIcon from '@mui/icons-material/Image';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import InputOption from './InputOption';
import Post from './Post';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

function Feed() {
    const [posts, setPosts] = useState([]);
    const [input, setInput] = useState('');
    const { currentUser } = useAuth();
    const { searchTerm } = useSearch();

    useEffect(() => {
        // Reference the 'posts' collection
        const postsCollection = collection(db, "posts");
        // Create a query ordered by timestamp
        const q = query(postsCollection, orderBy("timestamp", "desc"));

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            })));
        });

        return () => {
            unsubscribe();
        }
    }, []);

    const sendPost = async (e) => {
        e.preventDefault();

        if (!input.trim()) return;

        try {
            await addDoc(collection(db, 'posts'), {
                name: currentUser?.displayName || 'User',
                description: currentUser?.email || 'user@example.com',
                message: input,
                photoUrl: currentUser?.photoURL || '',
                timestamp: serverTimestamp()
            });
            setInput("");
        } catch (error) {
            console.error("Error adding post: ", error);
            alert("Failed to send post. Check console.");
        }
    }

    const filteredPosts = posts.filter(({ data: { message, name, description } }) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (message && message.toLowerCase().includes(term)) ||
            (name && name.toLowerCase().includes(term)) ||
            (description && description.toLowerCase().includes(term));
    });

    return (
        <div className="feed">
            <div className="feed__inputContainer">
                <div className="feed__input">
                    <CreateIcon />
                    <form>
                        <input value={input} onChange={e => setInput(e.target.value)} type="text" placeholder='Start a post' />
                        <button onClick={sendPost} type="submit">Send</button>
                    </form>
                </div>
                <div className="feed__inputOptions">
                    <InputOption Icon={ImageIcon} title="Photo" color="#70B5F9" />
                    <InputOption Icon={SubscriptionsIcon} title="Video" color="#E7A33E" />
                    <InputOption Icon={EventNoteIcon} title="Event" color="#C0CBCD" />
                    <InputOption Icon={CalendarViewDayIcon} title="Write article" color="#7FC15E" />
                </div>
            </div>

            {/* Posts */}
            {filteredPosts.map(({ id, data: { name, description, message, photoUrl } }) => (
                <Post
                    key={id}
                    name={name}
                    description={description}
                    message={message}
                    photoUrl={photoUrl}
                />
            ))}
        </div>
    );
}

export default Feed;
