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
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubmissionsService = class SubmissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, userRole, clinicId, dto) {
        const routeForApproval = dto.routeForApproval !== false;
        const status = userRole === 'doctor' || !routeForApproval
            ? 'submitted'
            : 'pending_approval';
        const submission = await this.prisma.medicalSubmission.create({
            data: {
                examType: dto.examType,
                patientName: dto.patientName,
                patientNric: dto.patientNric,
                patientDob: new Date(dto.patientDateOfBirth),
                status: status,
                formData: dto.formData,
                clinicId,
                createdById: userId,
                submittedDate: status === 'submitted' ? new Date() : undefined,
                approvedById: status === 'submitted' ? userId : undefined,
                approvedDate: status === 'submitted' ? new Date() : undefined,
            },
            include: {
                createdBy: { select: { name: true } },
                approvedBy: { select: { name: true } },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                submissionId: submission.id,
                userId,
                eventType: 'created',
                changes: { status, examType: dto.examType },
            },
        });
        return this.formatSubmission(submission);
    }
    async findAll(userId, userRole, clinicId, query) {
        const { status, examType, patientName, patientNric, fromDate, toDate } = query;
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const where = {
            status: { not: 'draft' },
        };
        if (userRole === 'admin') {
            where.clinicId = clinicId;
        }
        else {
            where.OR = [
                { createdById: userId },
                { approvedById: userId },
            ];
        }
        if (status)
            where.status = status;
        if (examType)
            where.examType = examType;
        if (patientName)
            where.patientName = { contains: patientName, mode: 'insensitive' };
        if (patientNric)
            where.patientNric = patientNric;
        if (fromDate || toDate) {
            where.createdDate = {};
            if (fromDate)
                where.createdDate.gte = new Date(fromDate);
            if (toDate)
                where.createdDate.lte = new Date(toDate);
        }
        const [submissions, total] = await Promise.all([
            this.prisma.medicalSubmission.findMany({
                where,
                include: {
                    createdBy: { select: { name: true } },
                    approvedBy: { select: { name: true } },
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
    async findOne(id, userId, userRole, clinicId) {
        const submission = await this.prisma.medicalSubmission.findUnique({
            where: { id },
            include: {
                createdBy: { select: { name: true } },
                approvedBy: { select: { name: true } },
            },
        });
        if (!submission) {
            throw new common_1.NotFoundException('Submission not found');
        }
        if (userRole !== 'admin' &&
            submission.createdById !== userId &&
            submission.approvedById !== userId &&
            submission.clinicId !== clinicId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.formatSubmission(submission);
    }
    async update(id, userId, userRole, dto) {
        const existing = await this.prisma.medicalSubmission.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Submission not found');
        }
        if (existing.createdById !== userId && userRole !== 'admin') {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (existing.status === 'submitted') {
            throw new common_1.ForbiddenException('Cannot edit submitted submission');
        }
        const submission = await this.prisma.medicalSubmission.update({
            where: { id },
            data: {
                ...(dto.patientName && { patientName: dto.patientName }),
                ...(dto.patientNric && { patientNric: dto.patientNric }),
                ...(dto.patientDateOfBirth && { patientDob: new Date(dto.patientDateOfBirth) }),
                ...(dto.formData && { formData: dto.formData }),
            },
            include: {
                createdBy: { select: { name: true } },
                approvedBy: { select: { name: true } },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                submissionId: id,
                userId,
                eventType: 'updated',
                changes: dto,
            },
        });
        return this.formatSubmission(submission);
    }
    async getAuditTrail(submissionId) {
        const logs = await this.prisma.auditLog.findMany({
            where: { submissionId },
            include: { user: { select: { name: true } } },
            orderBy: { timestamp: 'desc' },
        });
        return {
            submissionId,
            events: logs.map(log => ({
                timestamp: log.timestamp,
                eventType: log.eventType,
                userId: log.userId,
                userName: log.user.name,
                details: log.changes,
            })),
        };
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
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map