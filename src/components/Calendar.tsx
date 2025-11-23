import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  // Get the last day of the month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  // Adjust so Monday is 0
  const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate array of dates to display
  const generateCalendarDays = () => {
    const days = [];
    const totalDays = lastDayOfMonth.getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm mb-6">
      {/* Header with Month/Year and Navigation */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {/* Day headers */}
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 pb-1"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => day && handleDateClick(day)}
            className={`
              aspect-square flex items-center justify-center text-xs md:text-sm font-medium rounded-full transition
              ${day ? 'cursor-pointer' : 'cursor-default'}
              ${day && isSelected(day)
                ? 'bg-black dark:bg-white text-white dark:text-black scale-105'
                : day && isToday(day)
                  ? 'bg-gray-200 dark:bg-gray-700 ring-2 ring-black dark:ring-white'
                  : day
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                    : ''
              }
            `}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
