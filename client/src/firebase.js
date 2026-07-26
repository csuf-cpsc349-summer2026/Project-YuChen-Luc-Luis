import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAFMH1RCT6qOdpaWepuYhBkVc-pDkKY4a0",
    authDomain: "cpsc349-project-1a474.firebaseapp.com",
    projectId: "cpsc349-project-1a474",
    storageBucket: "cpsc349-project-1a474.firebasestorage.app",
    messagingSenderId: "632183239367",
    appId: "1:632183239367:web:cfc3c630d48bdf205404e2",
    measurementId: "G-0P0FHBRT31"
};

const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Cloud Firestore
export const db = getFirestore(app);

export default app;