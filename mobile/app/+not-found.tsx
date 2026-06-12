/**
 * 404 fallback route for Expo Router.
 * Shown when a route segment doesn't match any known route.
 */

import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../src/design/theme';
import { spacing } from '../src/design/tokens';

export default function NotFoundScreen(): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.title, { color: colors.text.primary }]} accessibilityRole="header">
          This screen doesn't exist.
        </Text>
        <Link href="/(tabs)/" style={styles.link}>
          <Text style={{ color: colors.interactive.primary }}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: 20, fontWeight: '700', marginBottom: spacing.base },
  link: { paddingVertical: spacing.sm },
});
