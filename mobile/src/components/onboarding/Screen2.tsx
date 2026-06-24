import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import type {
  SharedValue} from 'react-native-reanimated';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  useAnimatedReaction,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tokens, StaggeredText } from './shared';


const { height } = Dimensions.get('window');

const SCENE_2 = require('../../../assets/images/onboarding/scene2.png');

export function Screen2({ currentIndex, myIndex, topInset }: { currentIndex: SharedValue<number>; myIndex: number; topInset: number }) {
  const subOpacity = useSharedValue(0);
  const pillScale = useSharedValue(0.8);
  const pillOpacity = useSharedValue(0);

  useAnimatedReaction(
    () => Math.abs(currentIndex.value - myIndex) < 0.85,
    (isActive) => {
      if (isActive) {
        subOpacity.value = withDelay(100, withTiming(1, { duration: 250 }));
        pillScale.value = withDelay(150, withSpring(1, { damping: 15, stiffness: 200 }));
        pillOpacity.value = withDelay(150, withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }));
      } else {
        subOpacity.value = 0;
        pillScale.value = 0.8;
        pillOpacity.value = 0;
      }
    }
  );

  return (
    <View style={styles.screenContent}>
      <View style={[styles.heroZone, { height: height }]}>
        <Image source={SCENE_2} style={[styles.heroImage, { height: height, transform: [{ translateY: -height * 0.05 }] }]} resizeMode="cover" accessibilityElementsHidden />
        <LinearGradient colors={[tokens.bg, 'rgba(13,13,28,0.8)', 'transparent']} locations={[0, 0.4, 1]} style={[styles.gradientMaskTop, { height: topInset + 60 }]} />
        <LinearGradient colors={['transparent', 'rgba(13,13,28,0.4)', tokens.bg]} locations={[0, 0.4, 1]} style={[styles.gradientMask, { height: height * 0.5 }]} />
      </View>
      <View style={[styles.bottomZone, { bottom: 120 }]}>
        <StaggeredText text="Verified students only." currentIndex={currentIndex} myIndex={myIndex} />
        <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
          No strangers. No sketchy rides. Only share rides with verified students.
        </Animated.Text>
        <Animated.View style={[styles.trustBadge, { transform: [{ scale: pillScale }], opacity: pillOpacity }]}>
          <Ionicons name="shield-checkmark" size={16} color={tokens.accent} style={styles.badgeIcon} />
          <Text style={styles.trustBadgeText}>College email verified</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: { flex: 1 },
  heroZone: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  heroImage: { width: '100%' },
  gradientMaskTop: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 2 },
  gradientMask: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bottomZone: { position: 'absolute', left: 0, right: 0, bottom: 120, paddingHorizontal: 24, paddingTop: 16 },
  subtext: { fontFamily: 'PlusJakartaSans-400Regular', fontSize: 15, color: tokens.textMuted, lineHeight: 24 },
  trustBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(34, 211, 238, 0.08)', 
    borderWidth: 1, 
    borderColor: 'rgba(34, 211, 238, 0.25)', 
    borderRadius: 8, 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    alignSelf: 'flex-end', 
    marginTop: 12,
    shadowColor: tokens.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4
  },
  badgeIcon: { marginRight: 8 },
  trustBadgeText: { fontFamily: 'PlusJakartaSans-600SemiBold', fontSize: 13, color: tokens.accent, letterSpacing: 0.2 },
});
