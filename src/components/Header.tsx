import { useState } from 'react';
import { Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Header = () => {
    const navigate = useNavigate();
    const { userName } = useUser();
    const [hasNotifications] = useState(true);

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
                            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
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
