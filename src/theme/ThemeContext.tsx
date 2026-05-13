import React, { createContext, useContext, useMemo } from 'react';
import { ThemeColors, lightColors, darkColors } from './index';
export type { ThemeColors };
import { useThemeStore } from '../store/themeStore';

// ─── Context ─────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  toggle: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { isDark, toggle } = useThemeStore();

  const value = useMemo<ThemeContextValue>(() => ({
    colors: isDark ? darkColors : lightColors,
    isDark,
    toggle,
  }), [isDark, toggle]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Full theme context — colors, isDark, toggle */
export const useTheme = () => useContext(ThemeContext);

/** Just the colors — the most common usage */
export const useThemeColors = (): ThemeColors => useContext(ThemeContext).colors;
