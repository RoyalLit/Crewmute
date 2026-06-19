import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform, Alert as NativeAlert } from 'react-native';
import { useTheme } from '../design/theme';
import { spacing } from '../design/tokens';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertData {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

type AlertListener = (data: AlertData) => void;
let showListener: AlertListener | null = null;

export class Alert {
  static alert(title: string, message?: string, buttons?: AlertButton[]) {
    if (Platform.OS === 'ios') {
      NativeAlert.alert(title, message, buttons);
    } else {
      if (showListener) {
        showListener({ title, message, buttons });
      } else {
        // Fallback if the component is not mounted
        NativeAlert.alert(title, message, buttons);
      }
    }
  }
}

export function GlobalAlert() {
  const { colors, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<AlertData | null>(null);

  useEffect(() => {
    showListener = (alertData: AlertData) => {
      setData(alertData);
      setVisible(true);
    };
    return () => {
      showListener = null;
    };
  }, []);

  if (Platform.OS === 'ios') return null;

  const close = () => setVisible(false);

  const handlePress = (onPress?: () => void) => {
    close();
    if (onPress) {
      setTimeout(onPress, 100);
    }
  };

  const defaultButtons: AlertButton[] = [{ text: 'OK', style: 'default' }];
  const buttons = data?.buttons?.length ? data.buttons : defaultButtons;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.background.card }]}>
          {data?.title && <Text style={[styles.title, { color: colors.text.primary }]}>{data.title}</Text>}
          {data?.message && <Text style={[styles.message, { color: colors.text.secondary }]}>{data.message}</Text>}
          
          <View style={styles.buttonContainer}>
            {buttons.map((btn, idx) => (
              <Pressable
                key={idx}
                android_ripple={{ color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                style={styles.button}
                onPress={() => handlePress(btn.onPress)}
              >
                <Text style={[
                  styles.buttonText, 
                  { 
                    color: btn.style === 'destructive' 
                      ? colors.status.rejectedText 
                      : (btn.style === 'cancel' ? colors.text.secondary : colors.interactive.primary)
                  }
                ]}>
                  {btn.text?.toUpperCase() || 'OK'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: spacing.xl,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  title: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
});
