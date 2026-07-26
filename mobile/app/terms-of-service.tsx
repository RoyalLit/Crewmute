import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '../src/design/theme';
import { spacing, brandColors } from '../src/design/tokens';
import { fontFamilies } from '../src/design/typography';

export default function TermsOfServiceScreen() {
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
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Terms of Service</Text>
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
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            By creating an account or accessing Crewmute, you agree to comply with these Terms of Service. Crewmute is an exclusive peer-to-peer ride pooling utility for verified college students and campus personnel.
          </Text>
        </View>

        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>2. Eligibility & College Verification</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            Users must possess a valid, active college/university email address to register and join rides. Maintaining accurate profile details is required. Account sharing or transferring accounts to unverified third parties is strictly prohibited.
          </Text>
        </View>

        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>3. Community Guidelines & Code of Conduct</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            • <Text style={{ fontFamily: fontFamilies.bold, color: colors.text.primary }}>Respect & Safety:</Text> Harassment, discrimination, or abusive behavior will result in an immediate permanent ban.{"\n\n"}
            • <Text style={{ fontFamily: fontFamilies.bold, color: colors.text.primary }}>Punctuality:</Text> Riders and drivers are expected to arrive promptly at agreed pickup spots.{"\n\n"}
            • <Text style={{ fontFamily: fontFamilies.bold, color: colors.text.primary }}>Fair Cost Sharing:</Text> Crewmute facilitates peer cost-sharing for fuel and transit expenses, not commercial ride-hailing services.
          </Text>
        </View>

        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>4. Cancellations & Fare Settlement</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            Riders should notify drivers reasonably in advance if plans change. Payment arrangements (UPI or cash) are settled directly between riders and drivers upon agreed fare terms.
          </Text>
        </View>

        <View style={cardStyle}>
          <Text style={[styles.sectionTitle, { color: brandColors.electricViolet }]}>5. Limitation of Liability</Text>
          <Text style={[styles.bodyText, { color: colors.text.secondary }]}>
            Crewmute acts as a platform matching student commuters. Drivers operate their personal vehicles independently. Crewmute assumes no liability for personal property or travel delays.
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
