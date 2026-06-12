/**
 * Axios API client instance.
 *
 * All API calls in the app use this instance — never create an ad-hoc
 * axios instance inside a component or hook.
 *
 * Configuration:
 *   - baseURL from EXPO_PUBLIC_API_URL environment variable
 *   - 10-second request timeout
 *   - Request interceptor: attach Authorization header (stub — wired in auth feature PR)
 *   - Response interceptor: handle 401 token refresh (stub — wired in auth feature PR)
 *
 * Per AGENT_RULES.md §8.2: "API calls must not appear in screen components."
 * Feature services call these helpers; hooks call feature services; screens use hooks.
 */

import axios from 'axios';

import { API } from '../config/constants';
import mobileEnv from '../config/env';

export const apiClient = axios.create({
  baseURL: mobileEnv.apiUrl || 'http://localhost:5000/api/v1',
  timeout: API.REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor ────────────────────────────────────────────────────────
// TODO(feature/auth): attach access token from SecureStore before each request.
// The interceptor structure is wired here so the auth feature only needs to
// fill in the token retrieval logic, not restructure the client.
apiClient.interceptors.request.use(
  (config) => {
    // TODO(feature/auth): const token = await storage.getAccessToken();
    // TODO(feature/auth): if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
// TODO(feature/auth): on 401, attempt token refresh, retry original request.
// TODO(feature/auth): on second 401, clear tokens and redirect to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // TODO(feature/auth): handle 401 token refresh here
    return Promise.reject(error);
  }
);

export default apiClient;
