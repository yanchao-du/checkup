// User Types
export type UserRole = 'doctor' | 'nurse' | 'admin';

// Clinic Types
export interface Clinic {
  id: string;
  name: string;
  hciCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  registrationNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

// User's associated clinic (for dropdown selection)
export interface UserClinic {
  id: string;
  name: string;
  hciCode?: string | null;
  phone?: string | null;
  address?: string | null;
  isPrimary: boolean;
}

export interface DoctorClinic {
  doctorId: string;
  clinicId: string;
  isPrimary: boolean;
  clinic?: Clinic;
  doctor?: ClinicUser;
}

export interface NurseClinic {
  nurseId: string;
  clinicId: string;
  isPrimary: boolean;
  clinic?: Clinic;
  nurse?: ClinicUser;
}

export interface ClinicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  mcrNumber?: string; // Medical Council Registration number (for doctors)
  clinicId?: string; // Primary clinic ID (legacy field)
  lastLoginAt?: string;
  createdAt: string;
  // Many-to-many relationships
  clinics?: (DoctorClinic | NurseClinic)[]; // For doctors/nurses: list of clinics they work at
  primaryClinic?: Clinic; // For doctors/nurses: their primary clinic
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
export type ExamType = 
  | 'SIX_MONTHLY_MDW' 
  | 'SIX_MONTHLY_FMW' 
  | 'WORK_PERMIT' 
  | 'AGED_DRIVERS'
  | 'PR_MEDICAL'
  | 'STUDENT_PASS_MEDICAL'
  | 'LTVP_MEDICAL'
  | 'DRIVING_LICENCE_TP'
  | 'DRIVING_VOCATIONAL_TP_LTA'
  | 'VOCATIONAL_LICENCE_LTA';
export type SubmissionStatus = 
  | 'draft' 
  | 'in_progress'
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
  patientDateOfBirth: string;
  patientEmail?: string;
  patientMobile?: string;
  drivingLicenseClass?: string;
  examinationDate?: string;
  status: SubmissionStatus;
  formData: Record<string, any>;
  clinicId: string;
  clinicName?: string;
  clinicHciCode?: string;
  clinicPhone?: string;
  createdById: string;
  createdBy: string;
  createdByName?: string;
  createdByMcrNumber?: string;
  createdDate: string;
  submittedDate?: string;
  approvedById?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedByMcrNumber?: string;
  approvedDate?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedDoctorMcrNumber?: string;
  // Collaborative draft fields
  assignedToId?: string;
  assignedToName?: string;
  assignedToRole?: UserRole;
  assignedAt?: string;
  assignedById?: string;
  assignedByName?: string;
  assignedByRole?: UserRole;
  createdByRole?: UserRole;
  rejectedReason?: string;
  deletedAt?: string;
}

export interface CreateSubmissionRequest {
  examType: ExamType;
  patientName: string;
  patientNric: string;
  patientDateOfBirth?: string;
  patientEmail?: string;
  patientMobile?: string;
  drivingLicenseClass?: string;
  examinationDate?: string;
  formData: Record<string, any>;
  routeForApproval?: boolean;
  assignedDoctorId?: string;
  clinicId?: string;
  assignTo?: string; // User ID to assign collaborative draft to
}

export interface UpdateSubmissionRequest {
  patientName?: string;
  patientNric?: string;
  patientDateOfBirth?: string;
  patientEmail?: string;
  patientMobile?: string;
  drivingLicenseClass?: string;
  examinationDate?: string;
  formData?: Record<string, any>;
  assignedDoctorId?: string;
  clinicId?: string;
  assignTo?: string; // User ID to assign/reassign collaborative draft to
}

// Collaborative Draft Types
export interface AssignSubmissionRequest {
  assignToId: string; // User ID to assign to
  note?: string; // Optional note about the assignment
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
  mcrNumber?: string; // Required for doctors
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
  mcrNumber?: string;
}

// Clinic Management Types (Admin only)
export interface CreateClinicRequest {
  name: string;
  hciCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  registrationNumber?: string;
}

export interface UpdateClinicRequest {
  name?: string;
  hciCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  registrationNumber?: string;
}

// Doctor-Clinic Assignment Types
export interface AssignDoctorToClinicRequest {
  clinicId: string;
  isPrimary?: boolean;
}

export interface SetPrimaryClinicRequest {
  clinicId: string;
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
