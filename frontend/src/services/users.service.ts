import { apiClient } from '../lib/api-client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
} from '../types/api';

export const usersApi = {
  // Get all users (Admin only)
  getAll: async (page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const queryString = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    }).toString();
    
    return apiClient.get<PaginatedResponse<User>>(`/users?${queryString}`);
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // Create user (Admin only)
  create: async (data: CreateUserRequest): Promise<User> => {
    return apiClient.post<User>('/users', data);
  },

  // Update user (Admin only)
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  // Delete user (Admin only)
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/users/${id}`);
  },

  // Change user role (Admin only)
  changeRole: async (id: string, role: 'doctor' | 'nurse' | 'admin'): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, { role });
  },

  // Change user status (Admin only)
  changeStatus: async (id: string, status: 'active' | 'inactive'): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, { status });
  },
};
