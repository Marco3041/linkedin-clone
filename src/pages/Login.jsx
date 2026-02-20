import React, { useState } from 'react';
import './Login.css';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [isRegistering, setIsRegistering] = useState(false); // New State
    const navigate = useNavigate();

    const loginToApp = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userAuth) => {
                if (!userAuth.user.emailVerified) {
                    await signOut(auth);
                    alert("Please verify your email address before logging in. Check your inbox.");
                    return;
                }
                navigate('/');
            })
            .catch(error => alert(error));
    };

    const register = (e) => {
        e.preventDefault();
        if (!name) {
            return alert("Please enter a full name!");
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userAuth) => {
                await updateProfile(userAuth.user, {
                    displayName: name,
                    photoURL: profilePic,
                });

                await setDoc(doc(db, "users", userAuth.user.uid), {
                    name: name,
                    email: email,
                    photoUrl: profilePic,
                    connections: []
                }, { merge: true });

                await sendEmailVerification(userAuth.user);
                await signOut(auth); // Force them to log in after verifying

                alert("Account created! Please check your email to verify your account before logging in.");
                setIsRegistering(false); // Switch back to login view
            })
            .catch(error => alert(error.message));
    };

    return (
        <div className="login">
            <img src="https://news.hitb.org/sites/default/files/styles/large/public/field/image/500px-LinkedIn_Logo.svg__1.png?itok=q_lR0Vks" alt="" />

            <form>
                {isRegistering && (
                    <>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full name (required)"
                            type="text"
                        />
                        <input
                            value={profilePic}
                            onChange={(e) => setProfilePic(e.target.value)}
                            placeholder="Profile pic URL (optional)"
                            type="text"
                        />
                    </>
                )}

                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                />

                <button type="submit" onClick={isRegistering ? register : loginToApp}>
                    {isRegistering ? "Sign Up" : "Sign In"}
                </button>
            </form>

            <p>
                {isRegistering ? "Already a member? " : "Not a member? "}
                <span className="login__register" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? "Login Now" : "Register Now"}
                </span>
            </p>
        </div>
    );
}

export default Login;
