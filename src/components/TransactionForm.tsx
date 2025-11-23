import React, { useState } from 'react';

interface TransactionFormProps {
    transaction?: {
        id: number;
        name: string;
        amount: number;
        category: string;
        date: string;
    };
    onSave: (transaction: any) => void;
    onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: transaction?.name || '',
        amount: transaction?.amount ? Math.abs(transaction.amount).toString() : '',
        category: transaction?.category || 'Food & Dining',
        date: transaction?.date || new Date().toISOString().split('T')[0],
        type: transaction?.amount ? (transaction.amount > 0 ? 'income' : 'expense') : 'expense'
    });

    const categories = [
        'Food & Dining',
        'Housing & Rent',
        'Transportation',
        'Entertainment',
        'Shopping',
        'Healthcare',
        'Income',
        'Other'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        onSave({
            ...transaction,
            name: formData.name,
            amount: formData.type === 'income' ? amount : -amount,
            category: formData.category,
            date: formData.date
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`flex-1 py-2 rounded-xl font-medium transition ${formData.type === 'expense'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`flex-1 py-2 rounded-xl font-medium transition ${formData.type === 'income'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                    >
                        Income
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter description"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                    required
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 btn-primary"
                >
                    {transaction ? 'Update' : 'Add'} Transaction
                </button>
            </div>
        </form>
    );
};

export default TransactionForm;
