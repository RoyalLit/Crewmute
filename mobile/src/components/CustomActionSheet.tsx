import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated, Dimensions, Platform, ActionSheetIOS } from 'react-native';
import { useTheme } from '../design/theme';
import { spacing } from '../design/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ActionSheetOption {
  label: string;
  isDestructive?: boolean;
  onPress: () => void;
}

interface CustomActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  title?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function CustomActionSheet({ visible, onClose, options, title }: CustomActionSheetProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [translateY] = React.useState(new Animated.Value(SCREEN_HEIGHT));

  // --- iOS Native Action Sheet ---
  React.useEffect(() => {
    if (Platform.OS === 'ios' && visible) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          options: [...options.map(o => o.label), 'Cancel'],
          cancelButtonIndex: options.length,
          destructiveButtonIndex: options.findIndex(o => o.isDestructive),
        },
        (buttonIndex) => {
          onClose();
          if (buttonIndex < options.length) {
            options[buttonIndex].onPress();
          }
        }
      );
    }
  }, [visible, options, title, onClose]);

  // --- Android Premium Bottom Sheet Animations ---
  React.useEffect(() => {
    if (Platform.OS !== 'ios') {
      if (visible) {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
          speed: 14
        }).start();
      } else {
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [visible, translateY]);

  // On iOS, the native action sheet is triggered imperatively, so we render nothing.
  if (Platform.OS === 'ios') return null;

  // On Android, we render a custom premium bottom sheet
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.sheetAndroid, 
            { 
              backgroundColor: colors.background.card,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={styles.dragHandle} />
          
          {title && (
            <View style={styles.titleContainerAndroid}>
              <Text style={[styles.titleTextAndroid, { color: colors.text.secondary }]}>{title}</Text>
            </View>
          )}

          {options.map((option, index) => (
            <Pressable
              key={index}
              android_ripple={{ color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              style={styles.optionButtonAndroid}
              onPress={() => {
                onClose();
                setTimeout(() => option.onPress(), 150);
              }}
            >
              <Text style={[
                styles.optionTextAndroid, 
                { color: option.isDestructive ? colors.status.rejectedText : colors.text.primary }
              ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}

          {/* Explicit Cancel Button for Android */}
          <Pressable
            android_ripple={{ color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            style={styles.optionButtonAndroid}
            onPress={onClose}
          >
            <Text style={[styles.optionTextAndroid, { color: colors.text.secondary }]}>
              Cancel
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetAndroid: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  titleContainerAndroid: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  titleTextAndroid: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  optionButtonAndroid: {
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTextAndroid: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 17,
  },
});
