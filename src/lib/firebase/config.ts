
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4RSjZg3kZbcmWjYy0cTIenUg5LzTUpVY",
  authDomain: "carematch-ai-sscu0.firebaseapp.com",
  projectId: "carematch-ai-sscu0",
  storageBucket: "carematch-ai-sscu0.firebasestorage.app",
  messagingSenderId: "892914063910",
  appId: "1:892914063910:web:850d8e86ff7e8181e4a4e7"
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
