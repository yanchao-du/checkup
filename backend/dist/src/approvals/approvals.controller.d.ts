import { ApprovalsService } from './approvals.service';
import { ApprovalQueryDto, ApproveDto, RejectDto } from './dto/approval.dto';
export declare class ApprovalsController {
    private approvalsService;
    constructor(approvalsService: ApprovalsService);
    findPendingApprovals(user: any, query: ApprovalQueryDto): Promise<{
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
    approve(id: string, user: any, dto: ApproveDto): Promise<{
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
    reject(id: string, user: any, dto: RejectDto): Promise<{
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
}
