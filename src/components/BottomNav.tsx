import { Home, Wallet, CheckSquare, FileText, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

const BottomNav = () => {
    const { taskCount, financeAlertCount } = useNotifications();

    const navItems = [
        { path: '/', icon: Home, label: 'Home', badge: 0 },
        { path: '/finance', icon: Wallet, label: 'Finance', badge: financeAlertCount },
        { path: '/tasks', icon: CheckSquare, label: 'Tasks', badge: taskCount },
        { path: '/notes', icon: FileText, label: 'Notes', badge: 0 },
        { path: '/health', icon: Activity, label: 'Health', badge: 0 },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50">
            <div className="max-w-md mx-auto px-4">
                <div className="flex items-center justify-between py-1.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg will-change-transform ${isActive
                                    ? 'bg-black dark:bg-white'
                                    : ''
                                }`
                            }
                            style={{ transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms ease' }}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Icon - compact size */}
                                    <div className="relative w-5 h-5 flex items-center justify-center">
                                        <item.icon
                                            className={`w-4 h-4 transition-colors duration-150 ${isActive
                                                ? 'text-white dark:text-black'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}
                                            strokeWidth={2}
                                        />
                                        {/* Notification Badge */}
                                        {item.badge > 0 && (
                                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white dark:border-black">
                                                {item.badge > 9 ? '9' : item.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Label - compact */}
                                    <span
                                        className={`text-[10px] font-medium transition-colors duration-150 whitespace-nowrap ${isActive
                                            ? 'text-white dark:text-black'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        {item.label}
                                    </span>

                                    {/* Simple active indicator */}
                                    {isActive && (
                                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default BottomNav;
