import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
    type User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signup: (email: string, password: string, displayName?: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithApple: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const clearError = () => setError(null);

    const signup = async (email: string, password: string, displayName?: string) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name if provided
            if (displayName && result.user) {
                await updateProfile(result.user, { displayName });
            }
        } catch (err: any) {
            const errorMessage = getErrorMessage(err.code);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            const errorMessage = getErrorMessage(err.code);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const loginWithGoogle = async () => {
        try {
            setError(null);
            // Try popup first, but have redirect as fallback
            try {
                await signInWithPopup(auth, googleProvider);
            } catch (popupError: any) {
                // If popup is blocked or fails, try redirect
                if (popupError.code === 'auth/popup-blocked' ||
                    popupError.code === 'auth/popup-closed-by-user' ||
                    popupError.code === 'auth/cancelled-popup-request') {
                    // Use redirect instead
                    const { signInWithRedirect } = await import('firebase/auth');
                    await signInWithRedirect(auth, googleProvider);
                    return; // Return early as redirect will handle the rest
                }
                throw popupError;
            }
        } catch (err: any) {
            let errorMessage = getErrorMessage(err.code);

            // Add helpful message for configuration issues
            if (err.code === 'auth/operation-not-allowed') {
                errorMessage = 'Google sign-in is not enabled. Please enable Google authentication in Firebase Console: Authentication → Sign-in method → Google';
            } else if (err.code === 'auth/unauthorized-domain') {
                errorMessage = 'This domain is not authorized. Add your domain in Firebase Console: Authentication → Settings → Authorized domains';
            }

            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const loginWithApple = async () => {
        try {
            setError(null);
            // Try popup first, but have redirect as fallback
            try {
                await signInWithPopup(auth, appleProvider);
            } catch (popupError: any) {
                // If popup is blocked or fails, try redirect
                if (popupError.code === 'auth/popup-blocked' ||
                    popupError.code === 'auth/popup-closed-by-user' ||
                    popupError.code === 'auth/cancelled-popup-request') {
                    // Use redirect instead
                    const { signInWithRedirect } = await import('firebase/auth');
                    await signInWithRedirect(auth, appleProvider);
                    return; // Return early as redirect will handle the rest
                }
                throw popupError;
            }
        } catch (err: any) {
            let errorMessage = getErrorMessage(err.code);

            // Add helpful message for configuration issues
            if (err.code === 'auth/operation-not-allowed') {
                errorMessage = 'Apple sign-in is not enabled. Please enable Apple authentication in Firebase Console: Authentication → Sign-in method → Apple';
            } else if (err.code === 'auth/unauthorized-domain') {
                errorMessage = 'This domain is not authorized. Add your domain in Firebase Console: Authentication → Settings → Authorized domains';
            }

            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err: any) {
            const errorMessage = getErrorMessage(err.code);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const value = {
        user,
        loading,
        error,
        signup,
        login,
        loginWithGoogle,
        loginWithApple,
        logout,
        clearError
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please log in instead.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/operation-not-allowed':
            return 'This sign-in method is not enabled. Please contact support.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in cancelled. Please try again.';
        case 'auth/cancelled-popup-request':
            return 'Sign-in cancelled.';
        case 'auth/popup-blocked':
            return 'Sign-in popup was blocked. Please allow popups or try again.';
        case 'auth/unauthorized-domain':
            return 'This domain is not authorized. Please add it in Firebase Console.';
        case 'auth/invalid-api-key':
            return 'Invalid Firebase API key. Please check your Firebase configuration.';
        default:
            return 'An error occurred. Please try again.';
    }
}
