import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto, UpdateSubmissionDto, SubmissionQueryDto } from './dto/submission.dto';
export declare class SubmissionsController {
    private submissionsService;
    constructor(submissionsService: SubmissionsService);
    findAll(user: any, query: SubmissionQueryDto): Promise<{
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
    create(user: any, dto: CreateSubmissionDto): Promise<{
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
    findOne(id: string, user: any): Promise<{
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
    update(id: string, user: any, dto: UpdateSubmissionDto): Promise<{
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
