import { apiClient } from '../lib/api-client';
import type {
  ClinicUser,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
} from '../types/api';

export const usersApi = {
  // Get all users (Admin only)
  getAll: async (page = 1, limit = 20): Promise<PaginatedResponse<ClinicUser>> => {
    const queryString = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    }).toString();
    
    return apiClient.get<PaginatedResponse<ClinicUser>>(`/users?${queryString}`);
  },

  // Get user by ID
  getById: async (id: string): Promise<ClinicUser> => {
    return apiClient.get<ClinicUser>(`/users/${id}`);
  },

  // Create user (Admin only)
  create: async (data: CreateUserRequest): Promise<ClinicUser> => {
    return apiClient.post<ClinicUser>('/users', data);
  },

  // Update user (Admin only)
  update: async (id: string, data: UpdateUserRequest): Promise<ClinicUser> => {
    return apiClient.put<ClinicUser>(`/users/${id}`, data);
  },

  // Delete user (Admin only)
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/users/${id}`);
  },

  // Change user role (Admin only)
  changeRole: async (id: string, role: 'doctor' | 'nurse' | 'admin'): Promise<ClinicUser> => {
    return apiClient.put<ClinicUser>(`/users/${id}`, { role });
  },

  // Change user status (Admin only)
  changeStatus: async (id: string, status: 'active' | 'inactive'): Promise<ClinicUser> => {
    return apiClient.put<ClinicUser>(`/users/${id}`, { status });
  },
};
