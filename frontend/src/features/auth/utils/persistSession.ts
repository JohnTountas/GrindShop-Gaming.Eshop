/**
 * Persists session details for authenticated users.
 */
import { setSession } from '@/shared/auth/session';
import type { AuthResponse } from '@/shared/types';

// Stores auth tokens and user metadata for later requests.
export function persistSession(response: AuthResponse) {
  setSession(response.accessToken, response.user);
}

