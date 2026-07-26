/**
 * Typed mobile environment variables.
 *
 * All EXPO_PUBLIC_* variables are read here and exported as a typed object.
 * Dynamically resolves Metro host IP for physical Android devices in development.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const hostUri = Constants.expoConfig?.hostUri;
const devHost = hostUri 
  ? hostUri.split(':')[0] 
  : (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

const defaultApiUrl = `http://${devHost}:5001/api/v1`;

let apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl || apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
  apiUrl = defaultApiUrl;
} else if (__DEV__ && devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') {
  // If running on a physical device, replace localhost/127.0.0.1 with the actual Metro host IP
  apiUrl = apiUrl.replace(/localhost|127\.0\.0\.1/, devHost);
}

const mobileEnv = {
  apiUrl,
} as const;

export default mobileEnv;
