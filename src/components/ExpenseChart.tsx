import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

type ViewType = 'Weekly' | 'Monthly';

interface Transaction {
    id: number;
    name: string;
    amount: number;
    category: string;
    date: string;
    type?: 'income' | 'expense';
}

const ExpenseChart: React.FC = () => {
    const [view, setView] = useState<ViewType>('Weekly');
    const [showDropdown, setShowDropdown] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // Load transactions from localStorage
        const loadedTransactions = localStorage.getItem('transactions');
        const transactions: Transaction[] = loadedTransactions ? JSON.parse(loadedTransactions) : [];

        // Filter only expense transactions
        const expenses = transactions.filter(t => {
            // If type is explicitly set, use it; otherwise assume negative amounts are expenses
            if (t.type) return t.type === 'expense';
            return t.amount < 0;
        });

        if (view === 'Weekly') {
            setChartData(calculateWeeklyData(expenses));
        } else {
            setChartData(calculateMonthlyData(expenses));
        }
    }, [view]);

    const calculateWeeklyData = (expenses: Transaction[]) => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate offset to Monday
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);

        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekData = weekDays.map((day, index) => {
            const currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + index);

            // Calculate total expenses for this day
            const dayExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return (
                    expenseDate.getFullYear() === currentDay.getFullYear() &&
                    expenseDate.getMonth() === currentDay.getMonth() &&
                    expenseDate.getDate() === currentDay.getDate()
                );
            });

            const total = dayExpenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);

            return {
                day,
                amount: total,
                fullDate: currentDay.toISOString()
            };
        });

        return weekData;
    };

    const calculateMonthlyData = (expenses: Transaction[]) => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const monthData = weeks.map((week, index) => {
            const weekStart = new Date(firstDayOfMonth);
            weekStart.setDate(1 + (index * 7));

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            // Don't go beyond the month
            if (weekEnd > lastDayOfMonth) {
                weekEnd.setTime(lastDayOfMonth.getTime());
            }

            // Calculate total expenses for this week
            const weekExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= weekStart && expenseDate <= weekEnd;
            });

            const total = weekExpenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);

            return {
                day: week,
                amount: total,
                weekStart: weekStart.toISOString(),
                weekEnd: weekEnd.toISOString()
            };
        });

        return monthData;
    };

    const handleViewChange = (newView: ViewType) => {
        setView(newView);
        setShowDropdown(false);
    };

    // Calculate max value for chart scaling
    const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 md:p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-1 text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                    >
                        {view}
                        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                                onClick={() => handleViewChange('Weekly')}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${view === 'Weekly' ? 'bg-gray-50 dark:bg-gray-900 font-medium' : ''
                                    }`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => handleViewChange('Monthly')}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition rounded-b-lg ${view === 'Monthly' ? 'bg-gray-50 dark:bg-gray-900 font-medium' : ''
                                    }`}
                            >
                                Monthly
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Expense</p>
            </div>

            <div className="h-40 md:h-48">
                {chartData.length > 0 && chartData.some(d => d.amount > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
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
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            No expense data for this {view.toLowerCase()} period
                        </p>
                    </div>
                )}
            </div>

            {/* Summary */}
            {chartData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Total {view} Expenses
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ${chartData.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseChart;
