/**
 * Client-side session persistence helpers for tokens and user metadata.
 */
import { useSyncExternalStore } from 'react';
import type { User } from '@/shared/types';

const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const AUTH_SESSION_EVENT = 'auth:session-changed';

interface SessionSnapshot {
  accessToken: string | null;
  user: User | null;
}

let cachedSnapshot: SessionSnapshot | null = null;
let cachedAccessToken: string | null = null;
let cachedUserRaw: string | null = null;

function hasLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function notifySessionChanged() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

function parseStoredUser(raw: string | null): User | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    if (hasLocalStorage()) {
      localStorage.removeItem(USER_KEY);
    }
    return null;
  }
}

function getSessionSnapshot(): SessionSnapshot {
  if (!hasLocalStorage()) {
    if (cachedSnapshot) {
      return cachedSnapshot;
    }

    cachedSnapshot = {
      accessToken: null,
      user: null,
    };
    return cachedSnapshot;
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  if (cachedSnapshot && accessToken === cachedAccessToken && userRaw === cachedUserRaw) {
    return cachedSnapshot;
  }

  const user = parseStoredUser(userRaw);
  const normalizedUserRaw = localStorage.getItem(USER_KEY);

  cachedAccessToken = accessToken;
  cachedUserRaw = normalizedUserRaw;
  cachedSnapshot = {
    accessToken,
    user,
  };

  return cachedSnapshot;
}

function subscribeToSession(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(AUTH_SESSION_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

// Reads and safely parses the persisted user payload from local storage.
export function getStoredUser(): User | null {
  return getSessionSnapshot().user;
}

// Reads the persisted access token for API requests and auth checks.
export function getAccessToken(): string | null {
  return getSessionSnapshot().accessToken;
}

// Checks whether an access token exists for guarded route decisions.
export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

// Stores a fresh access token while keeping the current user metadata intact.
export function setAccessToken(accessToken: string): void {
  if (!hasLocalStorage()) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  notifySessionChanged();
}

// Stores the authenticated session payload after login or registration.
export function setSession(accessToken: string, user: User): void {
  if (!hasLocalStorage()) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySessionChanged();
}

// Clears all persisted auth artifacts during logout or token failure flows.
export function clearSession(): void {
  if (!hasLocalStorage()) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifySessionChanged();
}

// Reactive auth snapshot used by components and hooks that render session state.
export function useAuthSession() {
  const snapshot = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getSessionSnapshot
  );

  return {
    authed: Boolean(snapshot.accessToken),
    user: snapshot.user,
  };
}

