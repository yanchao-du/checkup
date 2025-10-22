export declare class CreateSubmissionDto {
    examType: string;
    patientName: string;
    patientNric: string;
    patientDateOfBirth: string;
    formData: Record<string, any>;
    routeForApproval?: boolean;
}
export declare class UpdateSubmissionDto {
    patientName?: string;
    patientNric?: string;
    patientDateOfBirth?: string;
    formData?: Record<string, any>;
}
export declare class SubmissionQueryDto {
    status?: string;
    examType?: string;
    patientName?: string;
    patientNric?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
