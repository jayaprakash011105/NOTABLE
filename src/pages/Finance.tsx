import { useState, useMemo, useEffect } from 'react';
import { Search, Bell, Plus, ChevronRight, X } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import ModalWrapper from '../components/ModalWrapper';
import TransactionForm from '../components/TransactionForm';
import BudgetForm from '../components/BudgetForm';
import CategoryForm from '../components/CategoryForm';
import SavingsGoalForm from '../components/SavingsGoalForm';
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
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    const [showEditSavings, setShowEditSavings] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const currentMonth = new Date().getMonth();
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[currentMonth];
    });
    const [transactionFilter, setTransactionFilter] = useState<'all' | 'income' | 'expense'>('all');

    const tabs = [
        { id: 'overview' as const, label: 'Overview' },
        { id: 'transactions' as const, label: 'Transactions' },
        { id: 'budget' as const, label: 'Budget' },
        { id: 'savings' as const, label: 'Savings' },
    ];

    // Load transactions from localStorage or use default
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : [];
    });

    // Load budget categories from localStorage or use default
    const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(() => {
        const saved = localStorage.getItem('budgetCategories');
        return saved ? JSON.parse(saved) : [];
    });

    // Monthly budget limit
    const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState(() => {
        const saved = localStorage.getItem('monthlyBudgetLimit');
        return saved ? parseFloat(saved) : 5000;
    });

    // Savings goal
    const [savingsGoal, setSavingsGoal] = useState(() => {
        const saved = localStorage.getItem('savingsGoal');
        return saved ? parseFloat(saved) : 0;
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
        // Category icon mapping
        const categoryIcons: Record<string, string> = {
            'Food & Dining': '🍔',
            'Housing & Rent': '🏠',
            'Transportation': '🚗',
            'Entertainment': '🎬',
            'Shopping': '🛍️',
            'Healthcare': '🏥',
            'Income': '💰',
            'Other': '📁'
        };

        const newTransaction: Transaction = {
            id: Math.max(...transactions.map(t => t.id), 0) + 1,
            ...transactionData,
            icon: categoryIcons[transactionData.category] || '📁'
        };

        // Check budget alerts for expenses
        if (newTransaction.amount < 0) {
            const newTransactions = [newTransaction, ...transactions];

            // Calculate new total expenses
            const newTotalExpenses = newTransactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            // Check if total budget exceeded
            if (newTotalExpenses > monthlyBudgetLimit && monthlyBudgetLimit > 0) {
                const exceeded = newTotalExpenses - monthlyBudgetLimit;
                alert(`⚠️ Budget Alert!\n\nYou have exceeded your monthly budget by ${formatAmount(exceeded)}!\n\nTotal Expenses: ${formatAmount(newTotalExpenses)}\nBudget Limit: ${formatAmount(monthlyBudgetLimit)}`);
            }

            // Check category budget
            const matchingCategory = budgetCategories.find(c =>
                transactionData.category.toLowerCase().includes(c.name.toLowerCase())
            );

            if (matchingCategory) {
                const categoryExpenses = newTransactions
                    .filter(t => t.amount < 0 && t.category.toLowerCase().includes(matchingCategory.name.toLowerCase()))
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                if (categoryExpenses > matchingCategory.total) {
                    const exceeded = categoryExpenses - matchingCategory.total;
                    alert(`⚠️ Category Budget Alert!\n\n${matchingCategory.icon} ${matchingCategory.name} budget exceeded by ${formatAmount(exceeded)}!\n\nCategory Expenses: ${formatAmount(categoryExpenses)}\nCategory Budget: ${formatAmount(matchingCategory.total)}`);
                }
            }
        }

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

    const handleAddCategory = (categoryData: any) => {
        const newCategory: BudgetCategory = {
            id: Math.max(...budgetCategories.map(c => c.id), 0) + 1,
            name: categoryData.name,
            total: categoryData.total,
            icon: categoryData.icon || '📁'
        };
        setBudgetCategories([...budgetCategories, newCategory]);
        setShowAddCategory(false);
    };

    const handleEditCategory = (categoryData: any) => {
        if (editingCategory) {
            setBudgetCategories(budgetCategories.map(c =>
                c.id === editingCategory.id ? { ...c, ...categoryData } : c
            ));
            setEditingCategory(null);
        }
    };

    const handleDeleteCategory = () => {
        if (categoryToDelete) {
            setBudgetCategories(budgetCategories.filter(c => c.id !== categoryToDelete));
            setCategoryToDelete(null);
        }
    };

    const handleSaveSavingsGoal = (goalData: any) => {
        setSavingsGoal(goalData.goal);
        setShowEditSavings(false);
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-32">
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
                <div className="flex gap-2 mb-6">
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
                    <div className="space-y-5">
                        {/* VISA Card */}
                        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-4 text-white shadow-xl overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-6 right-6 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-lg font-bold italic">VISA</div>
                                    <button
                                        onClick={() => setShowAddTransaction(true)}
                                        className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium hover:bg-white/20 transition flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Set Bank
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <p className="text-xs opacity-75 mb-1">Balance</p>
                                    <h2 className="text-2xl font-bold">{formatAmount(calculations.currentBalance)}</h2>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs opacity-75">**** **** **** 5248</p>
                                        <p className="text-sm font-semibold mt-1">Jaya Prakash</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs opacity-75">Exp 07/28</p>
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
                                <button
                                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                                    className="relative flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    <span>{selectedMonth}</span>
                                    <ChevronRight className="w-4 h-4 rotate-90" />

                                    {showMonthDropdown && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowMonthDropdown(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20 max-h-60 overflow-y-auto">
                                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                                                    <button
                                                        key={month}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedMonth(month);
                                                            setShowMonthDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${selectedMonth === month ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                                                            }`}
                                                    >
                                                        {month}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
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
                        <button
                            onClick={() => setActiveTab('savings')}
                            className="w-full bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold">
                                    {transactionFilter === 'all' ? 'All' : transactionFilter === 'income' ? 'Income' : 'Expense'} Transactions
                                    ({transactions.filter(t => {
                                        if (transactionFilter === 'all') return true;
                                        if (transactionFilter === 'income') return t.amount > 0;
                                        return t.amount < 0;
                                    }).length})
                                </h3>
                                <select
                                    value={transactionFilter}
                                    onChange={(e) => setTransactionFilter(e.target.value as 'all' | 'income' | 'expense')}
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium border-none outline-none cursor-pointer"
                                >
                                    <option value="all">All</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setShowAddTransaction(true)}
                                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-medium hover:scale-105 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        <div className="space-y-3">
                            {transactions
                                .filter(t => {
                                    if (transactionFilter === 'all') return true;
                                    if (transactionFilter === 'income') return t.amount > 0;
                                    return t.amount < 0;
                                })
                                .map(transaction => (
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
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                {formatAmount(category.spent)} / {formatAmount(category.total)}
                                            </span>
                                            <button
                                                onClick={() => setEditingCategory(budgetCategories.find(c => c.id === category.id) || null)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setCategoryToDelete(category.id)}
                                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-500"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${category.percentage > 90 ? 'bg-red-500' :
                                                category.percentage > 70 ? 'bg-yellow-500' :
                                                    'bg-gray-800 dark:bg-gray-300'
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

                        <button
                            onClick={() => setShowAddCategory(true)}
                            className="w-full mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Add Category</span>
                        </button>
                    </div>
                )}

                {activeTab === 'savings' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">Savings Goal</h3>
                                <button
                                    onClick={() => setShowEditSavings(true)}
                                    className="text-sm px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition"
                                >
                                    Edit Goal
                                </button>
                            </div>
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
                <ModalWrapper isOpen={showBudgetEdit} onClose={() => setShowBudgetEdit(false)} title="Edit Monthly Budget">
                    <BudgetForm
                        budget={{ total: monthlyBudgetLimit, spent: calculations.totalBudgetSpent }}
                        onSave={handleSaveBudget}
                        onCancel={() => setShowBudgetEdit(false)}
                    />
                </ModalWrapper>
            )}

            {/* Add Category Modal */}
            {showAddCategory && (
                <ModalWrapper isOpen={showAddCategory} onClose={() => setShowAddCategory(false)} title="Add Budget Category">
                    <CategoryForm
                        onSave={handleAddCategory}
                        onCancel={() => setShowAddCategory(false)}
                    />
                </ModalWrapper>
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
                <ModalWrapper isOpen={!!editingCategory} onClose={() => setEditingCategory(null)} title="Edit Category">
                    <CategoryForm
                        category={editingCategory}
                        onSave={handleEditCategory}
                        onCancel={() => setEditingCategory(null)}
                    />
                </ModalWrapper>
            )}

            {/* Delete Category Confirmation */}
            {categoryToDelete && (
                <ConfirmDialog
                    isOpen={!!categoryToDelete}
                    onClose={() => setCategoryToDelete(null)}
                    title="Delete Category"
                    message="Are you sure you want to delete this budget category? This action cannot be undone."
                    confirmText="Delete"
                    onConfirm={handleDeleteCategory}
                    variant="danger"
                />
            )}

            {/* Edit Savings Goal Modal */}
            {showEditSavings && (
                <ModalWrapper isOpen={showEditSavings} onClose={() => setShowEditSavings(false)} title="Edit Savings Goal">
                    <SavingsGoalForm
                        currentGoal={savingsGoal}
                        onSave={handleSaveSavingsGoal}
                        onCancel={() => setShowEditSavings(false)}
                    />
                </ModalWrapper>
            )}
        </div>
    );
};

export default Finance;
