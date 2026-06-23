import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function OfflineNotice() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1C1C2E' : '#FEF3C7' }]}>
      <Text style={[styles.text, { color: isDark ? '#FBBF24' : '#92400E' }]}>
        No internet connection
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  text: { fontSize: 14, fontWeight: '500' },
});
