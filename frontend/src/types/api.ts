// User Types
export type UserRole = 'doctor' | 'nurse' | 'admin';

export interface ClinicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLoginAt?: string;
  createdAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: ClinicUser;
}

// Exam Types
export type ExamType = 'SIX_MONTHLY_MDW' | 'WORK_PERMIT' | 'AGED_DRIVERS';
export type SubmissionStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'submitted' 
  | 'rejected' 
  | 'revision_requested';

// Submission Types
export interface MedicalSubmission {
  id: string;
  examType: ExamType;
  patientName: string;
  patientNric: string;
  patientDob: string;
  status: SubmissionStatus;
  formData: Record<string, any>;
  clinicId: string;
  createdById: string;
  createdBy: string;
  createdDate: string;
  submittedDate?: string;
  approvedById?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
}

export interface CreateSubmissionRequest {
  examType: ExamType;
  patientName: string;
  patientNric: string;
  patientDateOfBirth: string;
  formData: Record<string, any>;
  routeForApproval?: boolean;
}

export interface UpdateSubmissionRequest {
  patientName?: string;
  patientNric?: string;
  patientDateOfBirth?: string;
  formData?: Record<string, any>;
}

export interface SubmissionQueryParams {
  status?: SubmissionStatus;
  examType?: ExamType;
  patientName?: string;
  patientNric?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
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

// Approval Types
export interface ApprovalQueryParams {
  examType?: ExamType;
  page?: number;
  limit?: number;
}

export interface ApproveRequest {
  notes?: string;
}

export interface RejectRequest {
  reason: string;
}

// User Management Types (Admin only)
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  clinicId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
}

// Audit Log Types
export interface AuditLog {
  id: string;
  submissionId: string;
  userId: string;
  userName: string;
  eventType: string;
  changes: Record<string, any>;
  createdAt: string;
}
