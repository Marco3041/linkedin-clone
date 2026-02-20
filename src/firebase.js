import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqUVhSecnZPFVPOCMH0x13yezfpDdbhv8",
  authDomain: "linkdin-clone-d5dc5.firebaseapp.com",
  projectId: "linkdin-clone-d5dc5",
  storageBucket: "linkdin-clone-d5dc5.firebasestorage.app",
  messagingSenderId: "692500154625",
  appId: "1:692500154625:web:3393e9c75e155f01373300",
  measurementId: "G-SRBP5H815V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
