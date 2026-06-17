import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useTheme } from '../design/theme';
import { Ionicons } from '@expo/vector-icons';

interface RideMapProps {
  fromCity: string;
  toCity: string;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

export function RideMap({ fromCity, toCity }: RideMapProps) {
  const { colors, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCoord, setFromCoord] = useState<Coordinate | null>(null);
  const [toCoord, setToCoord] = useState<Coordinate | null>(null);
  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);

  useEffect(() => {
    async function fetchMapData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Geocode cities
        const getCoord = async (city: string) => {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&countrycodes=IN`);
          const data = await res.json();
          if (data && data.length > 0) {
            return {
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon),
            };
          }
          throw new Error(`Could not find coordinates for ${city}`);
        };

        const origin = await getCoord(fromCity);
        const destination = await getCoord(toCity);

        setFromCoord(origin);
        setToCoord(destination);

        // 2. Fetch driving route using OSRM public API
        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
        );
        const routeData = await routeRes.json();

        if (routeData.code === 'Ok' && routeData.routes.length > 0) {
          const coordinates = routeData.routes[0].geometry.coordinates.map((coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0],
          }));
          setRouteCoords(coordinates);
        }

      } catch (err) {
        console.warn('Map data fetch failed:', err);
        setError('Failed to load route data');
      } finally {
        setLoading(false);
      }
    }

    if (fromCity && toCity) {
      fetchMapData();
    }
  }, [fromCity, toCity]);

  // Fit map to route when coords are ready
  useEffect(() => {
    if (mapRef.current && routeCoords.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(routeCoords, {
          edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
          animated: true,
        });
      }, 500); // Slight delay to ensure map is mounted
    } else if (mapRef.current && fromCoord && toCoord) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates([fromCoord, toCoord], {
          edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
          animated: true,
        });
      }, 500);
    }
  }, [routeCoords, fromCoord, toCoord]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.subtle, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="small" color={colors.interactive.primary} />
      </View>
    );
  }

  if (error || !fromCoord || !toCoord) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.subtle, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="map-outline" size={24} color={colors.text.placeholder} />
        <Text style={[styles.errorText, { color: colors.text.secondary }]}>{error || 'Map unavailable'}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: colors.border.default }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        initialRegion={{
          latitude: fromCoord.latitude,
          longitude: fromCoord.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        pitchEnabled={false}
        showsCompass={false}
      >
        <Marker coordinate={fromCoord} title={fromCity}>
          <View style={[styles.markerContainer, { backgroundColor: colors.interactive.primary }]}>
            <Ionicons name="location" size={16} color="#FFF" />
          </View>
        </Marker>
        
        <Marker coordinate={toCoord} title={toCity}>
          <View style={[styles.markerContainer, { backgroundColor: colors.status.rejectedText }]}>
            <Ionicons name="flag" size={16} color="#FFF" />
          </View>
        </Marker>

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.interactive.primary}
            strokeWidth={4}
            lineJoin="round"
            lineCap="round"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginTop: 16,
  },
  markerContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
});
