/**
 * Axios API client with token injection and refresh retry handling.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearSession, getAccessToken, setAccessToken } from '@/shared/auth/session';

// Base API URL used by the frontend HTTP client.
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Axios instance configured for JSON APIs and credentialed requests.
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for refresh tokens
});

// Attaches the access token to outgoing requests when present.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handles token refresh on 401 responses and retries the original request.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const token = getAccessToken();

    // Only refresh when the user still has an active local session.
    if (error.response?.status === 401 && token && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        setAccessToken(accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        clearSession();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
