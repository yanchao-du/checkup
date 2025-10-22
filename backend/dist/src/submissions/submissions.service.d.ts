import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto, UpdateSubmissionDto, SubmissionQueryDto } from './dto/submission.dto';
export declare class SubmissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, userRole: string, clinicId: string, dto: CreateSubmissionDto): Promise<{
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
    findAll(userId: string, userRole: string, clinicId: string, query: SubmissionQueryDto): Promise<{
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
    findOne(id: string, userId: string, userRole: string, clinicId: string): Promise<{
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
    update(id: string, userId: string, userRole: string, dto: UpdateSubmissionDto): Promise<{
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
    getAuditTrail(submissionId: string): Promise<{
        submissionId: string;
        events: {
            timestamp: Date;
            eventType: import("@prisma/client").$Enums.EventType;
            userId: string;
            userName: string;
            details: import("@prisma/client/runtime/library").JsonValue;
        }[];
    }>;
    private formatSubmission;
}
