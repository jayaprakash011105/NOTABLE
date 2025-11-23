import React from 'react';
import { MoveRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReminderCard: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-gradient-to-br from-teal-500/80 to-teal-600/70 dark:from-teal-600/70 dark:to-teal-700/60 rounded-3xl p-5 md:p-6 text-white shadow-md mb-6 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm md:text-base font-medium opacity-90">{t('reminder')}</h4>
                    <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
                        <MoveRight className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-sm md:text-base mb-4 leading-relaxed">
                    {t('yourMeetingWith', { name: 'Sid', date: '11th', time: '22:00' })}
                </p>
                <button className="bg-white/90 hover:bg-white text-teal-700 px-4 py-2 rounded-full text-xs md:text-sm font-medium transition shadow-sm">
                    {t('remindIn', { time: 10 })}
                </button>
            </div>
        </div>
    );
};

export default ReminderCard;
