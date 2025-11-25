// Notification Context for real-time updates
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Notification {
    id: string;
    type: 'task' | 'reminder' | 'budget' | 'note' | 'finance';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    taskCount: number;
    reminderCount: number;
    budgetAlertCount: number;
    noteCount: number;
    financeAlertCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const checkNotifications = () => {
            const newNotifications: Notification[] = [];
            const now = new Date();

            // 1. Check Tasks - Due today or overdue
            const tasksData = localStorage.getItem('quickTasks');
            if (tasksData) {
                const tasks = JSON.parse(tasksData);
                const dueTasks = tasks.filter((task: any) => {
                    if (task.completed || !task.date) return false;
                    const taskDate = new Date(task.date);
                    return taskDate <= now;
                });

                dueTasks.forEach((task: any) => {
                    newNotifications.push({
                        id: `task-${task.id}`,
                        type: 'task',
                        title: 'Task Due',
                        message: task.title,
                        timestamp: task.date,
                        read: false,
                        actionUrl: '/tasks'
                    });
                });
            }

            // 2. Check Reminders
            const remindersData = localStorage.getItem('reminders');
            if (remindersData) {
                const reminders = JSON.parse(remindersData);
                const dueReminders = reminders.filter((reminder: any) => {
                    const reminderTime = new Date(reminder.dateTime);
                    return reminderTime <= now && !reminder.notified;
                });

                dueReminders.forEach((reminder: any) => {
                    newNotifications.push({
                        id: `reminder-${reminder.id}`,
                        type: 'reminder',
                        title: 'Reminder',
                        message: reminder.title,
                        timestamp: reminder.dateTime,
                        read: false
                    });
                });
            }

            // 3. Check Budget Alerts
            const transactionsData = localStorage.getItem('transactions');
            const budgetLimit = localStorage.getItem('monthlyBudgetLimit');
            if (transactionsData && budgetLimit) {
                const transactions = JSON.parse(transactionsData);
                const totalExpenses = transactions
                    .filter((t: any) => t.amount < 0)
                    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
                const limit = parseFloat(budgetLimit);

                if (totalExpenses > limit) {
                    newNotifications.push({
                        id: 'budget-exceeded',
                        type: 'budget',
                        title: 'Budget Exceeded',
                        message: `You've exceeded your monthly budget by ${Math.round(totalExpenses - limit)}`,
                        timestamp: new Date().toISOString(),
                        read: false,
                        actionUrl: '/finance'
                    });
                }
            }

            setNotifications(newNotifications);
        };

        // Check immediately
        checkNotifications();

        // Check every 30 seconds
        const interval = setInterval(checkNotifications, 30000);

        // Listen for storage changes
        const handleStorageChange = () => checkNotifications();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleStorageChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleStorageChange);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    const taskCount = notifications.filter(n => n.type === 'task' && !n.read).length;
    const reminderCount = notifications.filter(n => n.type === 'reminder' && !n.read).length;
    const budgetAlertCount = notifications.filter(n => n.type === 'budget' && !n.read).length;
    const noteCount = 0; // Can be expanded
    const financeAlertCount = budgetAlertCount;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                taskCount,
                reminderCount,
                budgetAlertCount,
                noteCount,
                financeAlertCount,
                markAsRead,
                markAllAsRead,
                clearAll
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
