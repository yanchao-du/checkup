import { apiClient } from '../lib/api-client';
import type {
  ClinicUser,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  DoctorClinic,
  AssignDoctorToClinicRequest,
  Clinic,
} from '../types/api';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  mcrNumber?: string;
}

export const usersApi = {
  // Get list of doctors (for assignment)
  getDoctors: async (): Promise<Doctor[]> => {
    return apiClient.get<Doctor[]>('/users/doctors/list');
  },

  // Get list of nurses (for assignment)
  getNurses: async (): Promise<Doctor[]> => {
    return apiClient.get<Doctor[]>('/users/nurses/list');
  },

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

  // Get default doctor (Nurse only)
  getDefaultDoctor: async (): Promise<{ defaultDoctorId: string | null; defaultDoctor: Doctor | null }> => {
    return apiClient.get('/users/me/default-doctor');
  },

  // Set default doctor (Nurse only)
  setDefaultDoctor: async (defaultDoctorId: string): Promise<{ message: string; defaultDoctorId: string | null; defaultDoctor: Doctor | null }> => {
    return apiClient.put('/users/me/default-doctor', { defaultDoctorId });
  },

  // Doctor-Clinic Relationship Management (Admin only)
  
  /**
   * Get all clinics for a specific doctor
   */
  getDoctorClinics: async (doctorId: string): Promise<Clinic[]> => {
    return apiClient.get<Clinic[]>(`/users/${doctorId}/clinics`);
  },

  /**
   * Assign a doctor to a clinic
   */
  assignDoctorToClinic: async (
    doctorId: string, 
    data: AssignDoctorToClinicRequest
  ): Promise<DoctorClinic> => {
    return apiClient.post<DoctorClinic>(`/users/${doctorId}/clinics`, data);
  },

  /**
   * Remove a doctor from a clinic
   * Note: Cannot remove if it's the doctor's only clinic
   */
  removeDoctorFromClinic: async (
    doctorId: string, 
    clinicId: string
  ): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${doctorId}/clinics/${clinicId}`);
  },

  /**
   * Set a clinic as the primary clinic for a doctor
   */
  setPrimaryClinic: async (
    doctorId: string, 
    clinicId: string
  ): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(
      `/users/${doctorId}/clinics/${clinicId}/primary`,
      {}
    );
  },

  // Nurse-Clinic Relationship Management (Admin only)
  
  /**
   * Get all clinics for a specific nurse
   */
  getNurseClinics: async (nurseId: string): Promise<Clinic[]> => {
    return apiClient.get<Clinic[]>(`/users/${nurseId}/nurse-clinics`);
  },

  /**
   * Assign a nurse to a clinic
   */
  assignNurseToClinic: async (
    nurseId: string, 
    data: AssignDoctorToClinicRequest
  ): Promise<DoctorClinic> => {
    return apiClient.post<DoctorClinic>(`/users/${nurseId}/nurse-clinics`, data);
  },

  /**
   * Remove a nurse from a clinic
   * Note: Cannot remove if it's the nurse's only clinic
   */
  removeNurseFromClinic: async (
    nurseId: string, 
    clinicId: string
  ): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${nurseId}/nurse-clinics/${clinicId}`);
  },

  /**
   * Set a clinic as the primary clinic for a nurse
   */
  setNursePrimaryClinic: async (
    nurseId: string, 
    clinicId: string
  ): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(
      `/users/${nurseId}/nurse-clinics/${clinicId}/primary`,
      {}
    );
  },
};
