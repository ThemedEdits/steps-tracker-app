// Firebase configuration for RunTrack
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRO5yHAqy6J4msoGT9gut4xjM1_v9lUv4",
  authDomain: "steps-tracker-apps.firebaseapp.com",
  projectId: "steps-tracker-apps",
  storageBucket: "steps-tracker-apps.firebasestorage.app",
  messagingSenderId: "409175431688",
  appId: "1:409175431688:web"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore
export const db = getFirestore(app);

export default app;
