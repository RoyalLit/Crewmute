/**
 * Tab bar layout — Floating Animated Pill Navbar
 *
 * Implements an island-style floating tab bar with a cool expanding animation
 * for the active tab (showing both icon and text in a pill).
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { useTheme } from '../../src/design/theme';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// ─── Tab configuration ────────────────────────────────────────

interface TabConfig {
  name: string;
  title: string;
  icon: { active: string; inactive: string };
  iconSize?: number;
  accessibilityLabel: string;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    name: 'index',
    title: 'Home',
    icon: { active: 'home', inactive: 'home-outline' },
    accessibilityLabel: 'Explore tab — browse available rides',
  },
  {
    name: 'post',
    title: 'Post',
    icon: { active: 'add-circle', inactive: 'add-circle-outline' },
    accessibilityLabel: 'Post a ride tab',
  },
  {
    name: 'rides',
    title: 'Rides',
    icon: { active: 'car', inactive: 'car-outline' },
    accessibilityLabel: 'My rides tab — rides you posted or joined',
  },
  {
    name: 'chats',
    title: 'Chats',
    icon: { active: 'chatbubble', inactive: 'chatbubble-outline' },
    accessibilityLabel: 'Chats tab — your active conversations',
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: { active: 'person', inactive: 'person-outline' },
    accessibilityLabel: 'Profile tab — your account and settings',
  },
];

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Animated Tab Item ─────────────────────────────────────────

function AnimatedTabItem({
  isFocused,
  route,
  navigation,
  config,
  colors,
  isDark,
}: {
  isFocused: boolean;
  route: any;
  navigation: any;
  config: TabConfig;
  colors: any;
  isDark: boolean;
}) {
  // Use a local derived value that smoothly transitions between 0 (inactive) and 1 (active)
  // This prevents the "overshoot" width issues caused by Math.abs(sharedIndex - myIndex)
  const progress = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
      mass: 0.6,
    });
  }, [isFocused]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    // 50px inactive width, 110px active width
    const w = 50 + progress.value * 60;

    const activeBgColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
    const bgColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(0,0,0,0)', activeBgColor]
    );

    return {
      width: w,
      backgroundColor: bgColor,
      borderRadius: 100,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      width: progress.value * 50,
      marginLeft: progress.value * 6,
    };
  });

  const iconName = isFocused ? config.icon.active : config.icon.inactive;
  const iconSize = config.iconSize ?? 22;
  const inactiveColor = colors.text.placeholder;
  
  const activeColor = colors.text.primary;
  const iconColor = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={() => {
        if (!isFocused && navigation) {
          navigation.navigate(route.name);
        }
      }}
      style={tabStyles.tabPressable}
      accessibilityLabel={config.accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[tabStyles.tabItemCore, animatedContainerStyle]}>
        <Ionicons name={iconName as IoniconsName} size={iconSize} color={iconColor} />
        <Animated.View style={[{ overflow: 'hidden' }, animatedTextStyle]}>
          <Text style={[tabStyles.tabLabelText, { color: activeColor }]} numberOfLines={1}>
            {config.title}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Custom Floating Navbar ───────────────────────────────────

function CustomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const routes = props.state?.routes ?? [];

  const innerContent = (
    <View
      style={[
        tabStyles.floatingPill,
        Platform.OS !== 'ios' && {
          backgroundColor: isDark ? '#1C1C2E' : '#FFFFFF',
          elevation: 10,
        },
      ]}
    >
      {routes.map((route: any, index: number) => {
        const isFocused = (props.state?.index ?? 0) === index;
        const config = TAB_CONFIGS[index];
        if (!config) return null;

        return (
          <AnimatedTabItem
            key={route.key}
            isFocused={isFocused}
            route={route}
            navigation={props.navigation}
            config={config}
            colors={colors}
            isDark={isDark}
          />
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        tabStyles.containerWrapper,
        { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 20 },
      ]}
      pointerEvents="box-none"
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={tabStyles.blurContainer}
        >
          {innerContent}
        </BlurView>
      ) : (
        innerContent
      )}
    </View>
  );
}

// ─── Layout ────────────────────────────────────────────────────

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      // NEVER pass tabBar={CustomTabBar} directly, as it causes Invalid Hook Call errors
      // if React Navigation invokes it as a plain function instead of a component.
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="post" />
      <Tabs.Screen name="rides" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// ─── Styles ────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  containerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  floatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 100,
    alignSelf: 'center', // Hugs the constant 310px total width exactly!
  },
  blurContainer: {
    borderRadius: 100,
    overflow: 'hidden',
    // Soft shadow for the floating effect
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  tabPressable: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemCore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabelText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
