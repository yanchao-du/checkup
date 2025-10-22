import { PrismaService } from '../prisma/prisma.service';
export declare class ApprovalsService {
    private prisma;
    constructor(prisma: PrismaService);
    findPendingApprovals(clinicId: string, examType?: string, pageParam?: number, limitParam?: number): Promise<{
        data: {
            id: any;
            examType: any;
            patientName: any;
            patientNric: any;
            patientDateOfBirth: any;
            status: any;
            createdBy: any;
            createdByName: any;
            createdDate: any;
            submittedDate: any;
            approvedBy: any;
            approvedByName: any;
            approvedDate: any;
            rejectedReason: any;
            clinicId: any;
            formData: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            totalPages: number;
            totalItems: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
    }>;
    approve(id: string, doctorId: string, clinicId: string, notes?: string): Promise<{
        id: any;
        examType: any;
        patientName: any;
        patientNric: any;
        patientDateOfBirth: any;
        status: any;
        createdBy: any;
        createdByName: any;
        createdDate: any;
        submittedDate: any;
        approvedBy: any;
        approvedByName: any;
        approvedDate: any;
        rejectedReason: any;
        clinicId: any;
        formData: any;
    }>;
    reject(id: string, doctorId: string, clinicId: string, reason: string): Promise<{
        id: any;
        examType: any;
        patientName: any;
        patientNric: any;
        patientDateOfBirth: any;
        status: any;
        createdBy: any;
        createdByName: any;
        createdDate: any;
        submittedDate: any;
        approvedBy: any;
        approvedByName: any;
        approvedDate: any;
        rejectedReason: any;
        clinicId: any;
        formData: any;
    }>;
    private formatSubmission;
}
