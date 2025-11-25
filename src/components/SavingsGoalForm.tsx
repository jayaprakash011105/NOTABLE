import React, { useState } from 'react';

interface SavingsGoalFormProps {
    currentGoal?: number;
    onSave: (data: { goal: number }) => void;
    onCancel: () => void;
}

const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ currentGoal, onSave, onCancel }) => {
    const [goal, setGoal] = useState(currentGoal?.toString() || '10000');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(goal);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid savings goal');
            return;
        }

        onSave({ goal: amount });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Savings Goal</label>
                <input
                    type="number"
                    step="0.01"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="input-field"
                    placeholder="Enter your savings goal"
                    required
                />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Target</p>
                <p className="text-2xl font-bold">${parseFloat(goal || '0').toLocaleString()}</p>
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
                    Save Goal
                </button>
            </div>
        </form>
    );
};

export default SavingsGoalForm;
