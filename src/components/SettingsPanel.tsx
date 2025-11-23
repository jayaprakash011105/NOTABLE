import React from 'react';
import { Moon, Sun, Globe, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency, currencies } from '../contexts/CurrencyContext';

const SettingsPanel: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();
    const { language, changeLanguage } = useLanguage();
    const { currency, changeCurrency } = useCurrency();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 md:p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold mb-4">Settings</h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <span className="text-sm md:text-base">Dark Mode</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative w-12 h-6 rounded-full transition ${isDark ? 'bg-black dark:bg-white' : 'bg-gray-300'
                            }`}
                    >
                        <div
                            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white dark:bg-black transition transform ${isDark ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        <span className="text-sm md:text-base">Language</span>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => changeLanguage(e.target.value)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm outline-none cursor-pointer"
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm md:text-base">Currency</span>
                    </div>
                    <select
                        value={currency.code}
                        onChange={(e) => changeCurrency(e.target.value)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm outline-none cursor-pointer"
                    >
                        {Object.values(currencies).map((curr) => (
                            <option key={curr.code} value={curr.code}>
                                {curr.code} ({curr.symbol})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
