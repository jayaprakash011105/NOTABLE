import React, { useState } from 'react';

interface CategoryFormProps {
    category?: {
        id: number;
        name: string;
        total: number;
        icon: string;
    };
    onSave: (category: any) => void;
    onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSave, onCancel }) => {
    const [name, setName] = useState(category?.name || '');
    const [total, setTotal] = useState(category?.total.toString() || '');
    const [icon, setIcon] = useState(category?.icon || '📁');

    const emojiOptions = ['🏠', '🍔', '🚗', '🛍️', '🎬', '💰', '✈️', '🏥', '📱', '⚡', '🎓', '🎮'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(total);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        if (!name.trim()) {
            alert('Please enter a category name');
            return;
        }

        onSave({
            name: name.trim(),
            total: amount,
            icon: icon
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Food, Transport, Entertainment"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Budget Amount</label>
                <input
                    type="number"
                    step="0.01"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    className="input-field"
                    placeholder="Enter budget for this category"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                    {emojiOptions.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => setIcon(emoji)}
                            className={`p-3 rounded-lg text-2xl transition ${icon === emoji
                                    ? 'bg-black dark:bg-white'
                                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {emoji}
                        </button>
                    ))}
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
                    {category ? 'Save Changes' : 'Add Category'}
                </button>
            </div>
        </form>
    );
};

export default CategoryForm;
