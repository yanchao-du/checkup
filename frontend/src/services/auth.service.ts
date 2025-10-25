import { apiClient } from '../lib/api-client';
import type { LoginRequest, LoginResponse, User } from '../types/api';

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store token and user in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  // Get current user (heartbeat - doesn't refresh session)
  getMeHeartbeat: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me', { isHeartbeat: true });
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
