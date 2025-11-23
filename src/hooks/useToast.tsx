import { useState, useCallback } from 'react';
import type { ToastType } from '../components/Toast';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        success: (message: string) => addToast('success', message),
        error: (message: string) => addToast('error', message),
        info: (message: string) => addToast('info', message),
    };
};
