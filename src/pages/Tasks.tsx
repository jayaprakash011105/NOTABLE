import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Edit3 } from 'lucide-react';
import ModalWrapper from '../components/ModalWrapper';
import TaskForm from '../components/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog';

interface Task {
    id: number;
    title: string;
    description?: string;
    time?: string;
    date?: string;
    category?: string;
    completed: boolean;
    featured?: boolean;
    avatars?: string[];
}

const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Load tasks from localStorage
    useEffect(() => {
        const savedTasks = localStorage.getItem('notable_tasks');
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }
    }, []);

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        if (tasks.length > 0) {
            localStorage.setItem('notable_tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    // Get current date info
    const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long' });
    const year = selectedDate.getFullYear();
    const dayOfMonth = selectedDate.getDate();
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    // Generate week days
    const generateWeekDays = () => {
        const days = [];
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(dayOfMonth - 3);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push({
                number: date.getDate(),
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date
            });
        }
        return days;
    };

    const weekDays = generateWeekDays();

    // Filter tasks for selected date
    const selectedDateString = selectedDate.toDateString();
    const todayTasks = tasks.filter(task => {
        if (!task.date) return isToday; // Tasks without dates show on today
        return new Date(task.date).toDateString() === selectedDateString;
    }).sort((a, b) => {
        if (!a.time || !b.time) return 0;
        return a.time.localeCompare(b.time);
    });

    const handleToggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleAddTask = (taskData: Partial<Task>) => {
        const newTask: Task = {
            id: Date.now(),
            title: taskData.title || '',
            description: taskData.description,
            time: taskData.time,
            date: selectedDate.toISOString(),
            category: taskData.category,
            completed: false,
            featured: taskData.featured || false
        };
        setTasks([...tasks, newTask]);
        setShowAddModal(false);
    };

    const handleEditTask = (taskData: Partial<Task>) => {
        if (editingTask) {
            setTasks(tasks.map(task =>
                task.id === editingTask.id ? { ...task, ...taskData } : task
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

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-32">
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">
                            {monthName} {dayOfMonth}, {year}
                        </p>
                        <h1 className="text-4xl font-bold">
                            {isToday ? 'Today' : weekDays.find(d => d.date.toDateString() === selectedDateString)?.name || 'Tasks'}
                        </h1>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-xl">
                        👤
                    </div>
                </div>

                {/* Day Selector */}
                <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
                    {weekDays.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => handleDateSelect(day.date)}
                            className={`flex-shrink-0 transition-all duration-300 ${day.date.toDateString() === selectedDateString
                                    ? 'bg-gray-800 dark:bg-gray-700 text-white px-6 py-4 rounded-3xl'
                                    : 'flex flex-col items-center px-4'
                                }`}
                        >
                            <span className={`text-sm ${day.date.toDateString() === selectedDateString ? 'mb-1' : 'text-gray-400'}`}>
                                {day.number}
                            </span>
                            <span className={`text-xs ${day.date.toDateString() === selectedDateString ? '' : 'text-gray-400'}`}>
                                {day.name}
                            </span>
                            {day.date.toDateString() === selectedDateString && (
                                <div className="w-1.5 h-1.5 bg-white rounded-full mt-2"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tasks or Empty State */}
                {todayTasks.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Check className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Add your first task to get started
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:scale-105 transition-all"
                        >
                            Add Task
                        </button>
                    </div>
                ) : (
                    /* Timeline */
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                        {/* Tasks */}
                        <div className="space-y-6">
                            {todayTasks.map((task, index) => (
                                <div key={task.id} className="relative flex gap-4 group">
                                    {/* Timeline Dot */}
                                    <div
                                        className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all cursor-pointer ${task.completed
                                                ? 'bg-gray-800 dark:bg-gray-700 border-gray-50 dark:border-black'
                                                : task.featured
                                                    ? 'bg-gray-800 dark:bg-gray-700 border-gray-50 dark:border-black'
                                                    : 'bg-gray-50 dark:bg-black border-gray-50 dark:border-black hover:bg-gray-200 dark:hover:bg-gray-900'
                                            }`}
                                        onClick={() => handleToggleTask(task.id)}
                                    >
                                        {task.completed && (
                                            <Check className="w-5 h-5 text-white" />
                                        )}
                                    </div>

                                    {/* Task Card */}
                                    <div className="flex-1 pb-6">
                                        {task.featured ? (
                                            /* Featured Task Card */
                                            <div className="relative bg-gray-800 dark:bg-gray-900 rounded-3xl p-6 text-white overflow-hidden">
                                                {/* Wave Pattern Background */}
                                                <div className="absolute inset-0 opacity-5">
                                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                        <path d="M0,50 Q25,40 50,50 T100,50 L100,100 L0,100 Z" fill="white" />
                                                        <path d="M0,60 Q25,50 50,60 T100,60 L100,100 L0,100 Z" fill="white" />
                                                        <path d="M0,70 Q25,60 50,70 T100,70 L100,100 L0,100 Z" fill="white" />
                                                    </svg>
                                                </div>

                                                {/* Edit/Delete buttons */}
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <button
                                                        onClick={() => setEditingTask(task)}
                                                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setTaskToDelete(task.id)}
                                                        className="w-8 h-8 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/30 transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="relative flex items-start justify-between mb-4">
                                                    <div className="flex-1 pr-20">
                                                        <h3 className="text-xl font-semibold mb-1">{task.title}</h3>
                                                        {task.description && (
                                                            <p className="text-sm text-gray-300">{task.description}</p>
                                                        )}
                                                    </div>
                                                    {task.time && (
                                                        <span className="text-sm text-gray-400">{task.time}</span>
                                                    )}
                                                </div>

                                                <div className="relative flex items-center justify-between mt-6">
                                                    {/* Avatars */}
                                                    <div className="flex -space-x-3">
                                                        {task.avatars?.map((avatar, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-gray-800 flex items-center justify-center text-sm"
                                                            >
                                                                {avatar}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Complete Button */}
                                                    <button
                                                        onClick={() => handleToggleTask(task.id)}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${task.completed
                                                                ? 'bg-green-500'
                                                                : 'bg-white text-gray-800 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {task.completed && <Check className="w-5 h-5 text-white" />}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Regular Task */
                                            <div className="cursor-pointer">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex-1">
                                                        <h3
                                                            onClick={() => handleToggleTask(task.id)}
                                                            className={`font-semibold text-lg transition-all ${task.completed ? 'line-through text-gray-400' : 'hover:text-gray-600 dark:hover:text-gray-300'
                                                                }`}
                                                        >
                                                            {task.title}
                                                        </h3>
                                                        {task.description && (
                                                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                                                        )}
                                                        {task.category && (
                                                            <span className="inline-block mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                                                                {task.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {task.time && (
                                                        <span className="text-sm text-gray-400 ml-4">{task.time}</span>
                                                    )}
                                                </div>

                                                {/* Action buttons on hover */}
                                                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingTask(task)}
                                                        className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-1"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setTaskToDelete(task.id)}
                                                        className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all z-50"
            >
                <Plus className="w-6 h-6" />
            </button>

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
