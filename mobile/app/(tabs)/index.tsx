/**
 * Explore tab — Home feed screen.
 *
 * Placeholder screen. The rides feed, filter UI, and ride cards are
 * implemented in the rides feature PR.
 *
 * Per AGENT_RULES.md §8.7: no data fetching here.
 * Per AGENT_RULES.md §8.4: screen components receive navigation props
 * and render UI — no business logic.
 *
 * // WIP(phase 1 of 6): Foundation scaffold — screen content added in rides feature PR
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing } from '../../src/design/tokens';

// Temporary import combining spacing/typography from tokens
// TODO(feature/rides): replace this entire screen with the real home feed

export default function ExploreScreen(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      accessibilityRole="none"
    >
      <Text
        style={[styles.title, { color: colors.text.primary }]}
        accessibilityRole="header"
      >
        Explore
      </Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        Ride feed coming soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: TAB_BAR_HEIGHT,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
  },
});
