import { apiClient } from '../lib/api-client';
import type {
  MedicalSubmission,
  ApprovalQueryParams,
  PaginatedResponse,
  ApproveRequest,
  RejectRequest,
} from '../types/api';

export const approvalsApi = {
  // Get pending approvals (returns submissions with pending_approval status)
  getPending: async (params?: ApprovalQueryParams): Promise<PaginatedResponse<MedicalSubmission>> => {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    const endpoint = queryString ? `/approvals/pending?${queryString}` : '/approvals/pending';
    return apiClient.get<PaginatedResponse<MedicalSubmission>>(endpoint);
  },

  // Get all approvals
  getAll: async (params?: ApprovalQueryParams): Promise<PaginatedResponse<MedicalSubmission>> => {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    const endpoint = queryString ? `/approvals?${queryString}` : '/approvals';
    return apiClient.get<PaginatedResponse<MedicalSubmission>>(endpoint);
  },

  // Approve submission
  approve: async (id: string, data?: ApproveRequest): Promise<MedicalSubmission> => {
    return apiClient.post<MedicalSubmission>(`/approvals/${id}/approve`, data || {});
  },

  // Reject submission
  reject: async (id: string, data: RejectRequest): Promise<MedicalSubmission> => {
    return apiClient.post<MedicalSubmission>(`/approvals/${id}/reject`, data);
  },

  // Get approval by ID (returns the submission)
  getById: async (id: string): Promise<MedicalSubmission> => {
    return apiClient.get<MedicalSubmission>(`/approvals/${id}`);
  },
};
