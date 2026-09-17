import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const userPref = localStorage.getItem('canteen_theme_pref');
      if (userPref === 'light' || userPref === 'dark') {
        return userPref;
      }
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('canteen_theme_pref', nextTheme);
        localStorage.setItem('canteen_theme', nextTheme);
      } catch (e) {
        console.error(e);
      }
      return nextTheme;
    });
  };

  const setTheme = (val) => {
    const nextTheme = val === 'dark' ? 'dark' : 'light';
    try {
      localStorage.setItem('canteen_theme_pref', nextTheme);
      localStorage.setItem('canteen_theme', nextTheme);
    } catch (e) {
      console.error(e);
    }
    setThemeState(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

