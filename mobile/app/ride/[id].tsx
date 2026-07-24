import { Toast } from '../../src/components/Toast';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from '../../src/components/GlobalAlert';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';

import { useTheme } from '../../src/design/theme';
import { brandColors, spacing, WOMEN_ONLY_COLORS } from '../../src/design/tokens';
import { useAuthStore } from '../../src/store/authStore';
import { useSocket } from '../../src/context/SocketContext';
import { Avatar } from '../../src/components/Avatar';
import { SeatsBadge } from '../../src/components/SeatsBadge';
import { StatusChip } from '../../src/components/StatusChip';
import { RideMap } from '../../src/components/RideMap';

import { useRideDetailsQuery, useCancelRideMutation } from '../../src/api/ridesHooks';
import { useCreateRequestMutation, useWithdrawRequestMutation, useMyRequestsQuery, useIncomingRequestsQuery, useMarkAsPaidMutation } from '../../src/api/requestsHooks';
import { IncomingRequestItem } from '../../src/components/IncomingRequestItem';
import { getDerivedRideStatus, formatDate, parseLocation } from '../../src/utils/rideUtils';

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const currentUser = useAuthStore((state) => state.user);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const { data: rideData, isLoading, isError } = useRideDetailsQuery(id as string);
  const { data: myRequestsData } = useMyRequestsQuery();
  const { data: incomingRequestsData } = useIncomingRequestsQuery();
  
  const createRequestMutation = useCreateRequestMutation();
  const withdrawRequestMutation = useWithdrawRequestMutation();
  const cancelRideMutation = useCancelRideMutation();
  const markAsPaidMutation = useMarkAsPaidMutation();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !rideData?.data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Text style={{ color: colors.text.secondary }}>Ride not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ride = rideData.data;
  const isPoster = ride.posterId === currentUser?.id || ride.poster?.id === currentUser?.id;
  
  const derivedStatus = getDerivedRideStatus(ride);

  // Find if current user has a pending, accepted, payment_submitted, or confirmed request for this ride
  const myRequests = Array.isArray(myRequestsData?.data) ? myRequestsData.data : [];
  const existingRequest = myRequests.find((req: any) => 
    (req.rideId === ride.id || req.ride === ride.id) && 
    ['pending', 'accepted', 'payment_submitted', 'confirmed'].includes(req.status)
  );

  // If I am the poster, find incoming requests for this ride
  const allIncoming = Array.isArray(incomingRequestsData?.data) ? incomingRequestsData.data : [];
  const rideIncomingRequests = allIncoming.filter((req: any) => 
    (req.rideId === ride.id || req.ride?._id === ride.id || req.ride?.id === ride.id) &&
    ['pending', 'accepted', 'payment_submitted', 'confirmed'].includes(req.status)
  );

  const handleRequestSeat = async () => {
    try {
      await createRequestMutation.mutateAsync({ rideId: ride.id });
      Toast.show({ title: 'Success', message: 'Your request has been sent to the poster.', type: 'success' });
    } catch (error: any) {
      Toast.show({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to request seat', type: 'error' });
    }
  };

  const handleWithdrawRequest = () => {
    if (!existingRequest) return;
    Alert.alert('Withdraw Request', 'Are you sure you want to withdraw your request?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Withdraw', 
        style: 'destructive',
        onPress: async () => {
          try {
            await withdrawRequestMutation.mutateAsync(existingRequest._id || existingRequest.id);
          } catch (error: any) {
            Toast.show({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to withdraw', type: 'error' });
          }
        }
      }
    ]);
  };

  const handleCancelRide = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride? This action cannot be undone.', [
      { text: 'No, keep it', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelRideMutation.mutateAsync(ride.id);
            Toast.show({ title: 'Ride Canceled', message: 'Your ride has been canceled.', type: 'info' });
            handleBack();
          } catch (error: any) {
            Toast.show({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to cancel ride', type: 'error' });
          }
        }
      }
    ]);
  };

  const { socket, isConnected } = useSocket();
  const [liveLocation, setLiveLocation] = useState<{ latitude: number, longitude: number, heading?: number } | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  // Subscribe to sockets for location if passenger, or broadcast if poster
  useEffect(() => {
    if (!socket || !isConnected || !ride || derivedStatus !== 'in_progress') return;

    socket.emit('join_ride', ride.id);

    if (isPoster) {
      // Poster broadcasts location
      const startTracking = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({ title: 'Permission Denied', message: 'Location permission needed to share live location', type: 'error' });
          return;
        }

        locationSubRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 3000,
            distanceInterval: 10,
          },
          (location) => {
            const locData = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              heading: location.coords.heading || undefined,
            };
            setLiveLocation(locData);
            socket.emit('send_location', { rideId: ride.id, location: locData });
          }
        );
      };
      startTracking();
    } else if (existingRequest && ['accepted', 'payment_submitted', 'confirmed'].includes(existingRequest.status)) {
      // Passenger receives location
      const handleLocation = (data: any) => {
        setLiveLocation(data);
      };
      socket.on('receive_location', handleLocation);
      return () => {
        socket.off('receive_location', handleLocation);
      };
    }

    return () => {
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }
    };
  }, [socket, isConnected, ride?.id, derivedStatus, isPoster, existingRequest?.status]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Ride Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Card */}
        <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: isDark ? '#2E2E4A' : 'transparent' }]}>
          <View style={[styles.topHeaderRow, { flexWrap: 'wrap', gap: 8 }]}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
              <Text style={[styles.dateText, { color: colors.text.secondary }]}>{formatDate(ride.departureDate || ride.date)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              {ride.genderPreference === 'SAME_GENDER' && (
                <View style={{ backgroundColor: isDark ? 'rgba(255, 105, 180, 0.15)' : 'rgba(255, 105, 180, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="flower-outline" size={12} color={isDark ? WOMEN_ONLY_COLORS.bg : WOMEN_ONLY_COLORS.text} />
                  <Text style={{ fontSize: 10, fontFamily: 'PlusJakartaSans-700Bold', color: isDark ? WOMEN_ONLY_COLORS.bg : WOMEN_ONLY_COLORS.text }}>WOMEN ONLY</Text>
                </View>
              )}
              <StatusChip status={derivedStatus} />
            </View>
          </View>

          <View style={styles.routeContainer}>
            {/* Dynamic Timeline Column */}
            <View style={styles.timeline}>
              {/* Departure circle */}
              <View style={[styles.timelineCircle, { borderColor: brandColors.electricViolet }]} />

              {ride.stops && ride.stops.length > 0 ? (
                <>
                  {ride.stops.map((_: string, index: number) => (
                    <React.Fragment key={`tl-stop-${index}`}>
                      {/* Line segment before this stop */}
                      <View style={[styles.timelineSegment, { backgroundColor: colors.border.default }]} />
                      {/* Diamond stop marker */}
                      <View style={[styles.timelineDiamond, { backgroundColor: colors.text.secondary, transform: [{ rotate: '45deg' }] }]} />
                    </React.Fragment>
                  ))}
                  {/* Final line to destination */}
                  <View style={[styles.timelineSegment, { backgroundColor: colors.border.default }]} />
                </>
              ) : (
                <View style={[styles.timelineLine, { backgroundColor: colors.border.default }]} />
              )}

              {/* Destination dot */}
              <View style={[styles.timelineDot, { backgroundColor: brandColors.coralPink }]} />
            </View>

            {/* Route Locations Column */}
            <View style={styles.routeLocations}>
              {/* Departure */}
              <View style={[styles.locationRow, { alignItems: 'flex-start' }]}>
                <Text style={[styles.timeText, { color: colors.text.primary, width: 52, marginTop: 2 }]}>{ride.departureTime || ride.time}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.cityText, { color: colors.text.primary, flex: undefined }]}
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

              {/* Intermediate stops */}
              {ride.stops && ride.stops.length > 0 && ride.stops.map((stop: string, index: number) => (
                <View key={`stop-${index}`} style={[styles.locationRow, { marginTop: spacing.lg, alignItems: 'flex-start' }]}>
                  <Text style={[styles.timeText, { color: colors.text.placeholder, width: 52, fontSize: 12, marginTop: 2 }]}>Stop</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.cityText, { color: colors.text.secondary, flex: undefined, fontSize: 16 }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {parseLocation(stop).city}
                    </Text>
                    {parseLocation(stop).state ? (
                      <Text style={[styles.stateText, { color: colors.text.secondary }]} numberOfLines={1}>
                        {parseLocation(stop).state}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}

              {/* Destination */}
              <View style={[styles.locationRow, { marginTop: spacing.lg, alignItems: 'flex-start' }]}>
                <Text style={[styles.timeText, { color: colors.text.primary, width: 52, marginTop: 2 }]}>{ride.arrivalTime}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.cityText, { color: colors.text.primary, flex: undefined }]}
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


          <View style={[styles.divider, { backgroundColor: colors.border.default }]} />

          <View style={styles.infoGrid}>
            <View style={styles.infoBlock}>
              <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Vehicle Type</Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                {ride.cabType === 'Other' ? 'Any' : (ride.cabType || 'Any')}
              </Text>
            </View>
            <View style={[styles.infoBlock, { alignItems: 'center' }]}>
              <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Seats Left</Text>
              <SeatsBadge seatsLeft={ride.availableSeats} style={{ alignSelf: 'center' }} />
            </View>
            <View style={[styles.infoBlock, { alignItems: 'flex-end' }]}>
              <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Total Fare / Seat</Text>
              <Text style={[styles.fareValue, { color: colors.text.primary }]}>₹{ride.farePerSeat}</Text>
            </View>
          </View>
        </View>

        {/* Poster Card */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary, marginTop: spacing.md }]}>Posted by</Text>
        <View style={[styles.posterCard, { backgroundColor: colors.background.subtle }]}>
          <Avatar 
            name={ride.poster.name} 
            imageUrl={ride.poster.profilePhotoUrl} 
            isVerified={ride.poster.isVerified || ride.poster.isEmailVerified}
            size="lg"
          />
          <View style={styles.posterDetails}>
            <Text style={[styles.posterName, { color: colors.text.primary }]}>
              {ride.poster.name} {isPoster && '(You)'}
            </Text>
            <Text style={[styles.posterCollege, { color: colors.text.secondary }]}>
              {ride.poster.college}
            </Text>
          </View>
        </View>

        {/* Passengers */}
        {ride.passengers && ride.passengers.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary, marginBottom: spacing.xs }]}>Passengers</Text>
            {ride.passengers.map((passenger: any) => (
              <View key={passenger.id || passenger._id} style={[styles.posterCard, { backgroundColor: colors.background.subtle, marginTop: spacing.sm, padding: spacing.sm }]}>
                <Avatar 
                  name={passenger.name} 
                  imageUrl={passenger.profilePhotoUrl} 
                  isVerified={passenger.isVerified || passenger.isEmailVerified}
                  size="md"
                />
                <View style={styles.posterDetails}>
                  <Text style={[styles.posterName, { color: colors.text.primary, fontSize: 15 }]}>
                    {passenger.name} {passenger.id === currentUser?.id && '(You)'}
                  </Text>
                  <Text style={[styles.posterCollege, { color: colors.text.secondary, fontSize: 13 }]}>
                    {passenger.college}
                  </Text>
                </View>
                {passenger.totalReviews > 0 && passenger.averageRating !== undefined && (
                   <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 215, 0, 0.2)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 }}>
                     <Ionicons name="star" size={12} color="#DBA514" style={{ marginRight: 4 }} />
                     <Text style={{ fontFamily: 'PlusJakartaSans-700Bold', fontSize: 12, color: colors.text.primary }}>{passenger.averageRating.toFixed(1)}</Text>
                   </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Route Map */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary, marginTop: spacing.xl }]}>Route</Text>
        <RideMap fromCity={ride.fromCity} toCity={ride.toCity} stops={ride.stops || []} currentLocation={liveLocation} />

        {/* Incoming Requests for Poster */}
        {isPoster && rideIncomingRequests.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary, marginBottom: spacing.md }]}>
              Passenger Requests ({rideIncomingRequests.length})
            </Text>
            {rideIncomingRequests.map((req: any) => (
              <IncomingRequestItem key={req._id || req.id} request={req} isRidePast={derivedStatus === 'expired'} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom CTA */}
      {(derivedStatus === 'active' || derivedStatus === 'in_progress') && (
        <View style={[styles.bottomCta, { backgroundColor: colors.background.primary, borderTopColor: colors.border.default }]}>
          
          {/* Top Row for Active Participants (Group Chat & SOS) */}
          {(isPoster || (existingRequest && ['accepted', 'payment_submitted', 'confirmed'].includes(existingRequest.status))) && (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <Pressable 
                style={[styles.btn, { backgroundColor: brandColors.electricViolet, flex: 1 }]}
                onPress={() => router.push(`/chat/group/${ride.id}`)}
              >
                <Ionicons name="chatbubbles" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={[styles.btnTextWhite]}>Group Chat</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.btn, { backgroundColor: brandColors.coralPink, flex: 1 }]}
                onPress={() => {
                  import('../../src/api/safetyHooks').then(({ useTriggerSosMutation }) => {
                    // Quick SOS trigger
                    Alert.alert('Emergency SOS', 'Send immediate alert to your emergency contacts?', [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Trigger SOS', 
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            const { apiClient } = require('../../src/api/client');
                            
                            // 1. Primary background trigger
                            try {
                              await apiClient.post('/safety/sos', { rideId: ride.id });
                            } catch (e) {
                              console.error('API SOS failed', e);
                            }

                            // 2. Offline/Native SMS fallback
                            const isAvailable = await SMS.isAvailableAsync();
                            if (isAvailable) {
                              const contacts = currentUser?.emergencyContacts?.map((c: any) => c.phone) || [];
                              if (contacts.length > 0) {
                                await SMS.sendSMSAsync(
                                  contacts,
                                  `EMERGENCY SOS: I need help! I am on a ride from ${ride.fromCity} to ${ride.toCity}.`
                                );
                              } else {
                                Toast.show({ title: 'SOS Sent', message: 'Alert sent via app. Add emergency contacts in profile for SMS fallback.', type: 'info' });
                              }
                            } else {
                              Toast.show({ title: 'SOS Sent', message: 'Alerts sent via app. SMS fallback unavailable.', type: 'success' });
                            }
                          } catch (e) {
                            Toast.show({ title: 'Error', message: 'Could not trigger SOS completely.', type: 'error' });
                          }
                        }
                      }
                    ]);
                  });
                }}
              >
                <Ionicons name="warning" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnTextWhite}>SOS</Text>
              </Pressable>
            </View>
          )}

          {isPoster ? (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {derivedStatus === 'active' && (
                <>
                  <Pressable 
                    style={[styles.btn, { flex: 1, backgroundColor: colors.interactive.primary }]}
                    onPress={async () => {
                      try {
                        const { apiClient } = require('../../src/api/client');
                        await apiClient.post(`/rides/${ride.id}/start`);
                        Toast.show({ title: 'Ride Started', message: 'Drive safe!', type: 'success' });
                        router.replace(`/ride/${ride.id}`);
                      } catch (e) {
                        Toast.show({ title: 'Error', message: 'Failed to start ride', type: 'error' });
                      }
                    }}
                  >
                    <Ionicons name="play" size={20} color={colors.interactive.primaryText} style={{ marginRight: 8 }} />
                    <Text style={[styles.btnText, { color: colors.interactive.primaryText }]}>Start Ride</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.btn, styles.btnDestructive, { flex: 1 }]}
                    onPress={handleCancelRide}
                    disabled={cancelRideMutation.isPending}
                  >
                    {cancelRideMutation.isPending ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.btnTextWhite}>Cancel Ride</Text>
                    )}
                  </Pressable>
                </>
              )}
              {derivedStatus === 'in_progress' && (
                <Pressable 
                  style={[styles.btn, { flex: 1, backgroundColor: brandColors.mintGreen }]}
                  onPress={async () => {
                    Alert.alert('End Ride', 'Are you sure you want to end this ride?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'End Ride',
                        style: 'default',
                        onPress: async () => {
                          try {
                            const { apiClient } = require('../../src/api/client');
                            await apiClient.post(`/rides/${ride.id}/end`);
                            Toast.show({ title: 'Ride Completed', message: 'Hope you had a great trip!', type: 'success' });
                            router.replace(`/ride/${ride.id}`);
                          } catch (e) {
                            Toast.show({ title: 'Error', message: 'Failed to end ride', type: 'error' });
                          }
                        }
                      }
                    ]);
                  }}
                >
                  <Ionicons name="stop" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={[styles.btnTextWhite]}>End Ride</Text>
                </Pressable>
              )}
            </View>
          ) : existingRequest ? (
            ['accepted', 'payment_submitted', 'confirmed'].includes(existingRequest.status) ? (
              <View style={{ flexDirection: 'column', gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Pressable 
                    style={[styles.btn, { backgroundColor: colors.background.subtle, borderWidth: 1, borderColor: brandColors.mintGreen, flex: 1 }]}
                    onPress={() => router.push(`/chat/${ride.id}/${ride.poster.id}?name=${encodeURIComponent(ride.poster.name)}&rideInfo=${encodeURIComponent(ride.fromCity + ' to ' + ride.toCity)}`)}
                  >
                    <Ionicons name="person" size={20} color={brandColors.mintGreen} style={{ marginRight: 8 }} />
                    <Text style={[styles.btnText, { color: brandColors.mintGreen }]}>DM Poster</Text>
                  </Pressable>
                  
                  {existingRequest.status === 'confirmed' ? (
                    <View style={[styles.btn, { backgroundColor: brandColors.mintGreen, flex: 1 }]}>
                      <Ionicons name="checkmark-done" size={20} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.btnTextWhite}>Confirmed</Text>
                    </View>
                  ) : existingRequest.status === 'payment_submitted' ? (
                    <View style={[styles.btn, { backgroundColor: colors.background.subtle, borderWidth: 1, borderColor: colors.border.default, flex: 1 }]}>
                      <ActivityIndicator size="small" color={colors.text.primary} style={{ marginRight: 8 }} />
                      <Text style={[styles.btnText, { color: colors.text.primary, fontSize: 13 }]}>Awaiting Driver</Text>
                    </View>
                  ) : ride.poster.upiId && ride.farePerSeat > 0 ? (
                    <Pressable 
                      style={[styles.btn, { backgroundColor: brandColors.mintGreen, flex: 1 }]}
                      onPress={() => {
                        const amount = ride.farePerSeat;
                        const upiUrl = `upi://pay?pa=${ride.poster.upiId}&pn=${encodeURIComponent(ride.poster.name)}&am=${amount}&cu=INR`;
                        import('react-native').then(({ Linking }) => {
                          Linking.canOpenURL(upiUrl).then(supported => {
                            if (supported) {
                              Linking.openURL(upiUrl);
                            } else {
                              Toast.show({ title: 'Error', message: 'No UPI app found on your phone.', type: 'error' });
                            }
                          });
                        });
                      }}
                    >
                      <Ionicons name="card" size={20} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.btnTextWhite}>Pay UPI</Text>
                    </Pressable>
                  ) : null}
                </View>

                {existingRequest.status === 'accepted' && ride.farePerSeat > 0 && (
                  <Pressable 
                    style={[styles.btn, { backgroundColor: colors.interactive.primary }]}
                    disabled={markAsPaidMutation.isPending}
                    onPress={() => {
                      markAsPaidMutation.mutate(existingRequest.id || existingRequest._id, {
                        onSuccess: () => Toast.show({ title: 'Marked as Paid', message: 'Awaiting poster confirmation.', type: 'success' }),
                        onError: () => Toast.show({ title: 'Error', message: 'Failed to update', type: 'error' })
                      });
                    }}
                  >
                    {markAsPaidMutation.isPending ? (
                      <ActivityIndicator color={colors.interactive.primaryText} />
                    ) : (
                      <Text style={[styles.btnText, { color: colors.interactive.primaryText }]}>I Have Paid</Text>
                    )}
                  </Pressable>
                )}
              </View>
            ) : (
              <Pressable 
                style={[styles.btn, { backgroundColor: colors.background.subtle, borderWidth: 1, borderColor: colors.border.default }]}
                onPress={handleWithdrawRequest}
                disabled={withdrawRequestMutation.isPending}
              >
                {withdrawRequestMutation.isPending ? (
                  <ActivityIndicator color={colors.text.primary} />
                ) : (
                  <Text style={[styles.btnText, { color: colors.text.primary }]}>Withdraw Request</Text>
                )}
              </Pressable>
            )
          ) : ride.availableSeats > 0 ? (
            <Pressable 
              style={[styles.btn, { backgroundColor: colors.interactive.primary }]}
              onPress={handleRequestSeat}
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? (
                <ActivityIndicator color={colors.interactive.primaryText} />
              ) : (
                <Text style={[styles.btnText, { color: colors.interactive.primaryText }]}>Request Seat</Text>
              )}
            </Pressable>
          ) : (
            <View style={[styles.btn, { backgroundColor: colors.background.subtle, opacity: 0.7 }]}>
              <Text style={[styles.btnText, { color: colors.text.secondary }]}>Ride Full</Text>
            </View>
          )}
        </View>
      )}

      {derivedStatus === 'expired' && !isPoster && existingRequest && ['accepted', 'payment_submitted', 'confirmed'].includes(existingRequest.status) && (
        <View style={[styles.bottomCta, { backgroundColor: colors.background.primary, borderTopColor: colors.border.default }]}>
          <Pressable 
            style={[styles.btn, { backgroundColor: colors.interactive.primary }]}
            onPress={() => router.push(`/review/${ride.poster.id || ride.posterId}?rideId=${ride.id}`)}
          >
            <Ionicons name="star" size={20} color={colors.interactive.primaryText} style={{ marginRight: 8 }} />
            <Text style={[styles.btnText, { color: colors.interactive.primaryText }]}>Leave a Review</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 100, // Space for bottom CTA
  },
  card: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    // Add shadow for light mode
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    fontSize: 14,
    marginLeft: 6,
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
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 15,
    width: 55,
  },
  cityText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
    flex: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  fareValue: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  stateText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  posterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
  },
  posterDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  posterName: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  posterCollege: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 34, // Safe area approx
    borderTopWidth: 1,
  },
  btn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDestructive: {
    backgroundColor: brandColors.coralPink,
  },
  btnText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
  },
  btnTextWhite: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#FFF',
  },
});
