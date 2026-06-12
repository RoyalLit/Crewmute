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
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing, brandColors } from '../../src/design/tokens';

export default function ExploreScreen(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + spacing.md, paddingTop: spacing.xl }}
      accessibilityRole="none"
    >
      <View style={{ paddingHorizontal: spacing.md }}>
        <Text
          style={[styles.title, { color: colors.text.primary }]}
          accessibilityRole="header"
        >
          Explore
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary, marginBottom: spacing.lg }]}>
          Scroll down to see the liquid glass tab bar effect!
        </Text>

        {/* Dummy colorful cards to demonstrate the blur effect */}
        {[brandColors.electricViolet, brandColors.coralPink, brandColors.mintGreen, brandColors.amber, '#4338ca', '#ec4899', '#14b8a6', '#f59e0b'].map((color, index) => (
          <View
            key={index}
            style={[styles.dummyCard, { backgroundColor: color }]}
          >
            <Text style={styles.dummyText}>Ride #{index + 1}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
  },
  dummyCard: {
    height: 150,
    borderRadius: 16,
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dummyText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  }
});
