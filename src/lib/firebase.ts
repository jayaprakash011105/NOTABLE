// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyBd1bHB3QijW3wUOSvMcxEmvWYpdKRcOL4",
    authDomain: "notable-54242.firebaseapp.com",
    databaseURL: "https://notable-54242-default-rtdb.firebaseio.com",
    projectId: "notable-54242",
    storageBucket: "notable-54242.firebasestorage.app",
    messagingSenderId: "127677345216",
    appId: "1:127677345216:web:b00a6328e156fbc460ec25",
    measurementId: "G-M3ZP4DT6FV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics with error handling (can fail in certain environments)
let analyticsInstance;
try {
    if (typeof window !== 'undefined') {
        analyticsInstance = getAnalytics(app);
    }
} catch (error) {
    console.warn('Firebase Analytics could not be initialized:', error);
}
export const analytics = analyticsInstance;

// Configure authentication providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export default app;
