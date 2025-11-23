import React, { useState, useEffect } from 'react';
import { Plus, X, Bell, Clock, Edit2, Trash2 } from 'lucide-react';

interface Reminder {
    id: number;
    title: string;
    description: string;
    dateTime: string; // ISO string format
    notified: boolean;
}

const ReminderCard: React.FC = () => {
    const [reminders, setReminders] = useState<Reminder[]>(() => {
        const saved = localStorage.getItem('reminders');
        return saved ? JSON.parse(saved) : [];
    });

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dateTime: ''
    });

    // Save to localStorage whenever reminders change
    useEffect(() => {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }, [reminders]);

    // Check for due reminders every minute
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            reminders.forEach(reminder => {
                const reminderTime = new Date(reminder.dateTime);
                if (!reminder.notified && reminderTime <= now) {
                    // Show browser notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(reminder.title, {
                            body: reminder.description,
                            icon: '/favicon.ico',
                            badge: '/favicon.ico'
                        });
                    }

                    // Mark as notified
                    setReminders(prev => prev.map(r =>
                        r.id === reminder.id ? { ...r, notified: true } : r
                    ));
                }
            });
        };

        // Request notification permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const interval = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Check immediately

        return () => clearInterval(interval);
    }, [reminders]);

    const handleAddReminder = () => {
        if (formData.title && formData.dateTime) {
            const newReminder: Reminder = {
                id: Date.now(),
                title: formData.title,
                description: formData.description,
                dateTime: formData.dateTime,
                notified: false
            };
            setReminders([...reminders, newReminder]);
            setFormData({ title: '', description: '', dateTime: '' });
            setShowAddForm(false);
        }
    };

    const handleEditReminder = () => {
        if (editingId && formData.title && formData.dateTime) {
            setReminders(reminders.map(r =>
                r.id === editingId
                    ? { ...r, title: formData.title, description: formData.description, dateTime: formData.dateTime, notified: false }
                    : r
            ));
            setFormData({ title: '', description: '', dateTime: '' });
            setEditingId(null);
        }
    };

    const handleDeleteReminder = (id: number) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const startEdit = (reminder: Reminder) => {
        setEditingId(reminder.id);
        setFormData({
            title: reminder.title,
            description: reminder.description,
            dateTime: reminder.dateTime
        });
        setShowAddForm(true);
    };

    const cancelForm = () => {
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ title: '', description: '', dateTime: '' });
    };

    const getTimeUntil = (dateTime: string) => {
        const now = new Date();
        const target = new Date(dateTime);
        const diff = target.getTime() - now.getTime();

        if (diff < 0) return 'Overdue';

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `In ${minutes} min${minutes > 1 ? 's' : ''}`;
        return 'Soon';
    };

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-gradient-to-br from-teal-500/80 to-teal-600/70 dark:from-teal-600/70 dark:to-teal-700/60 rounded-3xl p-4 text-white shadow-md mb-6">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm md:text-base font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Reminders
                </h4>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mb-3 space-y-2">
                    <input
                        type="text"
                        placeholder="Reminder title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <input
                        type="datetime-local"
                        value={formData.dateTime}
                        onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                        className="w-full px-3 py-2 bg-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={editingId ? handleEditReminder : handleAddReminder}
                            className="flex-1 bg-white text-teal-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition"
                        >
                            {editingId ? 'Update' : 'Add'}
                        </button>
                        <button
                            onClick={cancelForm}
                            className="px-3 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Reminders List */}
            <div className="space-y-2">
                {reminders.length === 0 ? (
                    <p className="text-sm text-white/70 text-center py-4">
                        No reminders set. Click + to add one!
                    </p>
                ) : (
                    reminders
                        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                        .map(reminder => (
                            <div
                                key={reminder.id}
                                className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 ${reminder.notified ? 'opacity-50' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <div className="flex-1">
                                        <h5 className="font-medium text-sm">{reminder.title}</h5>
                                        {reminder.description && (
                                            <p className="text-xs text-white/80 mt-0.5">{reminder.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => startEdit(reminder)}
                                            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReminder(reminder.id)}
                                            className="w-6 h-6 rounded-full bg-white/20 hover:bg-red-500/50 flex items-center justify-center transition"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDateTime(reminder.dateTime)}</span>
                                    <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full">
                                        {getTimeUntil(reminder.dateTime)}
                                    </span>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};

export default ReminderCard;
