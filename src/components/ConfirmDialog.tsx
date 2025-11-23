import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning'
}) => {
    if (!isOpen) return null;

    const variantColors = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-orange-500 hover:bg-orange-600',
        info: 'bg-blue-500 hover:bg-blue-600'
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl font-medium transition hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-6 py-3 ${variantColors[variant]} text-white rounded-2xl font-medium transition`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
