import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { apiClient } from '../api/client';
import logger from './logger';

export const LOCATION_TASK_NAME = 'CREWMUTE_BACKGROUND_LOCATION_TASK';

// Define the background location task globally at top-level
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: { data: any; error: any }) => {
  if (error) {
    logger.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const location = locations[0];
      const { latitude, longitude } = location.coords;
      logger.info(`Background location ping: ${latitude}, ${longitude}`);

      try {
        await apiClient.post('/rides/live-location', {
          latitude,
          longitude,
        });
      } catch (e: any) {
        logger.error('Failed to post background location update:', e.message);
      }
    }
  }
});

export async function startBackgroundLocationTracking() {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      logger.warn('Foreground location permission denied.');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      logger.warn('Background location permission denied.');
    }

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 15000, // Every 15 seconds
        distanceInterval: 50, // Every 50 meters
        showsBackgroundLocationIndicator: true, // Blue status bar on iOS
        foregroundService: {
          notificationTitle: 'Crewmute Active Journey',
          notificationBody: 'Broadcasting your live trip location for passenger safety.',
          notificationColor: '#6C5CE7',
        },
      });
      logger.info('Background location tracking started successfully.');
    }
    return true;
  } catch (err: any) {
    logger.error('Failed to start background location tracking:', err.message);
    return false;
  }
}

export async function stopBackgroundLocationTracking() {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      logger.info('Background location tracking stopped.');
    }
  } catch (err: any) {
    logger.error('Failed to stop background location tracking:', err.message);
  }
}
