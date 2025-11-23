import React, { useState } from 'react';

interface TaskFormProps {
    task?: {
        id: number;
        title: string;
        time?: string;
        category?: string;
        completed: boolean;
    };
    onSave: (task: any) => void;
    onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        time: task?.time || '',
        category: task?.category || 'Daily',
    });

    const categories = ['Health', 'Work', 'Daily', 'Learning', 'Personal', 'Shopping', 'Other'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Please enter a task title');
            return;
        }

        onSave({
            ...task,
            title: formData.title,
            time: formData.time || undefined,
            category: formData.category,
            completed: task?.completed || false
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter task title"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Time (Optional)</label>
                <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field"
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
                    {task ? 'Update' : 'Add'} Task
                </button>
            </div>
        </form>
    );
};

export default TaskForm;
