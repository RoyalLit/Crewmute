/**
 * Profile tab — user account and settings.
 * Placeholder. Real content added in profile feature PR.
 * Theme toggle (light/dark/system) wired here per DESIGN.md §9.2.
 * // WIP(phase 1 of 6): Foundation scaffold
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing } from '../../src/design/tokens';

export default function ProfileScreen(): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Text style={[styles.title, { color: colors.text.primary }]} accessibilityRole="header">
        Profile
      </Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        Profile and settings coming soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: TAB_BAR_HEIGHT },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.sm },
  subtitle: { fontSize: 14 },
});
