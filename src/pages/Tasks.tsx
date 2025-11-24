import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import ModalWrapper from '../components/ModalWrapper';
import TaskForm from '../components/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog';

interface Task {
    id: number;
    title: string;
    description?: string;
    time?: string;
    category?: string;
    completed: boolean;
    featured?: boolean;
    avatars?: string[];
}

const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 1,
            title: 'Meeting',
            description: 'Discuss team task for the day',
            completed: false,
            time: '9:00 AM',
            category: 'Work',
            featured: true,
            avatars: ['👤', '👤', '👤']
        },
        { id: 2, title: 'Icon set', description: 'Edit icons for team task for next week', completed: false, time: '9:00 AM', category: 'Design' },
        { id: 3, title: 'Prototype', description: 'Make and send prototype to the client', completed: false, time: '9:00 AM', category: 'Design' },
        { id: 4, title: 'Check asset', description: 'Start checking asset', completed: false, time: '9:00 AM', category: 'Work' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState(13);

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
                name: date.toLocaleDateString('en-US', { weekday: 'short' })
            });
        }
        return days;
    };

    const weekDays = generateWeekDays();

    const handleToggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleAddTask = (taskData: Partial<Task>) => {
        const newTask: Task = {
            id: Math.max(...tasks.map(t => t.id), 0) + 1,
            title: taskData.title || '',
            description: taskData.description,
            time: taskData.time,
            category: taskData.category,
            completed: false
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                            <span className="text-xl">👤</span>
                        </div>
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
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                    {/* Tasks */}
                    <div className="space-y-6">
                        {tasks.map((task, index) => (
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
                                        <div className="relative bg-gray-800 dark:bg-gray-900 rounded-3xl p-6 text-white overflow-hidden">
                                            {/* Wave Pattern Background */}
                                            <div className="absolute inset-0 opacity-5">
                                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                    <path d="M0,50 Q25,40 50,50 T100,50 L100,100 L0,100 Z" fill="white" />
                                                    <path d="M0,60 Q25,50 50,60 T100,60 L100,100 L0,100 Z" fill="white" />
                                                    <path d="M0,70 Q25,60 50,70 T100,70 L100,100 L0,100 Z" fill="white" />
                                                </svg>
                                            </div>

                                            <div className="relative flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-1">{task.title}</h3>
                                                    <p className="text-sm text-gray-300">{task.description}</p>
                                                </div>
                                                <span className="text-sm text-gray-400">{task.time}</span>
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
                                                            : 'bg-white text-gray-800'
                                                        }`}
                                                >
                                                    {task.completed && <Check className="w-5 h-5 text-white" />}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Regular Task */
                                        <div
                                            onClick={() => handleToggleTask(task.id)}
                                            className="cursor-pointer group"
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-400' : ''
                                                    }`}>
                                                    {task.title}
                                                </h3>
                                                <span className="text-sm text-gray-400">{task.time}</span>
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
