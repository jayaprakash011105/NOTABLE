import React, { useState } from 'react';

interface BudgetFormProps {
    budget?: {
        total: number;
        spent: number;
        categories?: Array<{
            name: string;
            amount: number;
        }>;
    };
    onSave: (budget: any) => void;
    onCancel: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onSave, onCancel }) => {
    const [totalBudget, setTotalBudget] = useState(budget?.total.toString() || '15000');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(totalBudget);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        onSave({
            total: amount,
            spent: budget?.spent || 0
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Monthly Budget</label>
                <input
                    type="number"
                    step="0.01"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="input-field"
                    placeholder="Enter total budget"
                    required
                />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Budget Breakdown</p>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Current Budget:</span>
                        <span className="font-semibold">${totalBudget}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Already Spent:</span>
                        <span className="font-semibold text-red-500">${budget?.spent || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                        <span>Remaining:</span>
                        <span className="font-semibold text-green-500">
                            ${(parseFloat(totalBudget) - (budget?.spent || 0)).toFixed(2)}
                        </span>
                    </div>
                </div>
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
                    Save Budget
                </button>
            </div>
        </form>
    );
};

export default BudgetForm;
