// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Added Auth
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore"; // Added persistent cache

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2-TnSDdWTcIIK3-ThoNU5mFkxOSt0944",
  authDomain: "als-elms-revamped.firebaseapp.com",
  projectId: "als-elms-revamped",
  storageBucket: "als-elms-revamped.firebasestorage.app",
  messagingSenderId: "206807366369",
  appId: "1:206807366369:web:4dcb7d7077ece7740195a0",
  measurementId: "G-J6FBGXQB4K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Auth and Firestore so other files can use them
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  ignoreUndefinedProperties: true
});