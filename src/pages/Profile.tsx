import { useState } from 'react';
import { ArrowLeft, User, Palette, CreditCard, Crown, Settings, FileText, Link2, Upload, ChevronRight, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';

const Profile = () => {
    const navigate = useNavigate();
    const { userName } = useUser();
    const { theme, toggleTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();
    const { language, setLanguage } = useLanguage();

    const menuSections = [
        {
            title: 'Account',
            items: [
                { icon: User, label: 'Manage Account', action: () => console.log('Manage Account') },
                {
                    icon: theme === 'dark' ? Moon : Sun,
                    label: 'Theme',
                    value: theme === 'dark' ? 'Dark' : 'Light',
                    action: toggleTheme
                },
            ]
        },
        {
            title: 'Plans',
            items: [
                { icon: CreditCard, label: 'Free AI Credits', iconColor: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900' },
                { icon: Crown, label: 'Upgrade Plan', iconColor: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900' },
            ]
        },
        {
            title: 'Preferences',
            items: [
                {
                    icon: Settings,
                    label: 'App Settings',
                    submenu: [
                        { label: 'Currency', value: currency, options: ['USD', 'EUR', 'GBP', 'INR'], onChange: setCurrency },
                        { label: 'Language', value: language, options: ['en', 'es'], onChange: setLanguage }
                    ]
                },
                { icon: FileText, label: 'Todo Preferences' },
            ]
        },
        {
            title: 'External Services',
            items: [
                { icon: Link2, label: 'Integration' },
                { icon: Upload, label: 'Imports' },
            ]
        },
        {
            title: 'Advanced',
            items: [
                { icon: Settings, label: 'Advanced Settings' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-32">
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Account</h1>
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
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bgColor || 'bg-gray-100 dark:bg-gray-700'
                                            }`}>
                                            <item.icon className={`w-5 h-5 ${item.iconColor || 'text-gray-700 dark:text-gray-300'}`} />
                                        </div>
                                        <span className="flex-1 text-left font-medium text-gray-900 dark:text-gray-100">
                                            {item.label}
                                        </span>
                                        {item.value && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.value}
                                            </span>
                                        )}
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">Free Plan</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
