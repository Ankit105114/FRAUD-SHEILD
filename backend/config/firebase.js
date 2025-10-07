import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD3-dP7FMPOA1PyHewcx6XfSJFNvkLSnOE", // Fixed typo: was aapiKey
  authDomain: "fraud-detection-system-1c685.firebaseapp.com",
  databaseURL: "https://fraud-detection-system-1c685-default-rtdb.firebaseio.com",
  projectId: "fraud-detection-system-1c685",
  storageBucket: "fraud-detection-system-1c685.firebasestorage.app",
  messagingSenderId: "23355196531",
  appId: "1:23355196531:web:3856e15984c583a3fad606",
  measurementId: "G-FLYW9H2GFV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Export the auth instance and a function to get it
export const getFirebaseAuth = () => auth;
export const getFirebaseDatabase = () => database;

// For backward compatibility
export const initializeFirebase = async () => {
  console.log('Firebase initialized successfully');
  return { app, auth, database };
};

export { auth, database };