import React, { useState, useEffect } from 'react';
import './Profile.css';
import { Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

function Profile() {
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        bio: "This is a bio section. You can edit this.",
        skills: "React, JavaScript, CSS",
        experience: "Software Engineer Intern at Google"
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            }
        }
        fetchUserData();
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser) return;
        try {
            await setDoc(doc(db, "users", currentUser.uid), userData, { merge: true });
            setIsEditing(false);
            alert("Profile Saved!");
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    return (
        <div className="profile">
            <div className="profile__top">
                <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHw%3D&w=1000&q=80" alt="" />
                <Avatar src={currentUser?.photoURL} className="profile__avatar">
                    {currentUser?.displayName?.[0]}
                </Avatar>
                <h2>{currentUser?.displayName}</h2>
                <h4>{currentUser?.email}</h4>

                <div className="profile__stats">
                    <div className="profile__stat">
                        <p>Who viewed you</p>
                        <p className="profile__statNumber">2,543</p>
                    </div>
                    <div className="profile__stat">
                        <p>Views on post</p>
                        <p className="profile__statNumber">2,448</p>
                    </div>
                </div>
            </div>

            <div className="profile__about">
                <div className="profile__headerLine">
                    <h3>About</h3>
                    {isEditing ? (
                        <SaveIcon className="profile__icon" onClick={handleSave} />
                    ) : (
                        <EditIcon className="profile__icon" onClick={() => setIsEditing(true)} />
                    )}
                </div>

                {isEditing ? (
                    <textarea
                        className="profile__input"
                        name="bio"
                        value={userData.bio}
                        onChange={handleChange}
                        rows="4"
                    />
                ) : (
                    <p>{userData.bio}</p>
                )}

                <h3 style={{ marginTop: '20px' }}>Skills</h3>
                {isEditing ? (
                    <input
                        className="profile__input"
                        name="skills"
                        value={userData.skills}
                        onChange={handleChange}
                    />
                ) : (
                    <p className="profile__skills">{userData.skills}</p>
                )}
            </div>

            <div className="profile__experience">
                <h3>Experience</h3>
                <div className="profile__experienceItem">
                    {isEditing ? (
                        <input
                            className="profile__input"
                            name="experience"
                            value={userData.experience}
                            onChange={handleChange}
                        />
                    ) : (
                        <h4>{userData.experience}</h4>
                    )}
                    {/* For now keeping it simple with one line string */}
                    {/* <p>Google • 2023 - Present</p> */}
                </div>
            </div>
        </div>
    );
}

export default Profile;
