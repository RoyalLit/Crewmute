import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors } from '../design/tokens';

export type RideStatus = 'Active' | 'Pending' | 'Accepted' | 'Rejected' | 'Full' | 'Expired' | 'Cancelled';

function hexToRGBA(hex: string, alpha: number) {
  if (!hex || hex.length < 7) return 'rgba(0,0,0,0.1)';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface StatusChipProps {
  status: RideStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  let textColor = '';

  switch (status) {
    case 'Active':
    case 'Accepted':
      textColor = brandColors.mintGreen;
      break;
    case 'Pending':
      textColor = brandColors.amber;
      break;
    case 'Rejected':
      textColor = brandColors.coralPink;
      break;
    case 'Full':
      textColor = brandColors.electricViolet;
      break;
    case 'Expired':
    case 'Cancelled':
    default:
      textColor = '#8B8FA8';
      break;
  }

  const backgroundColor = hexToRGBA(textColor, 0.15);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{status}</Text>
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
    fontSize: 12,
  },
});
