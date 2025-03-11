import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  // Get theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  
  // Check for system dark mode preference
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set up system theme preference listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (localStorage.getItem('theme') === 'auto') {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Initialize theme if set to auto
    if (theme === 'auto') {
      setTheme(prefersDarkMode ? 'dark' : 'light');
    }
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [prefersDarkMode]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };
  
  // Set theme directly
  const setThemePreference = (preference) => {
    localStorage.setItem('theme', preference);
    
    if (preference === 'auto') {
      const systemTheme = prefersDarkMode ? 'dark' : 'light';
      setTheme(systemTheme);
    } else {
      setTheme(preference);
    }
  };

  // Apply theme to document when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;