import { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
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

    // Save tasks to localStorage
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
        if (!task.date) return isToday;
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
            featured: false
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black pb-32">
            <div className="max-w-md mx-auto">
                {/* Card Container */}
                <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl m-4 p-8 min-h-[calc(100vh-8rem)]">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <p className="text-gray-400 text-sm mb-2">
                                {monthName} {dayOfMonth}, {year}
                            </p>
                            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                                Today
                            </h1>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                            👤
                        </div>
                    </div>

                    {/* Day Selector */}
                    <div className="flex justify-center gap-4 mb-10">
                        {weekDays.map((day, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedDate(day.date)}
                                className={`transition-all duration-300 ${day.date.toDateString() === selectedDateString
                                        ? 'bg-gray-800 dark:bg-gray-900 text-white px-5 py-4 rounded-[2rem] shadow-lg scale-110'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className={`text-lg font-medium mb-1`}>
                                        {day.number}
                                    </span>
                                    <span className="text-xs">
                                        {day.name}
                                    </span>
                                    {day.date.toDateString() === selectedDateString && (
                                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-2"></div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Timeline */}
                    {todayTasks.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <Check className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">No tasks yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">
                                Add your first task to get started
                            </p>
                        </div>
                    ) : (
                        <div className="relative pl-2">
                            {/* Timeline Line */}
                            <div className="absolute left-[23px] top-6 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-700"></div>

                            {/* Tasks */}
                            <div className="space-y-8">
                                {todayTasks.map((task, index) => (
                                    <div key={task.id} className="relative flex gap-5">
                                        {/* Timeline Dot */}
                                        <button
                                            onClick={() => handleToggleTask(task.id)}
                                            className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center transition-all hover:scale-110 ${task.completed
                                                    ? 'bg-gray-800 dark:bg-gray-600'
                                                    : index === 0
                                                        ? 'bg-gray-800 dark:bg-gray-600'
                                                        : 'bg-white dark:bg-gray-800 ring-2 ring-gray-200 dark:ring-gray-700'
                                                }`}
                                        >
                                            {(task.completed || index === 0) && (
                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                            )}
                                        </button>

                                        {/* Task Content */}
                                        <div className="flex-1">
                                            {index === 0 ? (
                                                /* Featured Task */}
                                            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-[2rem] p-7 text-white overflow-hidden shadow-2xl">
                                                {/* Wave Pattern */}
                                                <div className="absolute inset-0 opacity-[0.03]">
                                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                        <path d="M0,30 Q20,25 40,30 T80,30 Q90,30 100,35 L100,100 L0,100 Z" fill="white" />
                                                        <path d="M0,45 Q20,40 40,45 T80,45 Q90,45 100,50 L100,100 L0,100 Z" fill="white" />
                                                        <path d="M0,60 Q20,55 40,60 T80,60 Q90,60 100,65 L100,100 L0,100 Z" fill="white" />
                                                        <path d="M0,75 Q20,70 40,75 T80,75 Q90,75 100,80 L100,100 L0,100 Z" fill="white" />
                                                    </svg>
                                                </div>

                                                <div className="relative">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
                                                            {task.description && (
                                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {task.time && (
                                                            <span className="text-gray-400 text-sm font-medium ml-4">
                                                                {task.time}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-6">
                                                        {/* Avatars */}
                                                        <div className="flex -space-x-4">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-3 border-gray-800 flex items-center justify-center text-lg shadow-lg">
                                                                👤
                                                            </div>
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 border-3 border-gray-800 flex items-center justify-center text-lg shadow-lg">
                                                                👤
                                                            </div>
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-red-500 border-3 border-gray-800 flex items-center justify-center text-lg shadow-lg">
                                                                👤
                                                            </div>
                                                        </div>

                                                        {/* Complete Checkbox */}
                                                        <button
                                                            onClick={() => handleToggleTask(task.id)}
                                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${task.completed
                                                                    ? 'bg-green-500'
                                                                    : 'bg-white hover:scale-105'
                                                                }`}
                                                        >
                                                            {task.completed && (
                                                                <Check className="w-6 h-6 text-white font-bold" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            ) : (
                                                /* Regular Task */}
                                            <div onClick={() => handleToggleTask(task.id)} className="cursor-pointer group">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className={`text-xl font-semibold mb-1 transition-all ${task.completed
                                                                ? 'line-through text-gray-400'
                                                                : 'text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                                            }`}>
                                                            {task.title}
                                                        </h3>
                                                        {task.description && (
                                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {task.time && (
                                                        <span className="text-gray-400 text-sm ml-4">
                                                            {task.time}
                                                        </span>
                                                    )}
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
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-28 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all z-50 hover:shadow-blue-500/50"
            >
                <Plus className="w-8 h-8" />
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
