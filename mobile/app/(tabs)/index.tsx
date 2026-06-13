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
import { StyleSheet, Text, View, FlatList, TextInput, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing, brandColors } from '../../src/design/tokens';
import { RideCard, RideCardData } from '../../src/components/RideCard';

import { useThemeStore } from '../../src/store/themeStore';

const DUMMY_RIDES: RideCardData[] = [
  {
    id: '1',
    fromCity: 'Amity Univ, Noida',
    toCity: 'Delhi',
    date: 'Today',
    time: '4:30 PM',
    posterName: 'Rahul Verma',
    posterCollege: 'Amity University Punjab',
    posterIsVerified: true,
    seatsLeft: 3,
    fare: 150,
    status: 'Active',
  },
  {
    id: '2',
    fromCity: 'North Campus',
    toCity: 'Gurugram Sec 14',
    date: 'Today',
    time: '5:00 PM',
    posterName: 'Priya Singh',
    posterCollege: 'Delhi Univ, North',
    posterIsVerified: true,
    seatsLeft: 1,
    fare: 200,
    status: 'Pending',
  },
  {
    id: '3',
    fromCity: 'Delhi',
    toCity: 'Amity University Punjab',
    date: 'Fri, 19 Jun',
    time: '06:00 AM',
    posterName: 'Aditya Sharma',
    posterCollege: 'Amity University Punjab',
    posterIsVerified: true,
    seatsLeft: 0,
    fare: 800,
    status: 'Full',
  },
];

export default function ExploreScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const setPreference = useThemeStore((state) => state.setPreference);
  const insets = useSafeAreaInsets();

  const shadowStyle = isDark
    ? { borderWidth: 1, borderColor: '#2E2E4A' }
    : {
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* 
        Easter Egg hiding BEHIND the physical hardware!
        Only applies to iOS since Android punch-holes/bezels vary drastically.
      */}
      {Platform.OS === 'ios' && insets.top > 20 && (
        <View style={[styles.easterEggContainer, { top: -(Math.max(insets.top, spacing.xl)) + 15, zIndex: 999 }]} pointerEvents="none">
          <Text style={[styles.easterEggText, { color: colors.interactive.primary }]}>
            🚗 beep beep!
          </Text>
        </View>
      )}

      <View style={styles.headerTop}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Find your crew.</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Where are you heading today?</Text>
        </View>
        <Pressable 
          onPress={() => setPreference(isDark ? 'light' : 'dark')}
          style={[styles.themeToggle, { backgroundColor: colors.background.subtle }]}
          accessibilityLabel="Toggle Theme"
          accessibilityRole="button"
        >
          <Ionicons name={isDark ? "sunny" : "moon"} size={22} color={colors.text.primary} />
        </Pressable>
      </View>

      {/* Advanced Search Card */}
      <View style={[styles.searchCard, { backgroundColor: colors.background.card }, shadowStyle]}>
        
        {/* Timeline for Search */}
        <View style={styles.searchTimelineContainer}>
          <View style={styles.searchTimeline}>
            <Ionicons name="location" size={16} color={brandColors.electricViolet} />
            <View style={[styles.searchTimelineLine, { backgroundColor: colors.border.default }]} />
            <Ionicons name="location-outline" size={16} color={brandColors.coralPink} />
          </View>
          
          <View style={styles.searchInputs}>
            <View style={[styles.searchInputWrapper, { backgroundColor: colors.background.subtle }]}>
              <TextInput 
                style={[styles.searchInput, { color: colors.text.primary }]}
                placeholder="Leaving from..."
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
            <View style={[styles.searchInputWrapper, { backgroundColor: colors.background.subtle, marginTop: spacing.sm }]}>
              <TextInput 
                style={[styles.searchInput, { color: colors.text.primary }]}
                placeholder="Going to..."
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
          </View>
        </View>

        <View style={styles.searchActions}>
          <Pressable style={[styles.dateButton, { backgroundColor: colors.background.subtle }]}>
            <Ionicons name="calendar-outline" size={18} color={colors.text.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.dateButtonText, { color: colors.text.primary }]}>Today</Text>
          </Pressable>
          <Pressable style={[styles.searchButton, { backgroundColor: brandColors.electricViolet }]}>
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        </View>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Active Rides</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <FlatList
        data={DUMMY_RIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RideCard ride={item} />}
        ListHeaderComponent={renderHeader}
        style={[styles.container, { backgroundColor: 'transparent' }]}
        contentContainerStyle={{ 
          paddingBottom: TAB_BAR_HEIGHT + spacing.md, 
          paddingTop: Math.max(insets.top, spacing.xl),
          paddingHorizontal: spacing.md
        }}
        accessibilityRole="none"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  easterEggContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  easterEggText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 14,
  },
  headerContainer: {
    marginBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-400Regular',
  },
  searchCard: {
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  searchTimelineContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  searchTimeline: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.sm,
    paddingVertical: 14,
  },
  searchTimelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  searchInputs: {
    flex: 1,
  },
  searchInputWrapper: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 15,
  },
  searchActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 15,
  },
  searchButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-700Bold',
    marginBottom: spacing.xs,
  },
});
