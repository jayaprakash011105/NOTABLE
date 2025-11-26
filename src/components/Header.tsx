import { Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const Header = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { unreadCount } = useNotifications();

    // Get user name from Firebase auth
    const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

    return (
        <div className="w-full transition-colors duration-200">
            <div className="max-w-md mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* User Greeting */}
                    <div>
                        <h1 className="text-sm text-gray-600 dark:text-gray-400">Hello,</h1>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                            {userName}
                        </h2>
                    </div>

                    {/* Action Buttons - smaller and cleaner */}
                    <div className="flex items-center gap-2">
                        {/* Notification Bell */}
                        <button
                            className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                            aria-label="Notifications"
                        >
                            <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                            {unreadCount > 0 && (
                                <>
                                    <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse" />
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
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
        </div>
    );
};

export default Header;
