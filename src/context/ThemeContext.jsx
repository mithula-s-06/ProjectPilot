import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 1. Check if there's a user override preference
    const userPref = localStorage.getItem('userThemePreference');
    if (userPref) return userPref;
    
    // 2. Check if there's a platform default set by the admin
    const platformDefault = localStorage.getItem('platformThemeDefault');
    if (platformDefault) return platformDefault;

    // 3. Fallback to normal saved theme or light mode
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('userThemePreference', newTheme);
  };

  const setPlatformThemeDefault = (newDefault) => {
    const normalizedDefault = newDefault.toLowerCase(); // 'light' or 'dark'
    localStorage.setItem('platformThemeDefault', normalizedDefault);
    // Overwrite active user preference to align all sessions to new admin default
    localStorage.removeItem('userThemePreference');
    setTheme(normalizedDefault);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setPlatformThemeDefault }}>
      {children}
    </ThemeContext.Provider>
  );
};
