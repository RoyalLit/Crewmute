/**
 * Tab bar layout — the most platform-sensitive file in the mobile app.
 *
 * Implements the exact BlurView pattern from DESIGN.md §5.5:
 *   iOS  → BlurView (intensity 60, systemChromeMaterial) — Liquid Glass effect
 *   Android → semi-opaque solid View — no BlurView (perf on mid-range devices)
 *
 * Both platforms:
 *   - Height: TAB_BAR_HEIGHT (64px) + safe area bottom inset
 *   - useSafeAreaInsets() for home indicator padding
 *
 * Per PRD.md §8.1:
 *   "BlurView must not be rendered on Android — gated with Platform.OS === 'ios'.
 *    Android solid fallback must not cause jank."
 *
 * Per DESIGN.md §5.5:
 *   Tab bar background is NOT a theme token — it is transparent on iOS
 *   (BlurView handles it) and a hardcoded rgba value per mode on Android.
 *
 * Tab configuration per DESIGN.md §5.5:
 *   1. Explore (compass)
 *   2. Post (add-circle) — center tab, slightly larger icon
 *   3. My Rides (car)
 *   4. Chats (chatbubble)
 *   5. Profile (person)
 */

import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, brandColors } from '../../src/design/tokens';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IoniconName;
  focused: boolean;
  size?: number;
}

function TabIcon({ name, focused, size = 24 }: TabIconProps): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Ionicons
      name={name}
      size={size}
      color={focused ? colors.interactive.primary : colors.text.placeholder}
      accessibilityRole="image"
    />
  );
}

export default function TabsLayout(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  // Android solid background per DESIGN.md §5.5
  // Never a theme token — hardcoded rgba per mode as specified
  const androidBackground = isDark
    ? 'rgba(15,15,26,0.94)'
    : 'rgba(247,247,252,0.94)';

  const androidBorderColor = colors.border.default;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarActiveTintColor: colors.interactive.primary,
        tabBarInactiveTintColor: colors.text.placeholder,
        tabBarStyle: {
          position: 'absolute',
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          // Background is handled by the tabBarBackground component below
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        // Platform-aware tab bar background — the key pattern from DESIGN.md §5.5
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            // iOS: Liquid Glass blur — BlurView handles background
            // Content scrolls and refracts beneath it
            <BlurView
              intensity={60}
              tint="systemChromeMaterial"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            // Android: solid semi-opaque View — no BlurView
            // Per PRD §8.1: "No BlurView code path executes on Android"
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: androidBackground,
                  borderTopWidth: 1,
                  borderTopColor: androidBorderColor,
                },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'compass' : 'compass-outline'} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Explore tab — browse available rides',
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ focused }) => (
            // Center tab: slightly larger icon (28px) per DESIGN.md §8.2
            <TabIcon
              name={focused ? 'add-circle' : 'add-circle-outline'}
              focused={focused}
              size={28}
            />
          ),
          tabBarActiveTintColor: brandColors.electricViolet,
          tabBarAccessibilityLabel: 'Post a ride tab',
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: 'My Rides',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'car' : 'car-outline'} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'My rides tab — rides you posted or joined',
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'chatbubble' : 'chatbubble-outline'}
              focused={focused}
            />
          ),
          tabBarAccessibilityLabel: 'Chats tab — your active conversations',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Profile tab — your account and settings',
        }}
      />
    </Tabs>
  );
}
