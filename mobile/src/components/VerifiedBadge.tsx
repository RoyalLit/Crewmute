import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '../design/tokens';

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export function VerifiedBadge({ isVerified, size = 'small', showText = false }: VerifiedBadgeProps) {
  if (!isVerified) return null;

  const getIconSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'medium': return 16;
      case 'large': return 20;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 10;
      case 'medium': return 12;
      case 'large': return 14;
    }
  };

  return (
    <View style={[styles.container, showText && { backgroundColor: 'rgba(0, 204, 136, 0.1)', paddingHorizontal: 6, paddingVertical: 2 }]}>
      <Ionicons name="checkmark-circle" size={getIconSize()} color={brandColors.mintGreen} />
      {showText && (
        <Text style={[styles.text, { fontSize: getTextSize(), color: brandColors.mintGreen }]}>
          Verified
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
  },
  text: {
    fontWeight: '600',
  },
});
