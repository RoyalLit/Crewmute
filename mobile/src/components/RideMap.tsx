import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { useTheme } from '../design/theme';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '../design/tokens';

/** Extract just the city portion from a stored location string like "Chennai, Tamil Nadu" */
const extractCity = (loc: string): string => {
  if (!loc) return '';
  const parts = loc.split(',');
  return parts[0].trim();
};

interface RideMapProps {
  fromCity: string;
  toCity: string;
  stops?: string[];
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

export function RideMap({ fromCity, toCity, stops = [] }: RideMapProps) {
  const { colors, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCoord, setFromCoord] = useState<Coordinate | null>(null);
  const [toCoord, setToCoord] = useState<Coordinate | null>(null);
  const [stopCoords, setStopCoords] = useState<Coordinate[]>([]);
  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);

  useEffect(() => {
    async function fetchMapData() {
      try {
        setLoading(true);
        setError(null);

        // Geocode a city name → coordinate (uses just the city portion)
        const getCoord = async (cityStr: string): Promise<Coordinate | null> => {
          const city = extractCity(cityStr);
          if (!city) return null;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&countrycodes=IN`
            );
            const data = await res.json();
            if (data && data.length > 0) {
              return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
              };
            }
            return null;
          } catch {
            return null;
          }
        };

        // Geocode origin and destination (required)
        const [origin, destination] = await Promise.all([
          getCoord(fromCity),
          getCoord(toCity),
        ]);

        if (!origin || !destination) {
          throw new Error('Could not geocode origin or destination');
        }

        setFromCoord(origin);
        setToCoord(destination);

        // Geocode stops individually — failures are skipped gracefully
        const resolvedStops: (Coordinate | null)[] = await Promise.all(
          stops.map(stop => getCoord(stop))
        );
        const validStops = resolvedStops.filter((c): c is Coordinate => c !== null);
        setStopCoords(validStops);

        // Build OSRM waypoints: origin ; validStops... ; destination
        const allWaypoints = [origin, ...validStops, destination];
        const coordString = allWaypoints
          .map(c => `${c.longitude},${c.latitude}`)
          .join(';');

        // Fetch driving route with all waypoints
        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`
        );
        const routeData = await routeRes.json();

        if (routeData.code === 'Ok' && routeData.routes.length > 0) {
          const coordinates = routeData.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => ({
              latitude: coord[1],
              longitude: coord[0],
            })
          );
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
  // Re-fetch if stops change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCity, toCity, stops.join(',')]);

  const [animatedCoords, setAnimatedCoords] = useState<Coordinate[]>([]);

  // Fit map to route when coords are ready and start animation
  useEffect(() => {
    if (mapRef.current && routeCoords.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(routeCoords, {
          edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
          animated: true,
        });
      }, 500);

      let intervalId: NodeJS.Timeout;

      const animationDelayId = setTimeout(() => {
        setAnimatedCoords([]);
        let currentIndex = 0;
        const totalPoints = routeCoords.length;
        const durationMs = 1500;
        const intervalMs = 30;
        const totalSteps = durationMs / intervalMs;
        const pointsPerStep = Math.max(1, Math.ceil(totalPoints / totalSteps));

        intervalId = setInterval(() => {
          currentIndex += pointsPerStep;
          if (currentIndex >= totalPoints) {
            setAnimatedCoords([...routeCoords]);
            clearInterval(intervalId);
          } else {
            setAnimatedCoords(routeCoords.slice(0, currentIndex));
          }
        }, intervalMs);
      }, 1500);

      return () => {
        clearTimeout(animationDelayId);
        if (intervalId) clearInterval(intervalId);
      };
    } else if (mapRef.current && fromCoord && toCoord) {
      const allPoints = fromCoord ? [fromCoord, ...stopCoords, toCoord].filter(Boolean) : [];
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(allPoints, {
          edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
          animated: true,
        });
      }, 500);
    }
    
    return undefined;
  }, [routeCoords, fromCoord, toCoord, stopCoords]);

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
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
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
        {Platform.OS === 'android' && (
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
        )}

        {/* Origin marker */}
        <Marker coordinate={fromCoord} title={fromCity}>
          <View style={[styles.markerContainer, { backgroundColor: colors.interactive.primary }]}>
            <Ionicons name="location" size={16} color="#FFF" />
          </View>
        </Marker>

        {/* Intermediate stop markers */}
        {stopCoords.map((coord, index) => (
          <Marker
            key={`stop-marker-${index}`}
            coordinate={coord}
            title={stops[index] || `Stop ${index + 1}`}
          >
            <View style={[styles.stopMarkerContainer, { backgroundColor: isDark ? '#2E2E4A' : '#FFF', borderColor: brandColors.electricViolet }]}>
              <Text style={[styles.stopMarkerText, { color: brandColors.electricViolet }]}>
                {index + 1}
              </Text>
            </View>
          </Marker>
        ))}

        {/* Destination marker */}
        <Marker coordinate={toCoord} title={toCity}>
          <View style={[styles.markerContainer, { backgroundColor: colors.status.rejectedText }]}>
            <Ionicons name="flag" size={16} color="#FFF" />
          </View>
        </Marker>

        {/* Base faint polyline (full route) */}
        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth={4}
            lineJoin="round"
            lineCap="round"
          />
        )}

        {/* Animated colored polyline */}
        {animatedCoords.length > 1 && (
          <Polyline
            coordinates={animatedCoords}
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
  stopMarkerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  stopMarkerText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-700Bold',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-500Medium',
  },
});
