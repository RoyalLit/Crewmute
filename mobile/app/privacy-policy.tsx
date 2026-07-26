import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '../src/design/theme';
import { spacing, brandColors } from '../src/design/tokens';
import { fontFamilies } from '../src/design/typography';

export default function PrivacyPolicyScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const cardStyle = {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    gap: spacing.sm,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <Pressable 
          onPress={() => router.back()} 
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.background.card },
            pressed && { opacity: 0.7 }
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing['3xl'],
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>1. Overview & Commitment</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            Crewmute is committed to maintaining the privacy and security of verified student and faculty members. This policy explains how we collect, process, and protect your personal information when using our ride-pooling network.
          </Text>
        </View>

        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>2. Information We Collect</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            • <Text style={{ fontFamily: fontFamilies.bold, color: colors.text.primary }}>Account Information:</Text> Name, college email address, college/university name, profile picture, and phone number.{"\n\n"}
            • <Text style={{ fontFamily: fontFamilies.bold, color: colors.text.primary }}>Verification Data:</Text> Official college domain verification signals used strictly to ensure campus-only trust boundaries.{"\n\n"}
            • <Text style={{ fontFamily: fontFamilies.bold, color: colors.text.primary }}>Ride & Location Data:</Text> Pickup/dropoff locations, route preferences, and active live location during SOS emergency triggers.
          </Text>
        </View>

        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>3. How We Use Your Data</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            • Connecting verified college peers sharing similar commute routes.{"\n"}
            • Facilitating live SOS safety broadcasts to your designated emergency contacts.{"\n"}
            • Preventing unverified or unauthorized accounts from accessing student rides.{"\n"}
            • Improving safety, fraud detection, and platform integrity.
          </Text>
        </View>

        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>4. Data Sharing & Privacy Controls</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            We never sell or rent your personal data to third parties. Your phone number is strictly kept private and is only shared with ride participants upon confirmed ride requests. Emergency contact data is accessed strictly during triggered SOS alerts.
          </Text>
        </View>

        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>5. Contact Us</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            If you have questions regarding your data privacy, please contact our Data Protection Officer at privacy@crewmute.com.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fontFamilies.bold,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.bold,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    lineHeight: 22,
  },
});
