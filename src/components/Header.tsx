import { useState } from 'react';
import { Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Header = () => {
    const navigate = useNavigate();
    const { userName } = useUser();
    const [hasNotifications] = useState(true);

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                {/* Welcome Text - simple, no gradient */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                        <span className="text-gray-600 dark:text-gray-400 font-normal">Welcome, </span>
                        {userName}!
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    <button
                        className="relative w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        {hasNotifications && (
                            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                        )}
                    </button>

                    {/* User Avatar - simple black background */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-11 h-11 rounded-full bg-black dark:bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                        aria-label="Profile"
                    >
                        <User className="w-5 h-5 text-white dark:text-black" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
