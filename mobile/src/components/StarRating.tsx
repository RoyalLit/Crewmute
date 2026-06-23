import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';

interface StarRatingProps {
  rating: number; // 0 to 5
  totalReviews?: number;
  size?: number;
}

export function StarRating({ rating, totalReviews, size = 14 }: StarRatingProps) {
  const { colors } = useTheme();
  
  if (rating === 0 && !totalReviews) {
    return (
      <View style={styles.container}>
        <Text style={[styles.newText, { color: colors.text.secondary, fontSize: size - 2 }]}>New</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="star" size={size} color="#FFD700" />
      <Text style={[styles.ratingText, { color: colors.text.primary, fontSize: size }]}>
        {rating.toFixed(1)}
      </Text>
      {totalReviews !== undefined && (
        <Text style={[styles.reviewsText, { color: colors.text.secondary, fontSize: size - 2 }]}>
          ({totalReviews})
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
  },
  ratingText: {
    fontWeight: '600',
  },
  reviewsText: {
    fontWeight: '400',
  },
  newText: {
    fontWeight: '500',
  },
});
