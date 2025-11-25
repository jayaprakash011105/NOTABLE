import { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

interface Transaction {
    id: number;
    name: string;
    amount: number;
    category: string;
    date: string;
    type?: 'income' | 'expense';
}

// Define months array outside component so it can be used in initialization
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const BalanceCard = () => {
    const { formatAmount } = useCurrency();
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const currentMonth = new Date().getMonth();
        return months[currentMonth];
    });
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);

    useEffect(() => {
        calculateFinancials();
    }, [selectedMonth]);

    // Recalculate when window regains focus (to catch changes from other tabs/components)
    useEffect(() => {
        const handleFocus = () => {
            calculateFinancials();
        };

        window.addEventListener('focus', handleFocus);

        // Also listen for storage events (changes from other tabs)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'transactions') {
                calculateFinancials();
            }
        };

        window.addEventListener('storage', handleStorage);

        // Listen for custom storage change events (same tab updates)
        const handleCustomStorage = (e: Event) => {
            calculateFinancials();
        };

        window.addEventListener('localStorageUpdated', handleCustomStorage);

        // Poll for changes every 2 seconds to catch same-tab updates
        const pollInterval = setInterval(() => {
            calculateFinancials();
        }, 2000);

        // Initial calculation
        calculateFinancials();

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('localStorageUpdated', handleCustomStorage);
            clearInterval(pollInterval);
        };
    }, [selectedMonth]);

    const calculateFinancials = () => {
        // Load transactions from localStorage
        const loadedTransactions = localStorage.getItem('transactions');
        const transactions: Transaction[] = loadedTransactions ? JSON.parse(loadedTransactions) : [];

        // Get selected month index
        const monthIndex = months.indexOf(selectedMonth);
        const currentYear = new Date().getFullYear();

        // Filter transactions for selected month
        const monthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return (
                transactionDate.getMonth() === monthIndex &&
                transactionDate.getFullYear() === currentYear
            );
        });

        // Calculate income and expense
        let totalIncome = 0;
        let totalExpense = 0;

        monthTransactions.forEach(transaction => {
            if (transaction.type === 'income' || transaction.amount > 0) {
                totalIncome += Math.abs(transaction.amount);
            } else if (transaction.type === 'expense' || transaction.amount < 0) {
                totalExpense += Math.abs(transaction.amount);
            }
        });

        // Calculate balance
        const totalBalance = totalIncome - totalExpense;

        setIncome(totalIncome);
        setExpense(totalExpense);
        setBalance(totalBalance);
    };

    const handleMonthSelect = (month: string) => {
        setSelectedMonth(month);
        setShowMonthDropdown(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 md:p-6 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Total balance
                </p>
                <div className="relative">
                    <button
                        onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                        className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                    >
                        <span>▾ {selectedMonth}</span>
                    </button>

                    {showMonthDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMonthDropdown(false)}
                            />
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20 max-h-60 overflow-y-auto animate-slide-down">
                                {months.map((month) => (
                                    <button
                                        key={month}
                                        onClick={() => handleMonthSelect(month)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${selectedMonth === month ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                                            }`}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">{formatAmount(balance)}</h2>

            <div className="bg-black dark:bg-gray-900 rounded-3xl p-4 flex items-center justify-around">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <svg className="w-5 h-5 text-black rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Income</p>
                        <p className="text-lg font-semibold text-white">{formatAmount(income)}</p>
                    </div>
                </div>
                <div className="w-px h-12 bg-gray-700"></div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <svg className="w-5 h-5 text-black -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Expense</p>
                        <p className="text-lg font-semibold text-white">{formatAmount(expense)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;
