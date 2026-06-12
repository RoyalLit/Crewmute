/**
 * useColorScheme — wraps Appearance API and respects user theme preference.
 *
 * Use this instead of React Native's useColorScheme directly.
 * It reads from the Zustand themeStore so user overrides are respected.
 *
 * This is a shared hook because it is used by multiple features
 * (any component that needs to conditionally apply platform or theme logic).
 */

import { useThemeStore } from '../store/themeStore';
import { useTheme } from '../design/theme';

export function useColorScheme(): 'light' | 'dark' {
  const { isDark } = useTheme();
  return isDark ? 'dark' : 'light';
}

export function useThemePreference() {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  return { preference, setPreference };
}
