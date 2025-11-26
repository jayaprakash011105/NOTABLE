import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    setDoc,
    query,
    orderBy,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Transaction {
    id: string;
    name: string;
    amount: number;
    category: string;
    date: string;
    icon: string;
    createdAt: Date;
}

export interface BudgetCategory {
    id: string;
    name: string;
    total: number;
    icon: string;
    createdAt: Date;
}

export interface UserSettings {
    monthlyBudgetLimit: number;
    savingsGoal: number;
    updatedAt: Date;
}

// Helper to get user's collection references
const getUserCollection = (userId: string, collectionName: string) => {
    return collection(db, 'users', userId, collectionName);
};

// ==================== TRANSACTIONS ====================

export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
        const transactionsRef = getUserCollection(userId, 'transactions');
        const docRef = await addDoc(transactionsRef, {
            ...transaction,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
};

export const updateTransaction = async (userId: string, transactionId: string, data: Partial<Transaction>) => {
    try {
        const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
        await updateDoc(transactionRef, data);
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
};

export const deleteTransaction = async (userId: string, transactionId: string) => {
    try {
        const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
        await deleteDoc(transactionRef);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
    try {
        const transactionsRef = getUserCollection(userId, 'transactions');
        const q = query(transactionsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Transaction[];
    } catch (error) {
        console.error('Error getting transactions:', error);
        throw error;
    }
};

export const subscribeToTransactions = (
    userId: string,
    callback: (transactions: Transaction[]) => void
): Unsubscribe => {
    const transactionsRef = getUserCollection(userId, 'transactions');
    const q = query(transactionsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Transaction[];
        callback(transactions);
    });
};

// ==================== BUDGET CATEGORIES ====================

export const addBudgetCategory = async (userId: string, category: Omit<BudgetCategory, 'id' | 'createdAt'>) => {
    try {
        const categoriesRef = getUserCollection(userId, 'budgetCategories');
        const docRef = await addDoc(categoriesRef, {
            ...category,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding budget category:', error);
        throw error;
    }
};

export const updateBudgetCategory = async (userId: string, categoryId: string, data: Partial<BudgetCategory>) => {
    try {
        const categoryRef = doc(db, 'users', userId, 'budgetCategories', categoryId);
        await updateDoc(categoryRef, data);
    } catch (error) {
        console.error('Error updating budget category:', error);
        throw error;
    }
};

export const deleteBudgetCategory = async (userId: string, categoryId: string) => {
    try {
        const categoryRef = doc(db, 'users', userId, 'budgetCategories', categoryId);
        await deleteDoc(categoryRef);
    } catch (error) {
        console.error('Error deleting budget category:', error);
        throw error;
    }
};

export const getBudgetCategories = async (userId: string): Promise<BudgetCategory[]> => {
    try {
        const categoriesRef = getUserCollection(userId, 'budgetCategories');
        const q = query(categoriesRef, orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as BudgetCategory[];
    } catch (error) {
        console.error('Error getting budget categories:', error);
        throw error;
    }
};

export const subscribeToBudgetCategories = (
    userId: string,
    callback: (categories: BudgetCategory[]) => void
): Unsubscribe => {
    const categoriesRef = getUserCollection(userId, 'budgetCategories');
    const q = query(categoriesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as BudgetCategory[];
        callback(categories);
    });
};

// ==================== USER SETTINGS ====================

export const saveUserSettings = async (userId: string, settings: Omit<UserSettings, 'updatedAt'>) => {
    try {
        const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
        await setDoc(settingsRef, {
            ...settings,
            updatedAt: Timestamp.now()
        }, { merge: true });
    } catch (error) {
        console.error('Error saving user settings:', error);
        throw error;
    }
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
    try {
        const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
        const snapshot = await getDoc(settingsRef);

        if (snapshot.exists()) {
            return {
                ...snapshot.data(),
                updatedAt: snapshot.data().updatedAt?.toDate() || new Date()
            } as UserSettings;
        }

        return null;
    } catch (error) {
        console.error('Error getting user settings:', error);
        throw error;
    }
};

export const subscribeToUserSettings = (
    userId: string,
    callback: (settings: UserSettings | null) => void
): Unsubscribe => {
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');

    return onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            const settings = {
                ...snapshot.data(),
                updatedAt: snapshot.data().updatedAt?.toDate() || new Date()
            } as UserSettings;
            callback(settings);
        } else {
            callback(null);
        }
    });
};

// ==================== QUICK TASKS ====================

export interface QuickTask {
    id: string;
    text: string;
    checked: boolean;
    category?: string;
    color?: string;
    createdAt: Date;
}

export const addQuickTask = async (userId: string, task: Omit<QuickTask, 'id' | 'createdAt'>) => {
    try {
        const tasksRef = getUserCollection(userId, 'quickTasks');
        const docRef = await addDoc(tasksRef, {
            ...task,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding quick task:', error);
        throw error;
    }
};

export const updateQuickTask = async (userId: string, taskId: string, data: Partial<QuickTask>) => {
    try {
        const taskRef = doc(db, 'users', userId, 'quickTasks', taskId);
        await updateDoc(taskRef, data);
    } catch (error) {
        console.error('Error updating quick task:', error);
        throw error;
    }
};

export const deleteQuickTask = async (userId: string, taskId: string) => {
    try {
        const taskRef = doc(db, 'users', userId, 'quickTasks', taskId);
        await deleteDoc(taskRef);
    } catch (error) {
        console.error('Error deleting quick task:', error);
        throw error;
    }
};

export const subscribeToQuickTasks = (
    userId: string,
    callback: (tasks: QuickTask[]) => void
): Unsubscribe => {
    const tasksRef = getUserCollection(userId, 'quickTasks');
    const q = query(tasksRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as QuickTask[];
        callback(tasks);
    });
};

// ==================== REMINDERS ====================

export interface Reminder {
    id: string;
    title: string;
    time: string;
    icon: string;
    color: string;
    createdAt: Date;
}

export const addReminder = async (userId: string, reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    try {
        const remindersRef = getUserCollection(userId, 'reminders');
        const docRef = await addDoc(remindersRef, {
            ...reminder,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding reminder:', error);
        throw error;
    }
};

export const updateReminder = async (userId: string, reminderId: string, data: Partial<Reminder>) => {
    try {
        const reminderRef = doc(db, 'users', userId, 'reminders', reminderId);
        await updateDoc(reminderRef, data);
    } catch (error) {
        console.error('Error updating reminder:', error);
        throw error;
    }
};

export const deleteReminder = async (userId: string, reminderId: string) => {
    try {
        const reminderRef = doc(db, 'users', userId, 'reminders', reminderId);
        await deleteDoc(reminderRef);
    } catch (error) {
        console.error('Error deleting reminder:', error);
        throw error;
    }
};

export const subscribeToReminders = (
    userId: string,
    callback: (reminders: Reminder[]) => void
): Unsubscribe => {
    const remindersRef = getUserCollection(userId, 'reminders');
    const q = query(remindersRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const reminders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Reminder[];
        callback(reminders);
    });
};

// ==================== DATA MIGRATION ====================

export const migrateFromLocalStorage = async (userId: string) => {
    try {
        console.log('Starting data migration from localStorage...');

        // Migrate transactions
        const localTransactions = localStorage.getItem('transactions');
        if (localTransactions) {
            const transactions = JSON.parse(localTransactions);
            for (const transaction of transactions) {
                const { id, ...data } = transaction;
                await addTransaction(userId, data);
            }
            console.log(`Migrated ${transactions.length} transactions`);
        }

        // Migrate budget categories
        const localCategories = localStorage.getItem('budgetCategories');
        if (localCategories) {
            const categories = JSON.parse(localCategories);
            for (const category of categories) {
                const { id, ...data } = category;
                await addBudgetCategory(userId, data);
            }
            console.log(`Migrated ${categories.length} budget categories`);
        }

        // Migrate settings
        const monthlyBudgetLimit = localStorage.getItem('monthlyBudgetLimit');
        const savingsGoal = localStorage.getItem('savingsGoal');
        if (monthlyBudgetLimit || savingsGoal) {
            await saveUserSettings(userId, {
                monthlyBudgetLimit: monthlyBudgetLimit ? parseFloat(monthlyBudgetLimit) : 5000,
                savingsGoal: savingsGoal ? parseFloat(savingsGoal) : 0
            });
            console.log('Migrated user settings');
        }

        // Set migration flag in Firestore (not localStorage)
        const migrationRef = doc(db, 'users', userId, 'settings', 'migration');
        await setDoc(migrationRef, {
            migrated: true,
            migratedAt: Timestamp.now()
        });

        // Clear localStorage after successful migration
        localStorage.removeItem('transactions');
        localStorage.removeItem('budgetCategories');
        localStorage.removeItem('monthlyBudgetLimit');
        localStorage.removeItem('savingsGoal');
        localStorage.removeItem('dataMigrated'); // Remove old flag

        console.log('Data migration completed successfully');
    } catch (error) {
        console.error('Error during data migration:', error);
        throw error;
    }
};

// Check if migration is needed (check Firestore, not localStorage)
export const needsMigration = async (userId: string): Promise<boolean> => {
    try {
        // Check if migration flag exists in Firestore
        const migrationRef = doc(db, 'users', userId, 'settings', 'migration');
        const migrationDoc = await getDoc(migrationRef);

        if (migrationDoc.exists()) {
            // Already migrated
            return false;
        }

        // Check if there's local data to migrate
        const hasLocalData = !!(
            localStorage.getItem('transactions') ||
            localStorage.getItem('budgetCategories') ||
            localStorage.getItem('monthlyBudgetLimit') ||
            localStorage.getItem('savingsGoal')
        );

        return hasLocalData;
    } catch (error) {
        console.error('Error checking migration status:', error);
        return false;
    }
};

