import { useState, useEffect } from 'react';
import { Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface Reminder {
    id: number;
    title: string;
    description: string;
    dateTime: string;
    notified: boolean;
}

const Header = () => {
    const navigate = useNavigate();
    const { userName } = useUser();
    const [hasNotifications, setHasNotifications] = useState(false);
    const [dueRemindersCount, setDueRemindersCount] = useState(0);

    useEffect(() => {
        const checkReminders = () => {
            // Load reminders from localStorage
            const savedReminders = localStorage.getItem('reminders');
            if (!savedReminders) {
                setHasNotifications(false);
                setDueRemindersCount(0);
                return;
            }

            const reminders: Reminder[] = JSON.parse(savedReminders);
            const now = new Date();

            // Count reminders that are due but not yet notified
            const dueReminders = reminders.filter(reminder => {
                const reminderTime = new Date(reminder.dateTime);
                return reminderTime <= now && !reminder.notified;
            });

            setDueRemindersCount(dueReminders.length);
            setHasNotifications(dueReminders.length > 0);
        };

        // Check immediately
        checkReminders();

        // Check every 30 seconds for real-time updates
        const interval = setInterval(checkReminders, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between">
                {/* Welcome Text - compact and clean */}
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-black dark:text-white">
                        <span className="text-gray-500 dark:text-gray-400 font-normal text-base md:text-lg">Welcome, </span>
                        {userName}!
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Action Buttons - smaller and cleaner */}
                <div className="flex items-center gap-2">
                    {/* Notification Bell */}
                    <button
                        className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                        aria-label="Notifications"
                    >
                        <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        {hasNotifications && (
                            <>
                                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse" />
                                {dueRemindersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                                        {dueRemindersCount > 9 ? '9+' : dueRemindersCount}
                                    </span>
                                )}
                            </>
                        )}
                    </button>

                    {/* User Avatar */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                        aria-label="Profile"
                    >
                        <User className="w-4 h-4 text-white dark:text-black" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
