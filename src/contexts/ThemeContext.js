import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Get theme from localStorage, default to 'light'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('aegistnet-theme');
        return savedTheme || 'light';
    });

    // Save theme to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('aegistnet-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Theme color palettes
    const themes = {
        light: {
            background: '#f5f5f5',
            cardBg: '#ffffff',
            cardBorder: 'rgba(0,0,0,0.12)',
            primary: '#2563EB',
            text: '#000000',
            textSecondary: 'rgba(0,0,0,0.6)',
            inputBg: '#ffffff',
            divider: 'rgba(0,0,0,0.12)',
            hover: 'rgba(0,0,0,0.04)',
            error: '#d32f2f',
            warning: '#ed6c02',
            success: '#2e7d32',
        },
        dark: {
            background: '#000',
            cardBg: '#0b0b0b',
            cardBorder: 'rgba(255,255,255,0.04)',
            primary: '#2563EB',
            text: '#ffffff',
            textSecondary: 'rgba(255,255,255,0.7)',
            inputBg: '#0f0f0f',
            divider: 'rgba(255,255,255,0.04)',
            hover: 'rgba(255,255,255,0.04)',
            error: '#f44336',
            warning: '#ffa726',
            success: '#66bb6a',
        },
    };

    const value = {
        theme,
        toggleTheme,
        colors: themes[theme],
        isDark: theme === 'dark',
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
