import { useState } from 'react';
import { ArrowLeft, User, Settings, FileText, Link2, Upload, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmDialog from '../components/ConfirmDialog';

interface MenuItem {
    icon: any;
    label: string;
    value?: string;
    action?: () => void;
    iconColor?: string;
    bgColor?: string;
}

const Profile = () => {
    const navigate = useNavigate();
    const { userName, userEmail, setUserName, setUserEmail } = useUser();
    const { isDark, toggleTheme } = useTheme();
    const { currency, changeCurrency } = useCurrency();
    const { changeLanguage } = useLanguage();

    // Modal states
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showAppSettings, setShowAppSettings] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Edit profile form
    const [editName, setEditName] = useState(userName);
    const [editEmail, setEditEmail] = useState(userEmail);

    // App Settings
    const [selectedCurrency, setSelectedCurrency] = useState(currency.code);
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    // Notification preferences
    const [emailNotifications, setEmailNotifications] = useState(() => {
        const saved = localStorage.getItem('emailNotifications');
        return saved ? JSON.parse(saved) : true;
    });
    const [pushNotifications, setPushNotifications] = useState(() => {
        const saved = localStorage.getItem('pushNotifications');
        return saved ? JSON.parse(saved) : true;
    });
    const [taskReminders, setTaskReminders] = useState(() => {
        const saved = localStorage.getItem('taskReminders');
        return saved ? JSON.parse(saved) : true;
    });

    // Todo Preferences
    const [showTodoPreferences, setShowTodoPreferences] = useState(false);
    const [defaultView, setDefaultView] = useState(() => {
        const saved = localStorage.getItem('defaultView');
        return saved || 'all';
    });
    const [sortBy, setSortBy] = useState(() => {
        const saved = localStorage.getItem('sortBy');
        return saved || 'date';
    });
    const [autoDeleteCompleted, setAutoDeleteCompleted] = useState(() => {
        const saved = localStorage.getItem('autoDeleteCompleted');
        return saved ? JSON.parse(saved) : false;
    });

    // Advanced Settings
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    const handleSaveProfile = () => {
        setUserName(editName);
        setUserEmail(editEmail);
        setShowEditProfile(false);
    };

    const handleSaveAppSettings = () => {
        changeCurrency(selectedCurrency);
        changeLanguage(selectedLanguage);
        localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
        localStorage.setItem('pushNotifications', JSON.stringify(pushNotifications));
        localStorage.setItem('taskReminders', JSON.stringify(taskReminders));
        setShowAppSettings(false);
    };

    const handleLogout = () => {
        console.log('Logging out...');
        navigate('/');
        setShowLogoutConfirm(false);
    };

    const handleSaveTodoPreferences = () => {
        localStorage.setItem('defaultView', defaultView);
        localStorage.setItem('sortBy', sortBy);
        localStorage.setItem('autoDeleteCompleted', JSON.stringify(autoDeleteCompleted));
        setShowTodoPreferences(false);
    };

    const handleExportData = () => {
        const data = {
            transactions: localStorage.getItem('transactions'),
            budgetCategories: localStorage.getItem('budgetCategories'),
            quickTasks: localStorage.getItem('quickTasks'),
            healthData: localStorage.getItem('healthData'),
            userName: localStorage.getItem('userName'),
            userEmail: localStorage.getItem('userEmail'),
        };
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `notable-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('Data exported successfully!');
    };

    const handleClearAllData = () => {
        if (confirm('Are you sure you want to clear ALL app data? This action cannot be undone!')) {
            localStorage.clear();
            alert('All data cleared! Refreshing app...');
            window.location.reload();
        }
    };

    const menuSections = [
        {
            title: 'Account',
            items: [
                { icon: User, label: 'Manage Account', action: () => setShowEditProfile(true) } as MenuItem,
            ]
        },
        {
            title: 'Preferences',
            items: [
                { icon: Settings, label: 'App Settings', action: () => setShowAppSettings(true) } as MenuItem,
                { icon: FileText, label: 'Todo Preferences', action: () => setShowTodoPreferences(true) } as MenuItem,
            ]
        },
        {
            title: 'External Services',
            items: [
                { icon: Link2, label: 'Integration', action: () => console.log('Integration') } as MenuItem,
                { icon: Upload, label: 'Imports', action: () => console.log('Imports') } as MenuItem,
            ]
        },
        {
            title: 'Advanced',
            items: [
                { icon: Settings, label: 'Advanced Settings', action: () => setShowAdvancedSettings(true) } as MenuItem,
                { icon: LogOut, label: 'Logout', action: () => setShowLogoutConfirm(true), iconColor: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900' } as MenuItem,
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-32">
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Account</h1>
                </div>

                {/* Theme Toggle Section */}
                <div className="mb-8">
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">
                        Appearance
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-gray-100">Theme</span>
                            <button
                                onClick={toggleTheme}
                                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isDark ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${isDark ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                >
                                    {isDark ? '🌙' : '☀️'}
                                </div>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Current: {isDark ? 'Dark Mode' : 'Light Mode'}
                        </p>
                    </div>
                </div>

                {/* Menu Sections */}
                <div className="space-y-8">
                    {menuSections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            {section.title && (
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">
                                    {section.title}
                                </h2>
                            )}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                {section.items.map((item, itemIndex) => (
                                    <button
                                        key={itemIndex}
                                        onClick={item.action}
                                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                    >
                                        <item.icon className={`w-5 h-5 ${item.iconColor || 'text-gray-700 dark:text-gray-300'}`} />
                                        <span className="flex-1 text-left font-medium text-gray-900 dark:text-gray-100">
                                            {item.label}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Info Footer */}
                <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center">
                            <User className="w-6 h-6 text-white dark:text-black" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{userName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditProfile && (
                <ModalWrapper
                    isOpen={showEditProfile}
                    onClose={() => setShowEditProfile(false)}
                    title="Edit Profile"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowEditProfile(false)}
                                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-2xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-medium hover:scale-105 transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* App Settings Modal */}
            {showAppSettings && (
                <ModalWrapper
                    isOpen={showAppSettings}
                    onClose={() => setShowAppSettings(false)}
                    title="App Settings"
                >
                    <div className="space-y-6">
                        {/* Currency */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Currency</label>
                            <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="INR">INR - Indian Rupee</option>
                            </select>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Language</label>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                            </select>
                        </div>

                        {/* Notifications Section */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold mb-4">Notification Preferences</h3>

                            {/* Email Notifications */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-medium text-sm">Email Notifications</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates via email</p>
                                </div>
                                <button
                                    onClick={() => setEmailNotifications(!emailNotifications)}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${emailNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${emailNotifications ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Push Notifications */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-medium text-sm">Push Notifications</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive browser notifications</p>
                                </div>
                                <button
                                    onClick={() => setPushNotifications(!pushNotifications)}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${pushNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${pushNotifications ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Task Reminders */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">Task Reminders</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Get reminded about tasks</p>
                                </div>
                                <button
                                    onClick={() => setTaskReminders(!taskReminders)}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${taskReminders ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${taskReminders ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveAppSettings}
                            className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-medium hover:scale-105 transition mt-4"
                        >
                            Save Settings
                        </button>
                    </div>
                </ModalWrapper>
            )}


            {/* Logout Confirmation Dialog */}
            {showLogoutConfirm && (
                <ConfirmDialog
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    title="Logout"
                    message="Are you sure you want to logout?"
                    onConfirm={handleLogout}
                />
            )}

            {/* Todo Preferences Modal */}
            {showTodoPreferences && (
                <ModalWrapper
                    isOpen={showTodoPreferences}
                    onClose={() => setShowTodoPreferences(false)}
                    title="Todo Preferences"
                >
                    <div className="space-y-6">
                        {/* Default View */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Default View</label>
                            <select
                                value={defaultView}
                                onChange={(e) => setDefaultView(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-none outline-none"
                            >
                                <option value="all">All Tasks</option>
                                <option value="today">Today's Tasks</option>
                                <option value="upcoming">Upcoming Tasks</option>
                                <option value="completed">Completed Tasks</option>
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose which tasks to show by default</p>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Sort Tasks By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-none outline-none"
                            >
                                <option value="date">Date Created</option>
                                <option value="priority">Priority</option>
                                <option value="category">Category</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default sorting order for tasks</p>
                        </div>

                        {/* Auto-Delete Completed */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <div>
                                <p className="font-medium text-sm">Auto-Delete Completed Tasks</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Remove tasks after 30 days</p>
                            </div>
                            <button
                                onClick={() => setAutoDeleteCompleted(!autoDeleteCompleted)}
                                className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${autoDeleteCompleted ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-5 h-5 rounded-full ${autoDeleteCompleted ? 'bg-white dark:bg-black' : 'bg-white'
                                        } shadow-md transition-transform duration-300 ${autoDeleteCompleted ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        <button
                            onClick={handleSaveTodoPreferences}
                            className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-medium hover:scale-105 transition"
                        >
                            Save Preferences
                        </button>
                    </div>
                </ModalWrapper>
            )
            }


            {/* Advanced Settings Modal */}
            {showAdvancedSettings && (
                <ModalWrapper
                    isOpen={showAdvancedSettings}
                    onClose={() => setShowAdvancedSettings(false)}
                    title="Advanced Settings"
                >
                    <div className="space-y-4">
                        {/* Export Data */}
                        <button
                            onClick={handleExportData}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium">Export All Data</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Download backup as JSON</p>
                                </div>
                            </div>
                        </button>

                        {/* Import Data */}
                        <label className="w-full block">
                            <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium">Import Data</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Restore from backup file</p>
                                    </div>
                                </div>
                            </div>
                            <input type="file" accept=".json" className="hidden" />
                        </label>

                        {/* Clear All Data */}
                        <button
                            onClick={handleClearAllData}
                            className="w-full p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-red-500">Clear All Data</p>
                                    <p className="text-xs text-red-400">⚠️ This action cannot be undone</p>
                                </div>
                            </div>
                        </button>

                        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                💡 Tip: Export your data regularly to keep a backup
                            </p>
                        </div>
                    </div>
                </ModalWrapper>
            )
            }
        </div >
    );
};

export default Profile;
