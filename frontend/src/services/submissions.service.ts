import { apiClient } from '../lib/api-client';
import type {
  MedicalSubmission,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  SubmissionQueryParams,
  PaginatedResponse,
  AuditLog,
  AssignSubmissionRequest,
} from '../types/api';

export const submissionsApi = {
  // Get all submissions
  getAll: async (params?: SubmissionQueryParams): Promise<PaginatedResponse<MedicalSubmission>> => {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    const endpoint = queryString ? `/submissions?${queryString}` : '/submissions';
    return apiClient.get<PaginatedResponse<MedicalSubmission>>(endpoint);
  },

  // Get single submission
  getById: async (id: string): Promise<MedicalSubmission> => {
    return apiClient.get<MedicalSubmission>(`/submissions/${id}`);
  },

  // Create submission
  create: async (data: CreateSubmissionRequest): Promise<MedicalSubmission> => {
    return apiClient.post<MedicalSubmission>('/submissions', data);
  },

  // Update submission
  update: async (id: string, data: UpdateSubmissionRequest): Promise<MedicalSubmission> => {
    return apiClient.put<MedicalSubmission>(`/submissions/${id}`, data);
  },

  // Get drafts
  getDrafts: async (params?: SubmissionQueryParams & { includeDeleted?: boolean }): Promise<PaginatedResponse<MedicalSubmission>> => {
    const queryParams = { ...params, status: 'draft' as const };
    return submissionsApi.getAll(queryParams);
  },

  // Get rejected submissions (for nurses)
  getRejected: async (params?: SubmissionQueryParams): Promise<PaginatedResponse<MedicalSubmission>> => {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    const endpoint = queryString ? `/submissions/rejected?${queryString}` : '/submissions/rejected';
    return apiClient.get<PaginatedResponse<MedicalSubmission>>(endpoint);
  },

  // Get submission history (audit logs)
  getHistory: async (id: string): Promise<AuditLog[]> => {
    return apiClient.get<AuditLog[]>(`/submissions/${id}/history`);
  },

  // Submit draft for approval
  submitForApproval: async (id: string): Promise<MedicalSubmission> => {
    return apiClient.post<MedicalSubmission>(`/submissions/${id}/submit`);
  },

  // Reopen rejected submission (convert back to draft)
  reopenSubmission: async (id: string): Promise<MedicalSubmission> => {
    return apiClient.post<MedicalSubmission>(`/submissions/${id}/reopen`);
  },

  // Delete a draft submission
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/submissions/${id}`);
  },

  // Collaborative Draft Methods

  // Get submissions assigned to current user
  getAssignedToMe: async (): Promise<MedicalSubmission[]> => {
    return apiClient.get<MedicalSubmission[]>('/submissions/assigned-to-me');
  },

  // Assign submission to doctor or nurse
  assignSubmission: async (id: string, data: AssignSubmissionRequest): Promise<MedicalSubmission> => {
    return apiClient.post<MedicalSubmission>(`/submissions/${id}/assign`, data);
  },

  // Claim an assigned submission
  claimSubmission: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(`/submissions/${id}/claim`);
  },

  // Submit collaborative draft to agency (doctor only)
  submitCollaborativeDraft: async (id: string): Promise<MedicalSubmission> => {
    return apiClient.post<MedicalSubmission>(`/submissions/${id}/submit-collaborative`);
  },
};
