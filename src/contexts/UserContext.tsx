import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
    userName: string;
    userEmail: string;
    setUserName: (name: string) => void;
    setUserEmail: (email: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [userName, setUserName] = useState('John Doe');
    const [userEmail, setUserEmail] = useState('john.doe@example.com');

    return (
        <UserContext.Provider value={{ userName, userEmail, setUserName, setUserEmail }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
