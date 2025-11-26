// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyA5vGR9FPCs3cafZVn9BhNwpJwS8rQt7Pc",
    authDomain: "notable-05.firebaseapp.com",
    projectId: "notable-05",
    storageBucket: "notable-05.firebasestorage.app",
    messagingSenderId: "532719545728",
    appId: "1:532719545728:web:00db6b68c60c3395eba565",
    measurementId: "G-5KYFE1TKHL"
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
