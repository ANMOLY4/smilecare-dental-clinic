// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4bb8HgKCBSYDofjDAxQTazOonUNIyYKA",
  authDomain: "smile-care-dental-fbfba.firebaseapp.com",
  projectId: "smile-care-dental-fbfba",
  storageBucket: "smile-care-dental-fbfba.firebasestorage.app",
  messagingSenderId: "912898547196",
  appId: "1:912898547196:web:0e2d369daba6ae1fd6a679"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);