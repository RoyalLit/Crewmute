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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const progress = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, {
      damping: 18,
      stiffness: 150,
      mass: 0.8,
    });
  }, [isFocused]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    // Expand the flex weight of the active tab so it takes more horizontal space
    const flexVal = 1 + progress.value * 1.5;

    const activeBgColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
    const bgColor = interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', activeBgColor]
    );

    return {
      flex: flexVal,
      backgroundColor: bgColor,
      borderRadius: 100,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      // Animate width to expand/collapse the text smoothly
      width: progress.value * 50,
      marginLeft: progress.value * 6,
    };
  });

  const iconName = isFocused ? config.icon.active : config.icon.inactive;
  const iconSize = config.iconSize ?? 22;
  const inactiveColor = colors.text.placeholder;
  
  // Use theme text color for active state to look sleek
  const activeColor = colors.text.primary;
  const iconColor = isFocused ? activeColor : inactiveColor;

  return (
    <AnimatedPressable
      onPress={() => {
        if (!isFocused && navigation) {
          navigation.navigate(route.name);
        }
      }}
      style={[tabStyles.tabPressable, animatedContainerStyle]}
      accessibilityLabel={config.accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
    >
      <View style={tabStyles.tabItemCore}>
        <Ionicons name={iconName as IoniconsName} size={iconSize} color={iconColor} />
        <Animated.View style={[{ overflow: 'hidden' }, animatedTextStyle]}>
          <Text style={[tabStyles.tabLabelText, { color: activeColor }]} numberOfLines={1}>
            {config.title}
          </Text>
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

// ─── Custom Floating Navbar ───────────────────────────────────

function CustomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const routes = props.state?.routes ?? [];

  return (
    <View
      style={[
        tabStyles.containerWrapper,
        { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 20 },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          tabStyles.floatingPill,
          {
            backgroundColor: isDark ? '#1C1C2E' : '#FFFFFF',
            shadowColor: isDark ? '#000' : colors.text.secondary,
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
    </View>
  );
}

// ─── Layout ────────────────────────────────────────────────────

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
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
    width: '90%',
    maxWidth: 400,
    // Soft shadow for the floating effect
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
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
  },
  tabLabelText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
