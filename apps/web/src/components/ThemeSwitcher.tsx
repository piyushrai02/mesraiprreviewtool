/**
 * Theme Switcher Component
 * @fileoverview Toggle button for switching between light and dark themes
 */

'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './providers/ThemeProvider';
import { useEffect, useState } from 'react';

/**
 * Professional theme toggle button
 * Switches between light and dark modes with smooth transitions
 */
export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
        <div className="h-5 w-5" />
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}