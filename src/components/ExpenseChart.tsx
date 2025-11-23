import React, { useState } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const data = [
    { day: 'Mon', amount: 250 },
    { day: 'Tue', amount: 450 },
    { day: 'Wed', amount: 350 },
    { day: 'Thu', amount: 300 },
    { day: 'Fri', amount: 400 },
    { day: 'Sat', amount: 550 },
    { day: 'Sun', amount: 500 },
];

const ExpenseChart: React.FC = () => {
    const { t } = useTranslation();
    const [view] = useState('Week');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 md:p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <button className="flex items-center gap-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {view}
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t('expense')}</p>
            </div>

            <div className="h-40 md:h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Bar
                            dataKey="amount"
                            fill="#000000"
                            radius={[8, 8, 0, 0]}
                            className="dark:fill-white"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExpenseChart;
