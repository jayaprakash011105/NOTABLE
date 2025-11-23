import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import Header from '../components/Header';
import BalanceCard from '../components/BalanceCard';
import Calendar from '../components/Calendar';
import ReminderCard from '../components/ReminderCard';
import ExpenseChart from '../components/ExpenseChart';

interface Task {
    id: number;
    text: string;
    checked: boolean;
    category?: string;
    color?: string;
}

const Dashboard = () => {


    // Load tasks from localStorage on mount
    const [quickTasks, setQuickTasks] = useState<Task[]>(() => {
        const savedTasks = localStorage.getItem('quickTasks');
        if (savedTasks) {
            return JSON.parse(savedTasks);
        }
        return [
            { id: 1, text: 'Do exercise', checked: true, category: 'Health', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
            { id: 2, text: 'Drink water', checked: true, category: 'Health', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
            { id: 3, text: 'Food', checked: false, category: 'Food', color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' },
        ];
    });

    const [newTaskText, setNewTaskText] = useState('');
    const [showAddTask, setShowAddTask] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Personal');
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');

    const categories = [
        { name: 'Personal', color: 'bg-purple-100 dark:bg-gray-700 text-purple-800 dark:text-gray-200' },
        { name: 'Health', color: 'bg-green-100 dark:bg-gray-700 text-green-800 dark:text-gray-200' },
        { name: 'Work', color: 'bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200' },
        { name: 'Food', color: 'bg-orange-100 dark:bg-gray-700 text-orange-800 dark:text-gray-200' },
    ];

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('quickTasks', JSON.stringify(quickTasks));
    }, [quickTasks]);

    const handleToggleTask = (id: number) => {
        setQuickTasks(quickTasks.map(task =>
            task.id === id ? { ...task, checked: !task.checked } : task
        ));
    };

    const handleDeleteTask = (id: number) => {
        setQuickTasks(quickTasks.filter(task => task.id !== id));
    };

    const handleAddTask = () => {
        if (newTaskText.trim()) {
            const categoryData = categories.find(c => c.name === selectedCategory);
            const newTask: Task = {
                id: Math.max(...quickTasks.map(t => t.id), 0) + 1,
                text: newTaskText,
                checked: false,
                category: selectedCategory,
                color: categoryData?.color
            };
            setQuickTasks([...quickTasks, newTask]);
            setNewTaskText('');
            setShowAddTask(false);
        }
    };

    const handleStartEdit = (task: Task) => {
        setEditingTaskId(task.id);
        setEditingText(task.text);
    };

    const handleSaveEdit = (id: number) => {
        if (editingText.trim()) {
            setQuickTasks(quickTasks.map(task =>
                task.id === id ? { ...task, text: editingText } : task
            ));
        }
        setEditingTaskId(null);
        setEditingText('');
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditingText('');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <div className="max-w-md mx-auto px-4 py-6">
                <Header />
                <BalanceCard />

                {/* Quick Tasks Section - Enhanced with Edit */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            Quick Tasks
                            <span className="text-xs bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full">
                                {quickTasks.filter(t => !t.checked).length}
                            </span>
                        </h3>
                        <button
                            onClick={() => setShowAddTask(!showAddTask)}
                            className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
                        {/* Add Task Form */}
                        {showAddTask && (
                            <div className="pb-3 border-b border-gray-200 dark:border-gray-700 animate-slide-down">
                                <input
                                    type="text"
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                                    placeholder="Add a new task..."
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white mb-2 text-sm"
                                    autoFocus
                                />
                                <div className="flex gap-2 mb-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.name}
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${selectedCategory === cat.name
                                                ? cat.color
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddTask}
                                        className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded-xl text-sm font-medium hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Add Task
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddTask(false);
                                            setNewTaskText('');
                                        }}
                                        className="px-4 bg-gray-100 dark:bg-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Task List */}
                        {quickTasks.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">No tasks yet. Click + to add one!</p>
                            </div>
                        ) : (
                            quickTasks.map((task, index) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {editingTaskId === task.id ? (
                                        // Edit Mode
                                        <>
                                            <input
                                                type="text"
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                                                className="flex-1 px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg border-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveEdit(task.id)}
                                                className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        // View Mode
                                        <>
                                            <input
                                                type="checkbox"
                                                checked={task.checked}
                                                onChange={() => handleToggleTask(task.id)}
                                                className="w-5 h-5 rounded-full accent-black dark:accent-white cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
                                            />
                                            <span className={`flex-1 text-sm transition-all duration-200 ${task.checked
                                                ? 'line-through text-gray-400 dark:text-gray-500'
                                                : 'text-gray-900 dark:text-gray-100 font-medium'
                                                }`}>
                                                {task.text}
                                            </span>
                                            {task.category && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.color}`}>
                                                    {task.category}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleStartEdit(task)}
                                                className="w-7 h-7 rounded-full bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-gray-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="w-7 h-7 rounded-full bg-red-100 dark:bg-gray-700 text-red-600 dark:text-gray-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))
                        )}

                        {/* Progress Bar */}
                        {quickTasks.length > 0 && (
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                    <span>Progress</span>
                                    <span className="font-medium">
                                        {quickTasks.filter(t => t.checked).length}/{quickTasks.length} completed
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(quickTasks.filter(t => t.checked).length / quickTasks.length) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                <Calendar />

                <div className="grid grid-cols-1 gap-6">
                    <ReminderCard />
                    <ExpenseChart />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
