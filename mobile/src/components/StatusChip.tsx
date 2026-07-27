import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../design/theme';
import { brandColors } from '../design/tokens';
import { typography } from '../design/typography';

export type RideStatus =
  | 'Active'
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Full'
  | 'Expired'
  | 'Cancelled'
  | 'Completed'
  | 'In Progress'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'full';

function hexToRGBA(hex: string, alpha: number) {
  if (!hex || hex.length < 7) return 'rgba(0,0,0,0.1)';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface StatusChipProps {
  status?: RideStatus | null;
}

export function StatusChip({ status }: StatusChipProps) {
  const { colors } = useTheme();

  if (!status) return null;

  const normalizedStatus = status.toLowerCase();
  let label = status as string;
  let textColor = colors.text.placeholder;

  if (normalizedStatus === 'active' || normalizedStatus === 'accepted') {
    label = 'Active';
    textColor = brandColors.mintGreen;
  } else if (normalizedStatus === 'in_progress' || normalizedStatus === 'in progress') {
    label = 'In Progress';
    textColor = brandColors.amber;
  } else if (normalizedStatus === 'pending') {
    label = 'Pending';
    textColor = brandColors.amber;
  } else if (normalizedStatus === 'rejected') {
    label = 'Rejected';
    textColor = brandColors.coralPink;
  } else if (normalizedStatus === 'full') {
    label = 'Full';
    textColor = brandColors.electricViolet;
  } else if (normalizedStatus === 'completed' || normalizedStatus === 'expired') {
    label = 'Completed';
    textColor = brandColors.electricViolet;
  } else if (normalizedStatus === 'cancelled') {
    label = 'Cancelled';
    textColor = colors.text.placeholder;
  } else {
    label = status.charAt(0).toUpperCase() + status.slice(1);
    textColor = colors.text.placeholder;
  }

  const backgroundColor = hexToRGBA(textColor, 0.15);

  return (
    <View style={[styles.container, { backgroundColor }]} accessible accessibilityRole="text" accessibilityLabel={label}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: typography.label.fontSize,
  },
});
