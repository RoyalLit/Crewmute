/**
 * Theme preference store (Zustand).
 *
 * Stores the user's theme preference: 'system' | 'light' | 'dark'.
 * Persisted to AsyncStorage under key 'crewmute:theme' per DESIGN.md §9.2.
 *
 * This is one of the three items that legitimately belong in global state
 * "Global state must contain: auth session,
 * theme preference, global notification queue only."
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

// Note: 150ms opacity transition on theme change is handled in the component layer (DESIGN.md §9.2)
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // Default to system preference per DESIGN.md §9.2
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'crewmute:theme', // AsyncStorage key — DESIGN.md §9.2
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
