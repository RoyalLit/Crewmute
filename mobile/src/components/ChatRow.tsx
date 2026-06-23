import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { spacing, brandColors } from '../design/tokens';
import { Avatar } from './Avatar';
import { typography } from '../design/typography';

interface ChatRowProps {
  id: string;
  name: string;
  imageUrl?: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  onDelete?: (id: string) => void;
  onPress?: () => void;
}

export const ChatRow = React.memo(function ChatRow({ id, name, imageUrl, lastMessage, time, unreadCount = 0, onDelete, onPress }: ChatRowProps) {
  const { colors } = useTheme();

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteActionContainer}>
        <Animated.View style={[styles.deleteAction, { transform: [{ scale }] }]}>
          <Pressable style={styles.deleteButton} onPress={() => onDelete?.(id)} accessible accessibilityRole="button" accessibilityLabel={`Delete chat with ${name}`}>
            <Ionicons name="trash" size={24} color={colors.background.card} />
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={onDelete ? renderRightActions : undefined} rightThreshold={40}>
      <Pressable style={[styles.container, { backgroundColor: colors.background.primary }]} onPress={onPress} accessible accessibilityRole="button" accessibilityLabel={`Chat with ${name}`}>
        <View style={styles.avatarContainer}>
          <Avatar size="md" name={name} imageUrl={imageUrl} />
          {unreadCount > 0 && (
            <View style={styles.unreadDotContainer}>
              <View style={[styles.unreadDot, { borderColor: colors.background.card }]} />
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.timeText, { color: unreadCount > 0 ? brandColors.electricViolet : colors.text.placeholder }]}>{time}</Text>
          </View>
          <Text style={[styles.messageText, { color: unreadCount > 0 ? colors.text.primary : colors.text.secondary, fontFamily: unreadCount > 0 ? 'PlusJakartaSans-700Bold' : 'PlusJakartaSans-500Medium' }]} numberOfLines={2}>
            {lastMessage}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  unreadDotContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: 2,
    borderRadius: 10,
  },
  unreadDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: brandColors.electricViolet,
    borderWidth: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  nameText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: typography.bodyLarge.fontSize,
    flex: 1,
    marginRight: spacing.sm,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: typography.label.fontSize,
  },
  messageText: {
    fontSize: typography.body.fontSize,
    lineHeight: 20,
  },
  deleteActionContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: brandColors.coralPink,
  },
  deleteAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
