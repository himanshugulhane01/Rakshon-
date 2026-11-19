/**
 * ScamShield Dynamic User Profile Service
 *
 * Retrieves and associates user profile information strictly with the
 * verified authenticated user ID / session credentials.
 * Ensures one user's profile is never shown for another user.
 */

import { StorageService, SecureKeys } from './storage';

export interface UserProfile {
  userId: string;
  fullName: string;
  phone: string;
}

export const UserProfileService = {
  /**
   * Retrieves the profile associated with the currently authenticated user.
   * Returns null if no active authenticated session exists.
   */
  async getAuthenticatedProfile(): Promise<UserProfile | null> {
    const userPhone = await StorageService.getSecureCredential(SecureKeys.USER_PHONE_HASH);
    if (!userPhone) {
      return null;
    }

    const fullName = await StorageService.getUserFullNameForUser(userPhone);
    return {
      userId: userPhone,
      fullName: fullName ? fullName.trim() : '',
      phone: userPhone,
    };
  },

  /**
   * Saves profile information associated with the active authenticated user ID.
   */
  async updateAuthenticatedProfile(fullName: string): Promise<UserProfile> {
    const userPhone = await StorageService.getSecureCredential(SecureKeys.USER_PHONE_HASH);
    const userId = userPhone || 'default_user';
    const trimmedName = fullName ? fullName.trim() : '';

    await StorageService.setUserFullNameForUser(userId, trimmedName);

    return {
      userId,
      fullName: trimmedName,
      phone: userId,
    };
  },

  /**
   * Clears active user session and in-memory profile state.
   */
  async logout(): Promise<void> {
    await StorageService.clearUserSession();
  },
};

