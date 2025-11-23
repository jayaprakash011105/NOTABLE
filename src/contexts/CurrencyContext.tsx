import React, { createContext, useContext, useState } from 'react';

export interface Currency {
    code: string;
    symbol: string;
    rate: number;
}

const currencies: Record<string, Currency> = {
    USD: { code: 'USD', symbol: '$', rate: 1 },
    EUR: { code: 'EUR', symbol: '€', rate: 0.85 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.73 },
    INR: { code: 'INR', symbol: '₹', rate: 83 },
};

interface CurrencyContextType {
    currency: Currency;
    changeCurrency: (code: string) => void;
    formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<Currency>(() => {
        const saved = localStorage.getItem('currency');
        return saved && currencies[saved] ? currencies[saved] : currencies.USD;
    });

    const changeCurrency = (code: string) => {
        if (currencies[code]) {
            setCurrency(currencies[code]);
            localStorage.setItem('currency', code);
        }
    };

    const formatAmount = (amount: number): string => {
        const converted = amount * currency.rate;
        return `${currency.symbol}${Math.round(converted)}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, changeCurrency, formatAmount }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
    return context;
};

export { currencies };
