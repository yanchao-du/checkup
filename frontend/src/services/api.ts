// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3344/v1';

// Types
export type UserRole = 'doctor' | 'nurse' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  nric?: string;
  role: UserRole;
  clinicId: string;
  clinicName: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type ExamType = 'SIX_MONTHLY_MDW' | 'WORK_PERMIT' | 'AGED_DRIVERS';
export type SubmissionStatus = 'draft' | 'pending_approval' | 'submitted' | 'rejected';

export interface MedicalSubmission {
  id: string;
  examType: ExamType;
  patientName: string;
  patientNric: string;
  patientDateOfBirth: string;
  status: SubmissionStatus;
  formData: Record<string, any>;
  createdBy: string;
  createdDate: string;
  submittedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
}

export interface CreateSubmissionDto {
  examType: ExamType;
  patientName: string;
  patientNric: string;
  patientDateOfBirth: string;
  formData: Record<string, any>;
  routeForApproval?: boolean;
}

export interface UpdateSubmissionDto {
  patientName?: string;
  patientNric?: string;
  patientDateOfBirth?: string;
  formData?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// API Error
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper to make authenticated requests
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    let errorData;
    
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Response might not be JSON
    }

    throw new ApiError(response.status, errorMessage, errorData);
  }

  return response;
}

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        error.message || 'Login failed',
        error
      );
    }

    const data: LoginResponse = await response.json();
    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  async getMe(): Promise<User> {
    const response = await fetchWithAuth('/auth/me');
    return response.json();
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};

// Submissions API
export const submissionsApi = {
  async create(data: CreateSubmissionDto): Promise<MedicalSubmission> {
    const response = await fetchWithAuth('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAll(params?: {
    status?: SubmissionStatus;
    examType?: ExamType;
    patientName?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MedicalSubmission>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetchWithAuth(
      `/submissions?${queryParams.toString()}`
    );
    return response.json();
  },

  async getById(id: string): Promise<MedicalSubmission> {
    const response = await fetchWithAuth(`/submissions/${id}`);
    return response.json();
  },

  async update(
    id: string,
    data: UpdateSubmissionDto
  ): Promise<MedicalSubmission> {
    const response = await fetchWithAuth(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getDrafts(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MedicalSubmission>> {
    const queryParams = new URLSearchParams({ status: 'draft' });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetchWithAuth(
      `/submissions?${queryParams.toString()}`
    );
    return response.json();
  },
};

// Approvals API
export const approvalsApi = {
  async getPending(params?: {
    examType?: ExamType;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MedicalSubmission>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetchWithAuth(
      `/approvals?${queryParams.toString()}`
    );
    return response.json();
  },

  async approve(id: string, notes?: string): Promise<MedicalSubmission> {
    const response = await fetchWithAuth(`/approvals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    return response.json();
  },

  async reject(id: string, reason: string): Promise<MedicalSubmission> {
    const response = await fetchWithAuth(`/approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },
};

// Export a combined API object
export const api = {
  auth: authApi,
  submissions: submissionsApi,
  approvals: approvalsApi,
};

export default api;
