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
import { collection, onSnapshot, addDoc, orderBy, query, serverTimestamp, getDocs } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

function Feed() {
    const [posts, setPosts] = useState([]);
    const [input, setInput] = useState('');
    const [photoInputUrl, setPhotoInputUrl] = useState('');
    const { currentUser } = useAuth();
    const { searchTerm } = useSearch();

    useEffect(() => {
        // Reference the 'posts' collection
        const postsCollection = collection(db, "posts");
        const seedFeed = async () => {
            const snapshot = await getDocs(postsCollection);
            if (snapshot.empty) {
                const initialPosts = [
                    {
                        name: "Mohit Bhat",
                        description: "Full Stack Developer",
                        message: "Welcome to my Professional Networking Platform! I built this to solve the continuous development problem for students. Connect with me!",
                        photoUrl: "https://news.hitb.org/sites/default/files/styles/large/public/field/image/500px-LinkedIn_Logo.svg__1.png?itok=q_lR0Vks",
                        likes: [],
                        timestamp: new Date()
                    },
                    {
                        name: "Tech Recruiter",
                        description: "Hiring at Top Tier Companies",
                        message: "We are actively looking for talented React Developers. Check out our Jobs page and click Easy Apply!",
                        photoUrl: "",
                        likes: [],
                        timestamp: new Date()
                    },
                    {
                        name: "Jane Doe",
                        description: "UI/UX Designer",
                        message: "Just updated my portfolio. I love the new Dark Mode feature on this platform! Let me know what you think of the design.",
                        photoUrl: "",
                        likes: [],
                        timestamp: new Date()
                    }
                ];
                for (let post of initialPosts) {
                    await addDoc(postsCollection, { ...post, timestamp: serverTimestamp() });
                }
            }
        };

        seedFeed();

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
                postImageUrl: photoInputUrl || '', // Store the attached image if any
                timestamp: serverTimestamp(),
                likes: []
            });
            setInput("");
            setPhotoInputUrl("");
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

    const handlePhotoAdd = () => {
        const url = prompt("Enter an Image URL to attach to your post:");
        if (url) {
            setPhotoInputUrl(url);
        }
    };

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
                    <InputOption Icon={ImageIcon} title="Add Image URL" color="#70B5F9" onClick={handlePhotoAdd} />
                    {photoInputUrl && <span style={{ fontSize: '12px', color: 'green', marginLeft: '10px' }}>Image Attached! ✓</span>}
                </div>
            </div>

            {/* Posts */}
            {filteredPosts.map(({ id, data: { name, description, message, photoUrl, postImageUrl, likes } }) => (
                <Post
                    key={id}
                    id={id}
                    name={name}
                    description={description}
                    message={message}
                    photoUrl={photoUrl}
                    postImageUrl={postImageUrl}
                    likes={likes || []}
                />
            ))}
        </div>
    );
}

export default Feed;
