/**
 * SecureStore wrapper for token storage.
 *
 * Per ARCHITECTURE.md §10 security checklist:
 *   "Tokens stored in SecureStore on mobile (not AsyncStorage)"
 *
 * All token read/write operations go through this module.
 * Never store tokens in AsyncStorage, Zustand, or component state.
 */

import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '../config/constants';

export const storage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async getUserId(): Promise<string | null> {
    return SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
  },

  async setUserId(id: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, id);
  },

  /**
   * Clears all auth tokens. Called on logout.
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID),
    ]);
  },
};
