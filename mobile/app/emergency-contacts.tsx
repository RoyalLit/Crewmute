import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '../src/design/theme';
import { spacing, fonts } from '../src/design/tokens';
import { useAuthStore } from '../src/store/authStore';
import { useUpdateEmergencyContactsMutation } from '../src/api/usersHooks';
import { Toast } from '../src/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

interface ContactInput {
  name: string;
  phone: string;
}

export default function EmergencyContactsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  const updateContactsMutation = useUpdateEmergencyContactsMutation();

  const [contacts, setContacts] = useState<ContactInput[]>([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' },
  ]);

  useEffect(() => {
    if (user?.emergencyContacts && user.emergencyContacts.length > 0) {
      const initialContacts = [...contacts];
      user.emergencyContacts.forEach((contact, index) => {
        if (index < 3) {
          initialContacts[index] = { name: contact.name, phone: contact.phone };
        }
      });
      setContacts(initialContacts);
    }
  }, [user]);

  const updateContact = (index: number, field: keyof ContactInput, value: string) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleSave = async () => {
    const validContacts = contacts.filter(c => c.name.trim() !== '' && c.phone.trim() !== '');
    
    // Basic validation
    for (const contact of validContacts) {
      if (contact.phone.trim().length < 10) {
        Toast.show({ type: 'error', message: 'Phone numbers must be at least 10 digits.' });
        return;
      }
    }

    try {
      await updateContactsMutation.mutateAsync({ contacts: validContacts });
      Toast.show({ type: 'success', message: 'Emergency contacts saved!' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', message: err.message || 'Failed to save contacts.' });
    }
  };

  const bentoBox = {
    backgroundColor: colors.background.card,
    borderRadius: 24,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable 
          onPress={() => router.back()} 
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.background.card },
            pressed && { opacity: 0.7 }
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>SOS Contacts</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing['3xl'],
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[bentoBox, { gap: spacing.md }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="shield-checkmark" size={24} color={colors.semantic.success} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Your Safety Circle</Text>
          </View>
          <Text style={{ color: colors.text.secondary, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 }}>
            Add up to 3 emergency contacts. When you trigger an SOS during a ride, we'll immediately send them your live location and ride details.
          </Text>
        </View>

        {[0, 1, 2].map((index) => (
          <View key={`contact-${index}`} style={[bentoBox, { gap: spacing.md }]}>
            <Text style={[styles.contactLabel, { color: colors.text.primary }]}>Contact {index + 1}</Text>
            
            <View>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background.primary,
                    color: colors.text.primary,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  }
                ]}
                placeholder="E.g. Mom"
                placeholderTextColor={colors.text.tertiary}
                value={contacts[index].name}
                onChangeText={(text) => updateContact(index, 'name', text)}
              />
            </View>

            <View>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Phone / Email</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background.primary,
                    color: colors.text.primary,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  }
                ]}
                placeholder="+91 9876543210 or email@domain.com"
                placeholderTextColor={colors.text.tertiary}
                value={contacts[index].phone}
                onChangeText={(text) => updateContact(index, 'phone', text)}
                autoCapitalize="none"
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl), backgroundColor: colors.background.primary, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
        <Pressable 
          onPress={handleSave} 
          disabled={updateContactsMutation.isPending}
        >
          {({ pressed }) => (
            <LinearGradient
              colors={[colors.interactive.primary, '#5B21B6']} // Assuming primary is a purple
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.saveButton,
                pressed && { opacity: 0.9 },
                updateContactsMutation.isPending && { opacity: 0.7 }
              ]}
            >
              {updateContactsMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Contacts</Text>
              )}
            </LinearGradient>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  contactLabel: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
});
