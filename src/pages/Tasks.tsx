import { useState, useEffect } from 'react';
import { Plus, Check, Edit2, Trash2 } from 'lucide-react';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmDialog from '../components/ConfirmDialog';

interface Task {
    id: number;
    title: string;
    description?: string;
    time?: string;
    category?: string;
    completed: boolean;
    featured?: boolean;
    date: string;
}

const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    // Form state for add/edit
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskTime, setTaskTime] = useState('');
    const [taskCategory, setTaskCategory] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);

    // Load tasks from localStorage
    useEffect(() => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }
    }, []);

    // Save tasks to localStorage
    useEffect(() => {
        if (tasks.length > 0) {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    // Get current date
    const currentDate = new Date();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
    const year = currentDate.getFullYear();
    const dayOfMonth = currentDate.getDate();

    // Generate week days
    const generateWeekDays = () => {
        const days = [];
        for (let i = -3; i <= 3; i++) {
            const date = new Date(currentDate);
            date.setDate(dayOfMonth + i);
            days.push({
                number: date.getDate(),
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: date.toISOString().split('T')[0]
            });
        }
        return days;
    };

    const weekDays = generateWeekDays();
    const selectedDate = weekDays.find(d => d.number === selectedDay)?.fullDate || new Date().toISOString().split('T')[0];

    // Filter tasks by selected date
    const filteredTasks = tasks.filter(task => task.date === selectedDate);

    const handleToggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const resetForm = () => {
        setTaskTitle('');
        setTaskDescription('');
        setTaskTime('');
        setTaskCategory('');
        setIsFeatured(false);
    };

    const handleAddTask = () => {
        if (!taskTitle.trim()) return;

        const newTask: Task = {
            id: Date.now(),
            title: taskTitle,
            description: taskDescription,
            time: taskTime,
            category: taskCategory,
            completed: false,
            featured: isFeatured,
            date: selectedDate
        };
        setTasks([...tasks, newTask]);
        setShowAddModal(false);
        resetForm();
    };

    const handleEditTask = () => {
        if (!editingTask || !taskTitle.trim()) return;

        setTasks(tasks.map(task =>
            task.id === editingTask.id
                ? {
                    ...task,
                    title: taskTitle,
                    description: taskDescription,
                    time: taskTime,
                    category: taskCategory,
                    featured: isFeatured
                }
                : task
        ));
        setEditingTask(null);
        resetForm();
    };

    const handleDeleteTask = () => {
        if (taskToDelete) {
            setTasks(tasks.filter(task => task.id !== taskToDelete));
            setTaskToDelete(null);
        }
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setTaskTitle(task.title);
        setTaskDescription(task.description || '');
        setTaskTime(task.time || '');
        setTaskCategory(task.category || '');
        setIsFeatured(task.featured || false);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black pb-32">
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">{monthName} {selectedDay}, {year}</p>
                        <h1 className="text-4xl font-bold">Today</h1>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-12 h-12 rounded-full bg-gray-800 dark:bg-gray-700 flex items-center justify-center hover:scale-105 transition-all"
                    >
                        <Plus className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Day Selector */}
                <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
                    {weekDays.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDay(day.number)}
                            className={`flex-shrink-0 transition-all duration-300 ${selectedDay === day.number
                                ? 'bg-gray-800 dark:bg-gray-700 text-white px-6 py-4 rounded-3xl'
                                : 'flex flex-col items-center px-4'
                                }`}
                        >
                            <span className={`text-sm ${selectedDay === day.number ? 'mb-1' : 'text-gray-400'}`}>
                                {day.number}
                            </span>
                            <span className={`text-xs ${selectedDay === day.number ? '' : 'text-gray-400'}`}>
                                {day.name}
                            </span>
                            {selectedDay === day.number && (
                                <div className="w-1.5 h-1.5 bg-white rounded-full mt-2"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                {filteredTasks.length > 0 ? (
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                        {/* Tasks */}
                        <div className="space-y-6">
                            {filteredTasks.map((task) => (
                                <div key={task.id} className="relative flex gap-4">
                                    {/* Timeline Dot */}
                                    <div
                                        className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${task.completed
                                            ? 'bg-gray-800 dark:bg-gray-700 border-gray-100 dark:border-gray-900'
                                            : task.featured
                                                ? 'bg-gray-800 dark:bg-gray-700 border-gray-100 dark:border-gray-900'
                                                : 'bg-gray-100 dark:bg-black border-gray-100 dark:border-gray-900'
                                            }`}
                                    >
                                        {task.completed && (
                                            <Check className="w-5 h-5 text-white" />
                                        )}
                                    </div>

                                    {/* Task Card */}
                                    <div className="flex-1 pb-6">
                                        {task.featured ? (
                                            /* Featured Task Card */
                                            <div className="relative bg-gray-800 dark:bg-gray-900 rounded-3xl p-6 text-white overflow-hidden group">
                                                {/* Wave Pattern Background */}
                                                <div className="absolute inset-0 opacity-5">
                                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                        <path d="M0,50 Q25,40 50,50 T100,50 L100,100 L0,100 Z" fill="white" />
                                                        <path d="M0,60 Q25,50 50,60 T100,60 L100,100 L0,100 Z" fill="white" />
                                                        <path d="M0,70 Q25,60 50,70 T100,70 L100,100 L0,100 Z" fill="white" />
                                                    </svg>
                                                </div>

                                                <div className="relative flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className={`text-xl font-semibold mb-1 ${task.completed ? 'line-through opacity-60' : ''}`}>
                                                            {task.title}
                                                        </h3>
                                                        {task.description && (
                                                            <p className="text-sm text-gray-300">{task.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {task.time && (
                                                            <span className="text-sm text-gray-400">{task.time}</span>
                                                        )}
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                            <button
                                                                onClick={() => openEditModal(task)}
                                                                className="p-1.5 hover:bg-gray-700 rounded-lg transition"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setTaskToDelete(task.id)}
                                                                className="p-1.5 hover:bg-red-500 rounded-lg transition"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative flex items-center justify-end mt-6">
                                                    {/* Complete Button */}
                                                    <button
                                                        onClick={() => handleToggleTask(task.id)}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${task.completed
                                                            ? 'bg-green-500'
                                                            : 'bg-white text-gray-800'
                                                            }`}
                                                    >
                                                        {task.completed && <Check className="w-5 h-5 text-white" />}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Regular Task */
                                            <div className="group">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h3
                                                        onClick={() => handleToggleTask(task.id)}
                                                        className={`font-semibold text-lg cursor-pointer ${task.completed ? 'line-through text-gray-400' : ''
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        {task.time && (
                                                            <span className="text-sm text-gray-400">{task.time}</span>
                                                        )}
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                            <button
                                                                onClick={() => openEditModal(task)}
                                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setTaskToDelete(task.id)}
                                                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition text-red-500"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-gray-400">{task.description}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400 mb-4">No tasks for this day</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-blue-500 hover:text-blue-600 font-medium"
                        >
                            Add your first task
                        </button>
                    </div>
                )}
            </div>

            {/* Add Task Modal */}
            <ModalWrapper
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    resetForm();
                }}
                title="Add New Task"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Task Title *</label>
                        <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="Enter task title"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="Enter task description"
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Time</label>
                        <input
                            type="time"
                            value={taskTime}
                            onChange={(e) => setTaskTime(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                            value={taskCategory}
                            onChange={(e) => setTaskCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="featured"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="w-5 h-5 rounded accent-blue-500"
                        />
                        <label htmlFor="featured" className="text-sm font-medium">
                            Featured Task (Large card)
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                setShowAddModal(false);
                                resetForm();
                            }}
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-2xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddTask}
                            disabled={!taskTitle.trim()}
                            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-2xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            Add Task
                        </button>
                    </div>
                </div>
            </ModalWrapper>

            {/* Edit Task Modal */}
            <ModalWrapper
                isOpen={!!editingTask}
                onClose={() => {
                    setEditingTask(null);
                    resetForm();
                }}
                title="Edit Task"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Task Title *</label>
                        <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="Enter task title"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="Enter task description"
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Time</label>
                        <input
                            type="time"
                            value={taskTime}
                            onChange={(e) => setTaskTime(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                            value={taskCategory}
                            onChange={(e) => setTaskCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="featured-edit"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="w-5 h-5 rounded accent-blue-500"
                        />
                        <label htmlFor="featured-edit" className="text-sm font-medium">
                            Featured Task (Large card)
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                setEditingTask(null);
                                resetForm();
                            }}
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-2xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEditTask}
                            disabled={!taskTitle.trim()}
                            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-2xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
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
