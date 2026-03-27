import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Theme color palette (Light mode only)
    const colors = {
        background: '#f5f5f5',
        cardBg: '#ffffff',
        cardBorder: 'rgba(0,0,0,0.12)',
        primary: '#EE791A',
        text: '#000000',
        textSecondary: 'rgba(0,0,0,0.6)',
        inputBg: '#ffffff',
        divider: 'rgba(0,0,0,0.12)',
        hover: 'rgba(0,0,0,0.04)',
        error: '#d32f2f',
        warning: '#ed6c02',
        success: '#2e7d32',
    };

    return <ThemeContext.Provider value={{ colors }}>{children}</ThemeContext.Provider>;
};
