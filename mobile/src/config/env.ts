/**
 * Typed mobile environment variables.
 *
 * All EXPO_PUBLIC_* variables are read here and exported as a typed object.
 * App code imports from this module — never accesses process.env directly.
 *
 * Per ARCHITECTURE.md §8.2 — all mobile env vars are EXPO_PUBLIC_* prefixed.
 * Non-EXPO_PUBLIC_ vars are not accessible in the React Native bundle.
 */

function requirePublicEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    // In development, log a warning; in production the app will fail gracefully
    // when the API call fails (network error) rather than crashing at startup.
    console.warn(`[config] Missing public environment variable: ${key}`);
    return '';
  }
  return value;
}

const mobileEnv = {
  apiUrl: requirePublicEnv('EXPO_PUBLIC_API_URL'),
  googlePlacesKey: requirePublicEnv('EXPO_PUBLIC_GOOGLE_PLACES_KEY'),
} as const;

export default mobileEnv;
