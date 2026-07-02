import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full border border-brand-border bg-brand-card/30 backdrop-blur-sm text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300 focus:outline-none hover:shadow-glow-primary hover:border-primary/50 relative overflow-hidden ${className}`}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <FiSun className={`w-5 h-5 text-primary absolute transition-all duration-300 transform ${
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        }`} />
        <FiMoon className={`w-5 h-5 text-secondary absolute transition-all duration-300 transform ${
          theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`} />
      </div>
    </button>
  );
};

export default ThemeToggle;
