import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    onClose: (id: string) => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, onClose, duration]);

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    return (
        <div className={`${colors[type]} rounded-2xl p-4 shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-down`}>
            {icons[type]}
            <p className="flex-1 font-medium">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="hover:bg-white/20 rounded-full p-1 transition"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
