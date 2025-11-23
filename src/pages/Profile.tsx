import { useState } from 'react';
import { ArrowLeft, Bell, Lock, HelpCircle, LogOut, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import SettingsPanel from '../components/SettingsPanel';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmDialog from '../components/ConfirmDialog';

const Profile = () => {
    const navigate = useNavigate();
    const { userName, userEmail, setUserName, setUserEmail } = useUser();

    // Modal states
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Edit profile form
    const [editName, setEditName] = useState(userName);
    const [editEmail, setEditEmail] = useState(userEmail);

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [taskReminders, setTaskReminders] = useState(true);
    const [budgetAlerts, setBudgetAlerts] = useState(false);

    // Privacy settings
    const [profileVisibility, setProfileVisibility] = useState('private');
    const [dataSharing, setDataSharing] = useState(false);
    const [analyticsTracking, setAnalyticsTracking] = useState(true);

    const handleSaveProfile = () => {
        console.log('=== SAVING PROFILE ===');
        console.log('Current userName:', userName);
        console.log('Current userEmail:', userEmail);
        console.log('New editName:', editName);
        console.log('New editEmail:', editEmail);

        setUserName(editName);
        setUserEmail(editEmail);

        console.log('Profile updated! New values should be:', editName, editEmail);
        setShowEditProfile(false);
    };

    const handleLogout = () => {
        console.log('Logging out...');
        navigate('/');
        setShowLogoutConfirm(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-32 animate-slide-in-right">
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center active:scale-95 transition shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <div className="w-10"></div>
                </div>

                {/* Profile Info */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white text-3xl">
                            👤
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold">{userName}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            console.log('Edit Profile clicked');
                            // Sync form fields with current user data when opening modal
                            setEditName(userName);
                            setEditEmail(userEmail);
                            setShowEditProfile(true);
                        }}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-2xl font-medium active:scale-95 transition"
                    >
                        Edit Profile
                    </button>
                </div>

                {/* Settings Section */}
                <SettingsPanel />

                {/* Account Options */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm mb-6">
                    <h3 className="text-lg font-bold mb-4">Account</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                console.log('Notifications clicked');
                                setShowNotifications(true);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl active:scale-95 transition"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="flex-1 text-left">Notifications</span>
                            <span className="text-gray-400">›</span>
                        </button>
                        <button
                            onClick={() => {
                                console.log('Privacy clicked');
                                setShowPrivacy(true);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl active:scale-95 transition"
                        >
                            <Lock className="w-5 h-5" />
                            <span className="flex-1 text-left">Privacy & Security</span>
                            <span className="text-gray-400">›</span>
                        </button>
                        <button
                            onClick={() => {
                                console.log('Help clicked');
                                setShowHelp(true);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl active:scale-95 transition"
                        >
                            <HelpCircle className="w-5 h-5" />
                            <span className="flex-1 text-left">Help & Support</span>
                            <span className="text-gray-400">›</span>
                        </button>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => {
                        console.log('Logout clicked');
                        setShowLogoutConfirm(true);
                    }}
                    className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-2xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 transition flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>

            {/* Edit Profile Modal */}
            {showEditProfile && (
                <ModalWrapper onClose={() => setShowEditProfile(false)} title="Edit Profile">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSaveProfile}
                                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-medium active:scale-95 transition flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                            <button
                                onClick={() => setShowEditProfile(false)}
                                className="px-6 bg-gray-100 dark:bg-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* Notifications Settings Modal */}
            {showNotifications && (
                <ModalWrapper onClose={() => setShowNotifications(false)} title="Notification Settings">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="font-medium">Email Notifications</span>
                            <button
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={`w-12 h-6 rounded-full transition ${emailNotifications ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white dark:bg-black rounded-full transition transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="font-medium">Push Notifications</span>
                            <button
                                onClick={() => setPushNotifications(!pushNotifications)}
                                className={`w-12 h-6 rounded-full transition ${pushNotifications ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white dark:bg-black rounded-full transition transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="font-medium">Task Reminders</span>
                            <button
                                onClick={() => setTaskReminders(!taskReminders)}
                                className={`w-12 h-6 rounded-full transition ${taskReminders ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white dark:bg-black rounded-full transition transform ${taskReminders ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="font-medium">Budget Alerts</span>
                            <button
                                onClick={() => setBudgetAlerts(!budgetAlerts)}
                                className={`w-12 h-6 rounded-full transition ${budgetAlerts ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white dark:bg-black rounded-full transition transform ${budgetAlerts ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* Privacy & Security Modal */}
            {showPrivacy && (
                <ModalWrapper onClose={() => setShowPrivacy(false)} title="Privacy & Security">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                            <select
                                value={profileVisibility}
                                onChange={(e) => setProfileVisibility(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                            >
                                <option value="public">Public</option>
                                <option value="friends">Friends Only</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="font-medium">Data Sharing</span>
                            <button
                                onClick={() => setDataSharing(!dataSharing)}
                                className={`w-12 h-6 rounded-full transition ${dataSharing ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white dark:bg-black rounded-full transition transform ${dataSharing ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="font-medium">Analytics Tracking</span>
                            <button
                                onClick={() => setAnalyticsTracking(!analyticsTracking)}
                                className={`w-12 h-6 rounded-full transition ${analyticsTracking ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white dark:bg-black rounded-full transition transform ${analyticsTracking ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* Help & Support Modal */}
            {showHelp && (
                <ModalWrapper onClose={() => setShowHelp(false)} title="Help & Support">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <h3 className="font-bold mb-2">📧 Email Support</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">support@notable.com</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <h3 className="font-bold mb-2">📚 Documentation</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Visit our help center for guides and tutorials</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <h3 className="font-bold mb-2">💬 Community</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Join our community forum for discussions</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <h3 className="font-bold mb-2">ℹ️ App Version</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">v2.0.0</p>
                        </div>
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
                    confirmText="Logout"
                    onConfirm={handleLogout}
                    variant="danger"
                />
            )}
        </div>
    );
};

export default Profile;
