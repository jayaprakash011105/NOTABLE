import { useState } from 'react';

interface NoteFormProps {
    note?: {
        id: number;
        title: string;
        content: string;
        color: string;
        pinned?: boolean;
    };
    onSave: (note: any) => void;
    onCancel: () => void;
}

const NoteForm = ({ note, onSave, onCancel }: NoteFormProps) => {
    const [formData, setFormData] = useState({
        title: note?.title || '',
        content: note?.content || '',
        color: note?.color || 'bg-yellow-100 dark:bg-yellow-900'
    });

    const colors = [
        { name: 'Yellow', value: 'bg-yellow-100 dark:bg-yellow-900' },
        { name: 'Green', value: 'bg-green-100 dark:bg-green-900' },
        { name: 'Blue', value: 'bg-blue-100 dark:bg-blue-900' },
        { name: 'Purple', value: 'bg-purple-100 dark:bg-purple-900' },
        { name: 'Pink', value: 'bg-pink-100 dark:bg-pink-900' },
        { name: 'Orange', value: 'bg-orange-100 dark:bg-orange-900' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Please enter both title and content');
            return;
        }

        onSave({
            id: note?.id,
            title: formData.title,
            content: formData.content,
            color: formData.color,
            date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            pinned: note?.pinned || false
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Note Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter note title"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Enter note content"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="grid grid-cols-3 gap-2">
                    {colors.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: color.value })}
                            className={`${color.value} p-3 rounded-xl border-2 transition ${formData.color === color.value
                                    ? 'border-black dark:border-white'
                                    : 'border-transparent'
                                }`}
                        >
                            {color.name}
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
                    {note ? 'Update' : 'Add'} Note
                </button>
            </div>
        </form>
    );
};

export default NoteForm;
