import { useState } from 'react';
import { Search, Plus, Calendar, MoreVertical, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ModalWrapper from '../components/ModalWrapper';
import TaskForm from '../components/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog';

interface Task {
    id: number;
    title: string;
    time?: string;
    category?: string;
    completed: boolean;
    color?: string;
}

const Tasks = () => {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, title: 'Do exercise', completed: true, time: '8:00 AM', category: 'Health', color: 'bg-green-100 dark:bg-green-900' },
        { id: 2, title: 'Drink water', completed: true, time: '9:00 AM', category: 'Health', color: 'bg-blue-100 dark:bg-blue-900' },
        { id: 3, title: 'Food', completed: false, time: '12:00 PM', category: 'Daily', color: 'bg-purple-100 dark:bg-purple-900' },
        { id: 4, title: 'Team meeting', completed: false, time: '2:00 PM', category: 'Work', color: 'bg-orange-100 dark:bg-orange-900' },
        { id: 5, title: 'Study React', completed: false, time: '6:00 PM', category: 'Learning', color: 'bg-pink-100 dark:bg-pink-900' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [showMenuForTask, setShowMenuForTask] = useState<number | null>(null);

    const completedCount = tasks.filter(t => t.completed).length;

    const categoryColors: Record<string, string> = {
        'Health': 'bg-green-100 dark:bg-green-900',
        'Work': 'bg-orange-100 dark:bg-orange-900',
        'Daily': 'bg-purple-100 dark:bg-purple-900',
        'Learning': 'bg-pink-100 dark:bg-pink-900',
        'Personal': 'bg-blue-100 dark:bg-blue-900',
        'Shopping': 'bg-yellow-100 dark:bg-yellow-900',
        'Other': 'bg-gray-100 dark:bg-gray-700'
    };

    const handleToggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleAddTask = (taskData: Partial<Task>) => {
        const newTask: Task = {
            id: Math.max(...tasks.map(t => t.id), 0) + 1,
            title: taskData.title || '',
            time: taskData.time,
            category: taskData.category,
            completed: false,
            color: categoryColors[taskData.category || 'Other']
        };
        setTasks([...tasks, newTask]);
        setShowAddModal(false);
    };

    const handleEditTask = (taskData: Partial<Task>) => {
        if (editingTask) {
            setTasks(tasks.map(task =>
                task.id === editingTask.id
                    ? { ...task, ...taskData, color: categoryColors[taskData.category || 'Other'] }
                    : task
            ));
            setEditingTask(null);
        }
    };

    const handleDeleteTask = () => {
        if (taskToDelete) {
            setTasks(tasks.filter(task => task.id !== taskToDelete));
            setTaskToDelete(null);
        }
    };

    const filteredTasks = tasks.filter(task => {
        // Search filter
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Status filter
        if (activeFilter === 'completed' && !task.completed) return false;
        if (activeFilter === 'today') return true; // For demo, show all
        if (activeFilter === 'upcoming' && task.completed) return false;

        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-32">
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Tasks</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {completedCount} of {tasks.length} completed
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black hover:scale-105 transition-all duration-200 shadow-md"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
                    {['all', 'today', 'upcoming', 'completed'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter as typeof activeFilter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeFilter === filter
                                ? 'bg-black dark:bg-white text-white dark:text-black scale-105'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105'
                                }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${task.completed ? 'opacity-60' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleTask(task.id)}
                                    className="w-5 h-5 mt-1 rounded accent-black dark:accent-white cursor-pointer transition"
                                />
                                <div className="flex-1">
                                    <h3
                                        className={`font-medium text-base ${task.completed ? 'line-through text-gray-400' : ''
                                            }`}
                                    >
                                        {task.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        {task.time && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                {task.time}
                                            </div>
                                        )}
                                        {task.category && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.color}`}>
                                                {task.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenuForTask(showMenuForTask === task.id ? null : task.id)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>

                                    {showMenuForTask === task.id && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 animate-slide-down">
                                            <button
                                                onClick={() => {
                                                    setEditingTask(task);
                                                    setShowMenuForTask(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setTaskToDelete(task.id);
                                                    setShowMenuForTask(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredTasks.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Task Modal */}
            <ModalWrapper
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Task"
            >
                <TaskForm
                    onSave={handleAddTask}
                    onCancel={() => setShowAddModal(false)}
                />
            </ModalWrapper>

            {/* Edit Task Modal */}
            <ModalWrapper
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                title="Edit Task"
            >
                <TaskForm
                    task={editingTask || undefined}
                    onSave={handleEditTask}
                    onCancel={() => setEditingTask(null)}
                />
            </ModalWrapper>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={handleDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default Tasks;
