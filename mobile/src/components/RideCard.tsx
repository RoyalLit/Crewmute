import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { spacing, brandColors, WOMEN_ONLY_COLORS } from '../design/tokens';
import { typography } from '../design/typography';
import { formatDate, parseLocation } from '../utils/rideUtils';
import { Avatar } from './Avatar';
import { StatusChip } from './StatusChip';
import { SeatsBadge } from './SeatsBadge';
import { VerifiedBadge } from './VerifiedBadge';
import { StarRating } from './StarRating';

interface RideCardProps {
  ride: any; // Using any for now to handle both dummy and real API data shapes flexibly
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RideCard = React.memo(function RideCard({ ride, onPress }: RideCardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(0.85, { duration: 150, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
  };

  // Determine shadow style based on mode (from DESIGN.md 9.3)
  const shadowStyle = isDark
    ? { borderWidth: 1, borderColor: '#2E2E4A' }
    : {
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3, // Android shadow
      };

  return (
    <AnimatedPressable
      style={[
        styles.card,
        { backgroundColor: colors.background.card },
        shadowStyle,
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Ride from ${ride.fromCity} to ${ride.toCity} on ${ride.date}`}
    >
      {/* Top Header: Date & Status */}
      <View style={[styles.topHeaderRow, { flexWrap: 'wrap', gap: 8 }]}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
          <Text style={[styles.dateText, { color: colors.text.secondary }]}>
            {formatDate(ride.departureDate || ride.date)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {ride.genderPreference === 'SAME_GENDER' && (
            <View style={{ backgroundColor: isDark ? 'rgba(255, 105, 180, 0.15)' : 'rgba(255, 105, 180, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="flower-outline" size={12} color={isDark ? WOMEN_ONLY_COLORS.bg : WOMEN_ONLY_COLORS.text} />
              <Text style={{ fontSize: 10, fontFamily: 'PlusJakartaSans-700Bold', color: isDark ? WOMEN_ONLY_COLORS.bg : WOMEN_ONLY_COLORS.text }}>WOMEN ONLY</Text>
            </View>
          )}
          <StatusChip status={ride.status as any} />
        </View>
      </View>

      {/* Route Timeline */}
      <View style={styles.routeContainer}>
        <View style={styles.timeline}>
          {/* Departure */}
          <View style={[styles.timelineCircle, { borderColor: brandColors.electricViolet }]} />

          {ride.stops && ride.stops.length > 0 ? (
            <>
              {ride.stops.map((_: string, index: number) => (
                <React.Fragment key={`tl-${index}`}>
                  <View style={[styles.timelineSegment, { backgroundColor: colors.border.default }]} />
                  <View style={[styles.timelineDiamond, { backgroundColor: colors.text.secondary, transform: [{ rotate: '45deg' }] }]} />
                </React.Fragment>
              ))}
              <View style={[styles.timelineSegment, { backgroundColor: colors.border.default }]} />
            </>
          ) : (
            <View style={[styles.timelineLine, { backgroundColor: colors.border.default }]} />
          )}

          {/* Destination */}
          <View style={[styles.timelineDot, { backgroundColor: brandColors.coralPink }]} />
        </View>

        <View style={styles.routeLocations}>
          <View style={[styles.locationRow, { alignItems: 'flex-start' }]}>
            <Text style={[styles.timeText, { color: colors.text.primary, width: 52, marginTop: 2 }]}>
              {ride.departureTime || ride.time}
            </Text>
            <View style={{ flex: 1 }}>
              <Text 
                style={[styles.cityText, { color: colors.text.primary, paddingRight: 0, flex: undefined }]} 
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {parseLocation(ride.fromCity).city}
              </Text>
              {parseLocation(ride.fromCity).state ? (
                <Text style={[styles.stateText, { color: colors.text.secondary }]} numberOfLines={1}>
                  {parseLocation(ride.fromCity).state}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Inline stops: just city name, smaller, muted */}
          {ride.stops && ride.stops.length > 0 && ride.stops.map((stop: string, index: number) => (
            <View key={`stop-${index}`} style={[styles.locationRow, { marginTop: spacing.md, alignItems: 'center' }]}>
              <Text style={[styles.stateText, { color: colors.text.placeholder, width: 52 }]}>Stop</Text>
              <Text style={[styles.stateText, { color: colors.text.secondary, flex: 1 }]} numberOfLines={1}>
                {parseLocation(stop).city}
              </Text>
            </View>
          ))}
          
          <View style={[styles.locationRow, { marginTop: spacing.lg, alignItems: 'flex-start' }]}>
            <Text style={[styles.timeText, { color: colors.text.primary, width: 52, marginTop: 2 }]}>{ride.arrivalTime}</Text>
            <View style={{ flex: 1 }}>
              <Text 
                style={[styles.cityText, { color: colors.text.primary, paddingRight: 0, flex: undefined }]} 
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {parseLocation(ride.toCity).city}
              </Text>
              {parseLocation(ride.toCity).state ? (
                <Text style={[styles.stateText, { color: colors.text.secondary }]} numberOfLines={1}>
                  {parseLocation(ride.toCity).state}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border.default }]} />

      {/* Bottom Row: Poster Info & Fare/Seats */}
      <View style={styles.bottomRow}>
        {/* Left: Avatar & Info */}
        <View style={styles.posterInfo}>
          <Avatar
            size="sm"
            name={ride.poster ? ride.poster.name : ride.posterName}
            imageUrl={ride.poster?.profilePhotoUrl || ride.posterAvatar}
            isVerified={ride.poster?.isVerified ?? ride.posterIsVerified}
          />
          <View style={styles.posterTextContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.posterName, { color: colors.text.primary }]} numberOfLines={1}>
                {ride.poster ? ride.poster.name : ride.posterName}
              </Text>
              <VerifiedBadge isVerified={ride.poster?.isVerified ?? ride.posterIsVerified} size="small" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.posterCollege, { color: colors.text.secondary }]} numberOfLines={1}>
                {ride.poster?.college || ride.posterCollege}
              </Text>
              {ride.poster?.averageRating !== undefined && (
                <>
                  <Text style={{ color: colors.text.placeholder, fontSize: 10 }}>•</Text>
                  <StarRating rating={ride.poster.averageRating || 0} totalReviews={ride.poster.totalReviews || 0} size={12} />
                </>
              )}
            </View>
          </View>
        </View>

        {/* Right: Fare & Seats */}
        <View style={styles.fareContainer}>
          <Text style={[styles.fareText, { color: colors.text.primary }]}>
            ₹{ride.farePerSeat || ride.fare}
          </Text>
          <SeatsBadge seatsLeft={ride.availableSeats ?? ride.seatsLeft} />
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing.md, // 16px
    marginBottom: 12, // 12px gap between cards
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: typography.body.fontSize,
    marginLeft: spacing.xs,
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timeline: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.md,
  },
  timelineCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    backgroundColor: 'transparent',
    marginTop: 4,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: -2,
    zIndex: 1,
  },
  timelineSegment: {
    width: 2,
    flex: 1,
    zIndex: 1,
  },
  timelineDiamond: {
    width: 8,
    height: 8,
    zIndex: 2,
    marginVertical: 2,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
    zIndex: 2,
  },
  routeLocations: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: typography.bodyLarge.fontSize,
    flex: 1,
    paddingRight: 8,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: typography.body.fontSize,
  },
  stateText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: typography.bodySmall.fontSize,
    marginTop: 2,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  posterTextContainer: {
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  posterName: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: typography.body.fontSize,
  },
  posterCollege: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: typography.bodySmall.fontSize,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 18,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
});
