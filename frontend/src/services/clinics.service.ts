import { apiClient } from '../lib/api-client';
import type {
  Clinic,
  CreateClinicRequest,
  UpdateClinicRequest,
  PaginatedResponse,
  ClinicUser,
} from '../types/api';

export const clinicsApi = {
  /**
   * Get all clinics with pagination
   */
  getAll: async (page = 1, limit = 20): Promise<PaginatedResponse<Clinic>> => {
    const queryString = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    }).toString();
    
    return apiClient.get<PaginatedResponse<Clinic>>(`/clinics?${queryString}`);
  },

  /**
   * Get clinic by ID (includes assigned doctors)
   */
  getById: async (id: string): Promise<Clinic> => {
    return apiClient.get<Clinic>(`/clinics/${id}`);
  },

  /**
   * Get all doctors at a specific clinic
   */
  getDoctors: async (clinicId: string): Promise<ClinicUser[]> => {
    return apiClient.get<ClinicUser[]>(`/clinics/${clinicId}/doctors`);
  },

  /**
   * Create a new clinic (Admin only)
   */
  create: async (data: CreateClinicRequest): Promise<Clinic> => {
    return apiClient.post<Clinic>('/clinics', data);
  },

  /**
   * Update clinic details (Admin only)
   */
  update: async (id: string, data: UpdateClinicRequest): Promise<Clinic> => {
    return apiClient.put<Clinic>(`/clinics/${id}`, data);
  },

  /**
   * Delete clinic (Admin only)
   * Note: Cannot delete clinics with assigned users
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/clinics/${id}`);
  },
};
