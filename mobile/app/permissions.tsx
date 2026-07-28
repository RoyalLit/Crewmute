import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

import { useTheme } from '../src/design/theme';
import { spacing, brandColors } from '../src/design/tokens';
import { fontFamilies } from '../src/design/typography';

export default function PermissionsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [locationStatus, setLocationStatus] = useState<boolean | null>(null);
  const [cameraStatus, setCameraStatus] = useState<boolean | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkAllPermissions = async () => {
    try {
      setIsChecking(true);

      // Check Location
      const loc = await Location.getForegroundPermissionsAsync();
      setLocationStatus(loc.granted);

      // Check Camera
      const cam = await ImagePicker.getCameraPermissionsAsync();
      setCameraStatus(cam.granted);

      // Check Notifications
      const notif = await Notifications.getPermissionsAsync();
      setNotificationStatus(notif.granted);
    } catch (e) {
      console.log('Error checking permissions:', e);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const requestLocation = async () => {
    const res = await Location.requestForegroundPermissionsAsync();
    setLocationStatus(res.granted);
    if (res.granted) {
      await Location.requestBackgroundPermissionsAsync().catch(() => {});
    } else if (!res.canAskAgain) {
      Linking.openSettings();
    }
  };

  const requestCamera = async () => {
    const res = await ImagePicker.requestCameraPermissionsAsync();
    setCameraStatus(res.granted);
    if (!res.granted && !res.canAskAgain) {
      Linking.openSettings();
    }
  };

  const requestNotifications = async () => {
    const res = await Notifications.requestPermissionsAsync();
    setNotificationStatus(res.granted);
    if (!res.granted && !res.canAskAgain) {
      Linking.openSettings();
    }
  };

  const allGranted = !!(locationStatus && cameraStatus && notificationStatus);

  const handleContinue = () => {
    if (allGranted) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView 
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
          paddingBottom: insets.bottom + spacing['3xl'],
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ gap: spacing.xs }}>
          <View style={[styles.iconBadge, { backgroundColor: 'rgba(108, 92, 231, 0.12)' }]}>
            <Ionicons name="shield-checkmark" size={32} color={brandColors.electricViolet} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>Safety Permissions Required</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Crewmute is a verified campus network. To ensure live ride tracking, SOS alerts, and identity verification, please allow the following permissions:
          </Text>
        </View>

        {isChecking ? (
          <ActivityIndicator size="large" color={brandColors.electricViolet} style={{ marginVertical: spacing.xl }} />
        ) : (
          <View style={{ gap: spacing.md }}>
            {/* Location Card */}
            <View style={[styles.permissionCard, { backgroundColor: colors.background.card, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <View style={[styles.permissionIcon, { backgroundColor: 'rgba(0, 204, 136, 0.12)' }]}>
                <Ionicons name="location-outline" size={24} color={brandColors.mintGreen} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Location & GPS</Text>
                <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
                  Enables live ride route matching and broadcasts real-time GPS coordinates during SOS emergencies.
                </Text>
              </View>
              <Pressable
                onPress={requestLocation}
                style={[
                  styles.actionButton,
                  locationStatus ? { backgroundColor: 'rgba(0, 204, 136, 0.15)' } : { backgroundColor: brandColors.electricViolet }
                ]}
              >
                <Text style={[styles.actionText, { color: locationStatus ? brandColors.mintGreen : '#FFFFFF' }]}>
                  {locationStatus ? '✓ Granted' : 'Allow'}
                </Text>
              </Pressable>
            </View>

            {/* Camera Card */}
            <View style={[styles.permissionCard, { backgroundColor: colors.background.card, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <View style={[styles.permissionIcon, { backgroundColor: 'rgba(108, 92, 231, 0.12)' }]}>
                <Ionicons name="camera-outline" size={24} color={brandColors.electricViolet} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Live Camera</Text>
                <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
                  Required for live Student ID card verification and profile photo capture.
                </Text>
              </View>
              <Pressable
                onPress={requestCamera}
                style={[
                  styles.actionButton,
                  cameraStatus ? { backgroundColor: 'rgba(0, 204, 136, 0.15)' } : { backgroundColor: brandColors.electricViolet }
                ]}
              >
                <Text style={[styles.actionText, { color: cameraStatus ? brandColors.mintGreen : '#FFFFFF' }]}>
                  {cameraStatus ? '✓ Granted' : 'Allow'}
                </Text>
              </Pressable>
            </View>

            {/* Notifications Card */}
            <View style={[styles.permissionCard, { backgroundColor: colors.background.card, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <View style={[styles.permissionIcon, { backgroundColor: 'rgba(255, 107, 107, 0.12)' }]}>
                <Ionicons name="notifications-outline" size={24} color={brandColors.coralPink} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Push Notifications</Text>
                <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
                  Receive instant alerts when a student requests your ride, accepts your seat, or sends a chat message.
                </Text>
              </View>
              <Pressable
                onPress={requestNotifications}
                style={[
                  styles.actionButton,
                  notificationStatus ? { backgroundColor: 'rgba(0, 204, 136, 0.15)' } : { backgroundColor: brandColors.electricViolet }
                ]}
              >
                <Text style={[styles.actionText, { color: notificationStatus ? brandColors.mintGreen : '#FFFFFF' }]}>
                  {notificationStatus ? '✓ Granted' : 'Allow'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Blocking Notice / Continue Button */}
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Pressable
            onPress={handleContinue}
            disabled={!allGranted}
            style={({ pressed }) => [
              styles.continueButton,
              { backgroundColor: allGranted ? brandColors.mintGreen : colors.background.subtle },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.continueText, { color: allGranted ? '#000000' : colors.text.placeholder }]}>
              {allGranted ? 'Continue to Crewmute →' : '🔒 Allow All Permissions to Continue'}
            </Text>
          </Pressable>

          {!allGranted && (
            <Pressable onPress={() => Linking.openSettings()} style={{ alignSelf: 'center', paddingVertical: 8 }}>
              <Text style={{ fontFamily: fontFamilies.medium, fontSize: 13, color: brandColors.electricViolet }}>
                Having trouble? Open App Settings ⚙️
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamilies.bold,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    lineHeight: 20,
  },
  permissionCard: {
    borderRadius: 20,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
  },
  permissionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: fontFamilies.bold,
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: fontFamilies.medium,
    lineHeight: 16,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 13,
    fontFamily: fontFamilies.bold,
  },
  continueButton: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: 16,
    fontFamily: fontFamilies.bold,
  },
});
