import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../src/design/theme';
import { spacing } from '../../../src/design/tokens';
import { Toast } from '../../../src/components/Toast';
import { useRideDetailsQuery, useUpdateRideMutation } from '../../../src/api/ridesHooks';
import { useIncomingRequestsQuery, useMyRequestsQuery } from '../../../src/api/requestsHooks';
import { formatDate } from '../../../src/utils/rideUtils';

export default function EditRideScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const { data: rideData, isLoading: rideLoading } = useRideDetailsQuery(id as string);
  const updateRideMutation = useUpdateRideMutation();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [fare, setFare] = useState('');
  const [cabType, setCabType] = useState<'Uber Go' | 'Uber XL' | 'Ola Mini' | 'Ola Prime Sedan' | 'Other'>('Uber Go');
  const [sameGenderOnly, setSameGenderOnly] = useState(false);
  
  const CAB_TYPES = ['Uber Go', 'Uber XL', 'Ola Mini', 'Ola Prime Sedan', 'Other'];

  const ride = rideData?.data;

  // Initialize fields once ride data is loaded
  useEffect(() => {
    if (ride) {
      setDate(ride.departureDate || ride.date || '');
      setTime(ride.departureTime || '');
      setSeats(ride.totalSeats?.toString() || '3');
      setFare(ride.farePerSeat?.toString() || '');
      setCabType(ride.cabType || 'Uber Go');
      setSameGenderOnly(ride.genderPreference === 'SAME_GENDER');
    }
  }, [ride]);

  if (rideLoading || !ride) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!date || !time || !seats || !fare) {
      Toast.show({ title: 'Missing Fields', message: 'Please fill in all fields.', type: 'error' });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Toast.show({ title: 'Invalid Date', message: 'Please use YYYY-MM-DD format.', type: 'error' });
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      Toast.show({ title: 'Invalid Time', message: 'Please use HH:MM format.', type: 'error' });
      return;
    }

    try {
      await updateRideMutation.mutateAsync({
        id: ride.id,
        data: {
          departureDate: date,
          departureTime: time,
          totalSeats: parseInt(seats, 10),
          farePerSeat: parseInt(fare, 10),
          cabType,
          genderPreference: sameGenderOnly ? 'SAME_GENDER' : 'ANY',
        }
      });
      Toast.show({ title: 'Success', message: 'Ride updated successfully!', type: 'success' });
      router.back();
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update ride';
      Toast.show({ title: 'Error', message: msg, type: 'error' });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Edit Ride</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.routeHeader}>
            <Text style={[styles.routeCity, { color: colors.text.primary }]}>{ride.fromCity}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.text.secondary} style={{ marginHorizontal: 12 }} />
            <Text style={[styles.routeCity, { color: colors.text.primary }]}>{ride.toCity}</Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: isDark ? colors.background.card : '#FFF', borderColor: colors.border.default }]}>
            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default, backgroundColor: colors.background.default }]}
                value={date}
                onChangeText={setDate}
                placeholder="2026-10-25"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>

            {/* Time */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Time (HH:MM)</Text>
              <TextInput
                style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default, backgroundColor: colors.background.default }]}
                value={time}
                onChangeText={setTime}
                placeholder="14:30"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>

            {/* Cab Type */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Cab Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {CAB_TYPES.map(type => {
                  const isSelected = cabType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setCabType(type as any)}
                      style={[
                        styles.chip,
                        { 
                          backgroundColor: isSelected ? colors.interactive.primary : colors.background.default,
                          borderColor: isSelected ? colors.interactive.primary : colors.border.default
                        }
                      ]}
                    >
                      <Text style={[
                        styles.chipText,
                        { color: isSelected ? colors.interactive.primaryText : colors.text.secondary }
                      ]}>{type}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.row}>
              {/* Seats */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text.primary }]}>Total Seats (inc. you)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default, backgroundColor: colors.background.default }]}
                  value={seats}
                  onChangeText={setSeats}
                  placeholder="3"
                  placeholderTextColor={colors.text.placeholder}
                  keyboardType="number-pad"
                />
              </View>

              {/* Fare */}
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text.primary }]}>Fare per seat (₹)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text.primary, borderColor: colors.border.default, backgroundColor: colors.background.default }]}
                  value={fare}
                  onChangeText={setFare}
                  placeholder="250"
                  placeholderTextColor={colors.text.placeholder}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Gender Preference */}
            <View style={[styles.switchRow, { borderTopColor: colors.border.default }]}>
              <View>
                <Text style={[styles.switchTitle, { color: colors.text.primary }]}>Same Gender Only</Text>
                <Text style={[styles.switchDesc, { color: colors.text.secondary }]}>Only users of your gender can request</Text>
              </View>
              <Switch
                value={sameGenderOnly}
                onValueChange={setSameGenderOnly}
                trackColor={{ false: colors.border.default, true: colors.interactive.primary }}
              />
            </View>
          </View>

          <Pressable 
            style={[styles.postButton, { backgroundColor: colors.interactive.primary, opacity: updateRideMutation.isPending ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={updateRideMutation.isPending}
          >
            {updateRideMutation.isPending ? (
              <ActivityIndicator color={colors.interactive.primaryText} />
            ) : (
              <Text style={[styles.postButtonText, { color: colors.interactive.primaryText }]}>Save Changes</Text>
            )}
          </Pressable>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
  },
  routeCity: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 20,
  },
  formCard: {
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
  },
  chipScroll: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  switchTitle: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 15,
  },
  switchDesc: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  postButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  postButtonText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
  }
});
