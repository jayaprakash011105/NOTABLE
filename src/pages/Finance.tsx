import { useState, useMemo, useEffect } from 'react';
import { Search, Bell, Plus, ChevronRight, X } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import ModalWrapper from '../components/ModalWrapper';
import TransactionForm from '../components/TransactionForm';
import BudgetForm from '../components/BudgetForm';
import ConfirmDialog from '../components/ConfirmDialog';

interface Transaction {
    id: number;
    name: string;
    date: string;
    category: string;
    amount: number;
    icon: string;
}

interface BudgetCategory {
    id: number;
    name: string;
    total: number;
    icon: string;
}

const Finance = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budget' | 'savings'>('overview');
    const { formatAmount } = useCurrency();
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
    const [showBudgetEdit, setShowBudgetEdit] = useState(false);

    const tabs = [
        { id: 'overview' as const, label: 'Overview' },
        { id: 'transactions' as const, label: 'Transactions' },
        { id: 'budget' as const, label: 'Budget' },
        { id: 'savings' as const, label: 'Savings' },
    ];

    // Load transactions from localStorage or use default
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Monday Dinner', date: '30/10/2025', category: 'Food & Dining', amount: -150, icon: '🍔' },
            { id: 2, name: 'Rent', date: '01/11/2025', category: 'Housing & Rent', amount: -1500, icon: '🏠' },
            { id: 3, name: 'Salary', date: '30/10/2025', category: 'Income', amount: 15000, icon: '💰' },
            { id: 4, name: 'Friday Lunch', date: '15/11/2025', category: 'Food & Dining', amount: -560, icon: '🍔' },
            { id: 5, name: 'Movie', date: '22/11/2025', category: 'Entertainment', amount: -250, icon: '🎬' },
        ];
    });

    // Load budget categories from localStorage or use default
    const [budgetCategories] = useState<BudgetCategory[]>(() => {
        const saved = localStorage.getItem('budgetCategories');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Home', total: 2000, icon: '🏠' },
            { id: 2, name: 'Food', total: 1000, icon: '🍔' },
            { id: 3, name: 'Transport', total: 500, icon: '🚗' },
            { id: 4, name: 'Shopping', total: 500, icon: '🛍️' },
            { id: 5, name: 'Entertainment', total: 300, icon: '🎬' },
        ];
    });

    // Monthly budget limit
    const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState(() => {
        const saved = localStorage.getItem('monthlyBudgetLimit');
        return saved ? parseFloat(saved) : 5000;
    });

    // Savings goal
    const [savingsGoal] = useState(() => {
        const saved = localStorage.getItem('savingsGoal');
        return saved ? parseFloat(saved) : 10000;
    });

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('budgetCategories', JSON.stringify(budgetCategories));
    }, [budgetCategories]);

    useEffect(() => {
        localStorage.setItem('monthlyBudgetLimit', monthlyBudgetLimit.toString());
    }, [monthlyBudgetLimit]);

    useEffect(() => {
        localStorage.setItem('savingsGoal', savingsGoal.toString());
    }, [savingsGoal]);

    // REAL-TIME CALCULATIONS
    const calculations = useMemo(() => {
        // Calculate total income and expenses
        const totalIncome = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = Math.abs(transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));

        // Current balance = income - expenses
        const currentBalance = totalIncome - totalExpenses;

        // Calculate spending by category
        const categorySpending: Record<string, number> = {};
        transactions
            .filter(t => t.amount < 0)
            .forEach(t => {
                const category = t.category;
                categorySpending[category] = (categorySpending[category] || 0) + Math.abs(t.amount);
            });

        // Calculate budget progress for each category
        const budgetProgress = budgetCategories.map(cat => {
            // Find matching category spending (case-insensitive partial match)
            const spent = Object.entries(categorySpending).reduce((sum, [key, value]) => {
                if (key.toLowerCase().includes(cat.name.toLowerCase()) ||
                    cat.name.toLowerCase().includes(key.toLowerCase())) {
                    return sum + value;
                }
                return sum;
            }, 0);

            return {
                ...cat,
                spent: spent,
                percentage: cat.total > 0 ? Math.min((spent / cat.total) * 100, 100) : 0
            };
        });

        // Total budget spent across all categories
        const totalBudgetSpent = totalExpenses;
        const budgetRemaining = monthlyBudgetLimit - totalBudgetSpent;
        const budgetPercentage = monthlyBudgetLimit > 0
            ? Math.min((totalBudgetSpent / monthlyBudgetLimit) * 100, 100)
            : 0;

        // Savings calculation
        const currentSavings = currentBalance;
        const savingsPercentage = savingsGoal > 0
            ? Math.min((currentSavings / savingsGoal) * 100, 100)
            : 0;

        return {
            totalIncome,
            totalExpenses,
            currentBalance,
            categorySpending,
            budgetProgress,
            totalBudgetSpent,
            budgetRemaining,
            budgetPercentage,
            currentSavings,
            savingsPercentage
        };
    }, [transactions, budgetCategories, monthlyBudgetLimit, savingsGoal]);

    const handleAddTransaction = (transactionData: any) => {
        const newTransaction: Transaction = {
            id: Math.max(...transactions.map(t => t.id), 0) + 1,
            ...transactionData,
            icon: transactionData.amount > 0 ? '💰' : '💸'
        };
        setTransactions([newTransaction, ...transactions]);
        setShowAddTransaction(false);
    };

    const handleEditTransaction = (transactionData: any) => {
        if (editingTransaction) {
            setTransactions(transactions.map(t =>
                t.id === editingTransaction.id ? { ...t, ...transactionData } : t
            ));
            setEditingTransaction(null);
        }
    };

    const handleDeleteTransaction = () => {
        if (transactionToDelete) {
            setTransactions(transactions.filter(t => t.id !== transactionToDelete));
            setTransactionToDelete(null);
        }
    };

    const handleSaveBudget = (budgetData: any) => {
        setMonthlyBudgetLimit(budgetData.total);
        setShowBudgetEdit(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Finance</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-sm"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-sm"
                            >
                                <Bell className="w-5 h-5" />
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10 animate-slide-down">
                                    <h3 className="font-semibold mb-2">Notifications</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">No new notifications</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div className="mb-6 animate-slide-down">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="input-field pl-12"
                                autoFocus
                            />
                            <button
                                onClick={() => setShowSearch(false)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${activeTab === tab.id
                                ? 'bg-black dark:bg-white text-white dark:text-black'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* VISA Card */}
                        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="text-2xl font-bold italic">VISA</div>
                                    <div className="flex items-center gap-2">
                                        <button className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                        <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                                            Set Bank
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm opacity-75 mb-2">Balance</p>
                                    <h2 className="text-4xl font-bold">{formatAmount(calculations.currentBalance)}</h2>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-sm opacity-75 mb-1">**** **** **** 5248</p>
                                        <p className="font-semibold">Jaya Prakash</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs opacity-75 mb-1">Exp 07/28</p>
                                        <div className="w-12 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                                <path d="M2 17l10 5 10-5" />
                                                <path d="M2 12l10 5 10-5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Balance Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Balance</p>
                                    <h3 className="text-4xl font-bold">{formatAmount(calculations.currentBalance)}</h3>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium">
                                    <span>Month</span>
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                </button>
                            </div>

                            {/* Income/Expense Pill */}
                            <div className="bg-black dark:bg-white rounded-full p-4 flex items-center justify-around">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                    </div>
                                    <div className="text-white dark:text-black">
                                        <p className="text-sm opacity-75">Income</p>
                                        <p className="text-xl font-bold">{formatAmount(calculations.totalIncome)}</p>
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-white/20 dark:bg-black/20"></div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </div>
                                    <div className="text-white dark:text-black">
                                        <p className="text-sm opacity-75">Expense</p>
                                        <p className="text-xl font-bold">{formatAmount(calculations.totalExpenses)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Savings */}
                        <button className="w-full bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-lg">Savings</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg">{formatAmount(calculations.currentSavings)}</span>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        </button>

                        {/* Investments */}
                        <button className="w-full bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-lg">Investments</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">Add</span>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        </button>
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold">All Transactions ({transactions.length})</h3>
                            <button
                                onClick={() => setShowAddTransaction(true)}
                                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-medium hover:scale-105 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        <div className="space-y-3">
                            {transactions.map(transaction => (
                                <div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{transaction.icon}</span>
                                            <div>
                                                <p className="font-medium">{transaction.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{transaction.date}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingTransaction(transaction)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setTransactionToDelete(transaction.id)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Budget Tab - Real-time calculated */}
                {activeTab === 'budget' && (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Monthly Budget</h3>
                                <button
                                    onClick={() => setShowBudgetEdit(true)}
                                    className="text-sm text-blue-500 hover:underline"
                                >
                                    Edit Limit
                                </button>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {formatAmount(calculations.totalBudgetSpent)} of {formatAmount(monthlyBudgetLimit)}
                                    </span>
                                    <span className="font-semibold">{calculations.budgetPercentage.toFixed(0)}%</span>
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${calculations.budgetPercentage > 90 ? 'bg-red-500' :
                                            calculations.budgetPercentage > 70 ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}
                                        style={{ width: `${calculations.budgetPercentage}%` }}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Remaining: <span className="font-semibold">{formatAmount(calculations.budgetRemaining)}</span>
                            </p>
                        </div>

                        <h3 className="font-bold">Categories</h3>
                        <div className="space-y-3">
                            {calculations.budgetProgress.map(category => (
                                <div key={category.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{category.icon}</span>
                                            <span className="font-medium">{category.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {formatAmount(category.spent)} / {formatAmount(category.total)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${category.percentage > 90 ? 'bg-red-500' :
                                                category.percentage > 70 ? 'bg-yellow-500' :
                                                    'bg-blue-500'
                                                }`}
                                            style={{ width: `${category.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {category.percentage.toFixed(0)}% used
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Savings Tab - Real-time calculated */}
                {activeTab === 'savings' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
                            <h3 className="text-lg font-semibold mb-2">Savings Goal</h3>
                            <p className="text-4xl font-bold mb-4">{formatAmount(calculations.currentSavings)}</p>
                            <div className="bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden mb-2">
                                <div
                                    className="h-full bg-white transition-all"
                                    style={{ width: `${calculations.savingsPercentage}%` }}
                                />
                            </div>
                            <p className="text-sm opacity-90">
                                {calculations.savingsPercentage.toFixed(0)}% of {formatAmount(savingsGoal)} goal
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold mb-4">Savings Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Income</span>
                                    <span className="font-semibold text-green-500">{formatAmount(calculations.totalIncome)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
                                    <span className="font-semibold text-red-500">-{formatAmount(calculations.totalExpenses)}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                                    <span className="font-bold">Current Savings</span>
                                    <span className="font-bold text-blue-500">{formatAmount(calculations.currentSavings)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Remaining to Goal</span>
                                    <span className="font-semibold">{formatAmount(savingsGoal - calculations.currentSavings)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Transaction Modal */}
            {showAddTransaction && (
                <ModalWrapper onClose={() => setShowAddTransaction(false)} title="Add Transaction">
                    <TransactionForm
                        onSave={handleAddTransaction}
                        onCancel={() => setShowAddTransaction(false)}
                    />
                </ModalWrapper>
            )}

            {/* Edit Transaction Modal */}
            {editingTransaction && (
                <ModalWrapper onClose={() => setEditingTransaction(null)} title="Edit Transaction">
                    <TransactionForm
                        transaction={editingTransaction}
                        onSave={handleEditTransaction}
                        onCancel={() => setEditingTransaction(null)}
                    />
                </ModalWrapper>
            )}

            {/* Delete Confirmation */}
            {transactionToDelete && (
                <ConfirmDialog
                    isOpen={!!transactionToDelete}
                    onClose={() => setTransactionToDelete(null)}
                    title="Delete Transaction"
                    message="Are you sure you want to delete this transaction?"
                    confirmText="Delete"
                    onConfirm={handleDeleteTransaction}
                    variant="danger"
                />
            )}

            {/* Budget Edit Modal */}
            {showBudgetEdit && (
                <ModalWrapper onClose={() => setShowBudgetEdit(false)} title="Edit Monthly Budget">
                    <BudgetForm
                        budget={{ total: monthlyBudgetLimit, spent: calculations.totalBudgetSpent }}
                        onSave={handleSaveBudget}
                        onCancel={() => setShowBudgetEdit(false)}
                    />
                </ModalWrapper>
            )}
        </div>
    );
};

export default Finance;
