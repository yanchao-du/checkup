"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ApprovalsService = class ApprovalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findPendingApprovals(clinicId, examType, pageParam, limitParam) {
        const page = Number(pageParam) || 1;
        const limit = Number(limitParam) || 20;
        const where = {
            clinicId,
            status: 'pending_approval',
        };
        if (examType) {
            where.examType = examType;
        }
        const [submissions, total] = await Promise.all([
            this.prisma.medicalSubmission.findMany({
                where,
                include: {
                    createdBy: { select: { name: true } },
                },
                orderBy: { createdDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.medicalSubmission.count({ where }),
        ]);
        return {
            data: submissions.map(s => this.formatSubmission(s)),
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrevious: page > 1,
            },
        };
    }
    async approve(id, doctorId, clinicId, notes) {
        const submission = await this.prisma.medicalSubmission.findUnique({ where: { id } });
        if (!submission) {
            throw new common_1.NotFoundException('Submission not found');
        }
        if (submission.clinicId !== clinicId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (submission.status !== 'pending_approval') {
            throw new common_1.ForbiddenException('Submission is not pending approval');
        }
        const updated = await this.prisma.medicalSubmission.update({
            where: { id },
            data: {
                status: 'submitted',
                approvedById: doctorId,
                approvedDate: new Date(),
                submittedDate: new Date(),
            },
            include: {
                createdBy: { select: { name: true } },
                approvedBy: { select: { name: true } },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                submissionId: id,
                userId: doctorId,
                eventType: 'approved',
                changes: { notes },
            },
        });
        return this.formatSubmission(updated);
    }
    async reject(id, doctorId, clinicId, reason) {
        const submission = await this.prisma.medicalSubmission.findUnique({ where: { id } });
        if (!submission) {
            throw new common_1.NotFoundException('Submission not found');
        }
        if (submission.clinicId !== clinicId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (submission.status !== 'pending_approval') {
            throw new common_1.ForbiddenException('Submission is not pending approval');
        }
        const updated = await this.prisma.medicalSubmission.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectedReason: reason,
            },
            include: {
                createdBy: { select: { name: true } },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                submissionId: id,
                userId: doctorId,
                eventType: 'rejected',
                changes: { reason },
            },
        });
        return this.formatSubmission(updated);
    }
    formatSubmission(submission) {
        return {
            id: submission.id,
            examType: submission.examType,
            patientName: submission.patientName,
            patientNric: submission.patientNric,
            patientDateOfBirth: submission.patientDob.toISOString().split('T')[0],
            status: submission.status,
            createdBy: submission.createdById,
            createdByName: submission.createdBy?.name,
            createdDate: submission.createdDate,
            submittedDate: submission.submittedDate,
            approvedBy: submission.approvedById,
            approvedByName: submission.approvedBy?.name,
            approvedDate: submission.approvedDate,
            rejectedReason: submission.rejectedReason,
            clinicId: submission.clinicId,
            formData: submission.formData,
        };
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map