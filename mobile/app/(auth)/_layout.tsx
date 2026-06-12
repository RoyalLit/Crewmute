/**
 * Auth group layout.
 *
 * Wraps all screens in the (auth) route group:
 *   - login
 *   - register
 *   - verify-otp
 *   - profile-setup (first-time)
 *
 * No tab bar. Simple stack navigator.
 * Screens are added as individual files in this directory when
 * the auth feature PR is implemented.
 */

import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Slide in from the right on iOS, fade on Android
        animation: 'slide_from_right',
      }}
    />
  );
}
