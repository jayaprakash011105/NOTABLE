import React, { createContext, useContext, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            welcome: 'Welcome',
            totalBalance: 'Total balance',
            month: 'Month',
            income: 'Income',
            expense: 'Expense',
            overallInsights: 'Overall Insights',
            reminder: 'Reminder',
            yourMeetingWith: 'Your meeting with {{name}} is scheduled on {{date}} at {{time}}.',
            remindIn: 'Remind in {{time}} mins',
            week: 'Week',
            home: 'Home',
            doExercise: 'Do exercise',
            drinkWater: 'Drink water',
            food: 'Food',
            december: 'December',
        }
    },
    es: {
        translation: {
            welcome: 'Bienvenido',
            totalBalance: 'Saldo total',
            month: 'Mes',
            income: 'Ingreso',
            expense: 'Gasto',
            overallInsights: 'Resumen General',
            reminder: 'Recordatorio',
            yourMeetingWith: 'Tu reunión con {{name}} está programada el {{date}} a las {{time}}.',
            remindIn: 'Recordar en {{time}} mins',
            week: 'Semana',
            home: 'Inicio',
            doExercise: 'Hacer ejercicio',
            drinkWater: 'Beber agua',
            food: 'Comida',
            december: 'Diciembre',
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('language') || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

interface LanguageContextType {
    language: string;
    changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
        setLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};

export { i18n };
