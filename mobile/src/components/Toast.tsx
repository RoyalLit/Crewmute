import { View, Text, StyleSheet, Platform, DeviceEventEmitter, Animated } from 'react-native';
import { useTheme } from '../design/theme';
import { spacing } from '../design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import React, { useState, useEffect, useRef } from 'react';

export interface ToastData {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

const TOAST_EVENT = 'SHOW_GLOBAL_TOAST';

export class Toast {
  static show(options: ToastData) {
    DeviceEventEmitter.emit(TOAST_EVENT, options);
  }
}

export function ToastProvider() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<ToastData | null>(null);
  
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(TOAST_EVENT, (toastData: ToastData) => {
      setData(toastData);
      
      if (Platform.OS !== 'web') {
        if (toastData.type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (toastData.type === 'error') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (data) {
      const duration = data.duration || 3000;
      
      opacity.setValue(0);
      translateY.setValue(-100);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 12,
          stiffness: 150
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
      
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          })
        ]).start(({ finished }) => {
          if (finished) setData(null);
        });
      }, duration);

      return () => clearTimeout(timeout);
    } else {
      opacity.setValue(0);
      translateY.setValue(-100);
    }
    return undefined;
  }, [data]);

  const isSuccess = data?.type === 'success';
  const isError = data?.type === 'error';
  // Use vibrant brand colors so white text is readable, rather than the subtle status badge backgrounds
  const backgroundColor = isError ? '#FF6B6B' : (isSuccess ? '#20B2AA' : colors.background.card);
  const iconName = isError ? 'alert-circle' : (isSuccess ? 'checkmark-circle' : 'information-circle');
  // If we are using the card background (info), adapt text color to theme
  const textColor = (!isError && !isSuccess) ? colors.text.primary : '#FFFFFF';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          top: Math.max(insets.top + 10, 50),
          backgroundColor,
        }
      ]}
      pointerEvents="none"
    >
      <Ionicons name={iconName} size={24} color={textColor} />
      <View style={styles.textContainer}>
        {!!data?.title && (
          <Text style={[styles.title, { color: textColor }]}>{data.title}</Text>
        )}
        <Text style={[styles.message, { color: textColor }]}>{data?.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    elevation: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  textContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  title: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 13,
  },
});
