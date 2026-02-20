import React, { forwardRef, useState, useEffect } from 'react';
import './Post.css';
import { Avatar } from '@mui/material';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SendIcon from '@mui/icons-material/Send';
import InputOption from './InputOption';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, onSnapshot, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Post = forwardRef(({ id, name, description, message, photoUrl, postImageUrl, likes = [] }, ref) => {
    const { currentUser } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const isLiked = currentUser ? likes.includes(currentUser.uid) : false;

    useEffect(() => {
        if (!id || !showComments) return;

        const q = query(
            collection(db, `posts/${id}/comments`),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [id, showComments]);

    const toggleLike = async () => {
        if (!currentUser || !id) return;

        const postRef = doc(db, 'posts', id);
        try {
            if (isLiked) {
                await updateDoc(postRef, {
                    likes: arrayRemove(currentUser.uid)
                });
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(currentUser.uid)
                });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser || !id) return;

        try {
            await addDoc(collection(db, `posts/${id}/comments`), {
                text: newComment,
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userPhoto: currentUser.photoURL,
                timestamp: serverTimestamp()
            });
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment: ", error);
        }
    };

    const handleShare = () => {
        alert("Post link copied to clipboard! (Simulated)");
    };

    const handleSend = () => {
        alert("Select connections to send this post to. (Simulated)");
    };

    return (
        <div ref={ref} className="post">
            <div className="post__header">
                <Avatar src={photoUrl || name?.[0]} >{name?.[0]}</Avatar>

                <div className="post__info">
                    <h2>{name}</h2>
                    <p>{description}</p>
                </div>
            </div>

            <div className="post__body">
                <p>{message}</p>
                {postImageUrl && (
                    <img
                        src={postImageUrl}
                        alt="Post attachment"
                        style={{ width: '100%', borderRadius: '10px', marginTop: '10px', objectFit: 'contain', maxHeight: '500px' }}
                    />
                )}
            </div>

            <div className="post__buttons">
                <InputOption
                    Icon={isLiked ? ThumbUpIcon : ThumbUpAltOutlinedIcon}
                    title={likes.length > 0 ? `Like (${likes.length})` : "Like"}
                    color={isLiked ? "#0a66c2" : "gray"}
                    onClick={toggleLike}
                />
                <InputOption
                    Icon={ChatOutlinedIcon}
                    title="Comment"
                    color={showComments ? "#0a66c2" : "gray"}
                    onClick={() => setShowComments(!showComments)}
                />
                <InputOption Icon={ShareOutlinedIcon} title="Share" color="gray" onClick={handleShare} />
                <InputOption Icon={SendOutlinedIcon} title="Send" color="gray" onClick={handleSend} />
            </div>

            {showComments && (
                <div className="post__comments">
                    <form className="post__commentForm" onSubmit={handleCommentSubmit}>
                        <Avatar src={currentUser?.photoURL} style={{ width: 30, height: 30 }} />
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" disabled={!newComment.trim()}>
                            <SendIcon style={{ fontSize: 18 }} />
                        </button>
                    </form>

                    <div className="post__commentsList">
                        {comments.map(comment => (
                            <div key={comment.id} className="post__comment">
                                <Avatar src={comment.userPhoto} style={{ width: 25, height: 25 }} />
                                <div className="post__commentBody">
                                    <span className="post__commentName">{comment.userName}</span>
                                    <p className="post__commentText">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default Post;
