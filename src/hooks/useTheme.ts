import { useEffect, useState } from 'react';
import { themeStorage } from '../utils/storage';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => themeStorage.get());

  const resolvedTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  useEffect(() => {
    const root = document.documentElement;
    const resolved = resolvedTheme();
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    themeStorage.set(t);
    setThemeState(t);
  };

  return { theme, setTheme, resolvedTheme: resolvedTheme() };
}
