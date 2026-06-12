/**
 * Theme context and useTheme hook.
 *
 * Provides the current resolved color tokens based on the user's theme
 * preference (system / light / dark).
 *
 * Architecture per DESIGN.md §9.1:
 *   "Themes are implemented using React Context + Zustand."
 *
 * The themeStore (Zustand) holds the user preference.
 * The ThemeProvider resolves it against the system appearance.
 * The useTheme() hook gives components access to the current colors.
 *
 * Usage in a component:
 *   const { colors, isDark } = useTheme();
 *   <View style={{ backgroundColor: colors.background.primary }} />
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

import { useThemeStore } from '../store/themeStore';
import { darkColors, lightColors } from './tokens';

export interface ColorTokens {
  background: { primary: string; card: string; subtle: string };
  text: { primary: string; secondary: string; placeholder: string };
  border: { default: string };
  interactive: { primary: string; primaryText: string };
  status: {
    activeBackground: string; activeText: string;
    pendingBackground: string; pendingText: string;
    acceptedBackground: string; acceptedText: string;
    rejectedBackground: string; rejectedText: string;
    fullBackground: string; fullText: string;
    expiredBackground: string; expiredText: string;
    cancelledBackground: string; cancelledText: string;
  };
}

interface ThemeContextValue {
  colors: ColorTokens;
  isDark: boolean;
  colorScheme: ColorSchemeName;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const preference = useThemeStore((state) => state.preference);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Listen for system appearance changes (e.g. user changes device setting)
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  // Resolve final color scheme:
  //   'system' → follow systemScheme
  //   'light' / 'dark' → override regardless of system
  const resolvedScheme: ColorSchemeName =
    preference === 'system' ? systemScheme : preference;

  const isDark = resolvedScheme === 'dark';
  const colors: ColorTokens = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, colorScheme: resolvedScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Access the current theme colors and mode.
 * Must be used inside ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
