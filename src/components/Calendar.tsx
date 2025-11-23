import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Calendar: React.FC = () => {
  const { t } = useTranslation();
  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const currentDate = 6;

  const dates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 md:p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold">{t('december')}</h3>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 pb-2"
          >
            {day}
          </div>
        ))}
        {dates.map((date) => (
          <div
            key={date}
            className={`
              aspect-square flex items-center justify-center text-sm md:text-base font-medium rounded-full transition cursor-pointer
              ${
                date === currentDate
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
