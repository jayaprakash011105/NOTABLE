import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalWrapperProps {
    isOpen?: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
    isOpen = true,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg'
    };

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}
        >
            <div
                className={`modal-content ${sizeClasses[size]}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default ModalWrapper;
