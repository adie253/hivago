import axios from "axios";
import { getAccessToken, getOrPerformTokenRefresh, clearAuthSession } from "../data/api";

const rawUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for data handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await getOrPerformTokenRefresh();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        console.error("Axios interceptor token refresh failed", err);
      }
      
      // If refresh failed, clear session and logout
      clearAuthSession();
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
    
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);
