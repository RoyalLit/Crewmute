/**
 * Root Expo Router layout.
 *
 * Responsibilities (in order):
 *   1. Load Plus Jakarta Sans fonts (DESIGN.md §3.1)
 *   2. Provide QueryClientProvider (TanStack Query)
 *   3. Provide ThemeProvider (Zustand + Appearance)
 *   4. Auth guard: redirect to (auth) or (tabs) based on stored token
 *
 * Auth guard is a structure stub — actual token validation logic
 * will be wired in the auth feature PR. The guard currently always
 * redirects to (tabs) in development.
 *
 * Per AGENT_RULES.md §8.7: "No data fetching in screen components."
 * The layout handles the auth check; screens render UI only.
 */

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { ThemeProvider } from '../src/design/theme';
import { queryClient } from '../src/lib/queryClient';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen once fonts are ready (or failed to load)
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Keep rendering null until fonts are loaded — avoids FOUT
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/*
         * Stack navigator with two groups:
         *   (auth) — login, register, OTP screens (no tab bar)
         *   (tabs) — main app with tab bar
         *
         * TODO(feature/auth): add auth guard logic here.
         * The guard should check storage.getAccessToken() and redirect:
         *   - No token → Redirect to (auth)
         *   - Valid token → Redirect to (tabs)
         */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
