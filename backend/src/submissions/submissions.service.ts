import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto, UpdateSubmissionDto, SubmissionQueryDto } from './dto/submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, userRole: string, clinicId: string, dto: CreateSubmissionDto) {
    // When routeForApproval is explicitly false, it's a draft
    // When routeForApproval is true or undefined, check the logic
    const isDraft = dto.routeForApproval === false;
    
    let status: string;
    if (isDraft) {
      status = 'draft';
    } else if (userRole === 'doctor') {
      status = 'submitted';
    } else if (userRole === 'nurse' && dto.routeForApproval) {
      status = 'pending_approval';
    } else {
      status = 'submitted';
    }

    const submission = await this.prisma.medicalSubmission.create({
      data: {
        examType: dto.examType as any,
        patientName: dto.patientName,
        patientNric: dto.patientNric,
        patientDob: new Date(dto.patientDateOfBirth),
        examinationDate: dto.examinationDate ? new Date(dto.examinationDate) : undefined,
        status: status as any,
        formData: dto.formData,
        clinicId,
        createdById: userId,
        assignedDoctorId: dto.assignedDoctorId,
        submittedDate: status === 'submitted' ? new Date() : undefined,
        approvedById: status === 'submitted' && userRole === 'doctor' ? userId : undefined,
        approvedDate: status === 'submitted' && userRole === 'doctor' ? new Date() : undefined,
      },
      include: {
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        assignedDoctor: { select: { name: true } },
      },
    });

    // Create audit log
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

  async findAll(userId: string, userRole: string, clinicId: string, query: SubmissionQueryDto) {
    const { status, examType, patientName, patientNric, fromDate, toDate } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    
    const where: any = {
      status: { not: 'draft' },
    };

    // Role-based filtering
    if (userRole === 'admin') {
      where.clinicId = clinicId;
    } else {
      where.OR = [
        { createdById: userId },
        { approvedById: userId },
      ];
    }

    // Apply filters
    if (status) where.status = status;
    if (examType) where.examType = examType;
    if (patientName) where.patientName = { contains: patientName, mode: 'insensitive' };
    if (patientNric) where.patientNric = patientNric;
    if (fromDate || toDate) {
      where.createdDate = {};
      if (fromDate) where.createdDate.gte = new Date(fromDate);
      if (toDate) where.createdDate.lte = new Date(toDate);
    }

    // For drafts, order by most recently updated; for others, order by created date
    const orderBy = status === 'draft' 
      ? { updatedAt: 'desc' as const }
      : { createdDate: 'desc' as const };

    const [submissions, total] = await Promise.all([
      this.prisma.medicalSubmission.findMany({
        where,
        include: {
          createdBy: { select: { name: true } },
          approvedBy: { select: { name: true } },
          assignedDoctor: { select: { name: true } },
        },
        orderBy,
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

  async findRejectedSubmissions(userId: string, clinicId: string, query: SubmissionQueryDto) {
    const { examType } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;

    const where: any = {
      clinicId,
      status: 'rejected',
      createdById: userId, // Nurses see only their own rejected submissions
    };

    if (examType) {
      where.examType = examType;
    }

    const [submissions, total] = await Promise.all([
      this.prisma.medicalSubmission.findMany({
        where,
        include: {
          createdBy: { select: { name: true } },
          assignedDoctor: { select: { name: true } },
          approvedBy: { select: { name: true } }, // This will be the rejector
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

  async findOne(id: string, userId: string, userRole: string, clinicId: string) {
    const submission = await this.prisma.medicalSubmission.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        assignedDoctor: { select: { name: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check access - user must be admin, creator, approver, or from same clinic
    if (userRole !== 'admin' && 
        submission.createdById !== userId && 
        submission.approvedById !== userId &&
        submission.clinicId !== clinicId) {
      throw new ForbiddenException('Access denied');
    }

    return this.formatSubmission(submission);
  }

  async update(id: string, userId: string, userRole: string, dto: UpdateSubmissionDto) {
    const existing = await this.prisma.medicalSubmission.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Submission not found');
    }

    if (existing.createdById !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    if (existing.status === 'submitted') {
      throw new ForbiddenException('Cannot edit submitted submission');
    }

    const submission = await this.prisma.medicalSubmission.update({
      where: { id },
      data: {
        ...(dto.examType && { examType: dto.examType as any }),
        ...(dto.patientName && { patientName: dto.patientName }),
        ...(dto.patientNric && { patientNric: dto.patientNric }),
        ...(dto.patientDateOfBirth && { patientDob: new Date(dto.patientDateOfBirth) }),
        ...(dto.examinationDate && { examinationDate: new Date(dto.examinationDate) }),
        ...(dto.formData && { formData: dto.formData }),
        ...(dto.assignedDoctorId !== undefined && { assignedDoctorId: dto.assignedDoctorId }),
      },
      include: {
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        assignedDoctor: { select: { name: true } },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        submissionId: id,
        userId,
        eventType: 'updated',
        changes: dto as any,
      },
    });

    return this.formatSubmission(submission);
  }

  async submitForApproval(id: string, userId: string, userRole: string) {
    const existing = await this.prisma.medicalSubmission.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Submission not found');
    }

    if (existing.createdById !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    if (existing.status !== 'draft') {
      throw new ForbiddenException('Only drafts can be submitted for approval');
    }

    const submission = await this.prisma.medicalSubmission.update({
      where: { id },
      data: {
        status: 'pending_approval',
        submittedDate: new Date(),
      },
      include: {
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        assignedDoctor: { select: { name: true } },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        submissionId: id,
        userId,
        eventType: 'submitted',
        changes: { 
          status: 'pending_approval',
          assignedDoctorName: submission.assignedDoctor?.name,
        },
      },
    });

    return this.formatSubmission(submission);
  }

  async reopenSubmission(id: string, userId: string, userRole: string) {
    const existing = await this.prisma.medicalSubmission.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Submission not found');
    }

    if (existing.createdById !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Access denied: You can only reopen your own submissions');
    }

    if (existing.status !== 'rejected') {
      throw new ForbiddenException('Only rejected submissions can be reopened');
    }

    const submission = await this.prisma.medicalSubmission.update({
      where: { id },
      data: {
        status: 'draft',
        // Keep rejectedReason and approvedById so doctors can still see it in their rejected list
        // rejectedReason: null,  // Don't clear - keep for history
        // approvedById: null,    // Don't clear - keep to track who rejected it
        approvedDate: null,
      },
      include: {
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        assignedDoctor: { select: { name: true } },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        submissionId: id,
        userId,
        eventType: 'updated',
        changes: { 
          action: 'reopened',
          previousStatus: 'rejected',
          newStatus: 'draft',
        },
      },
    });

    return this.formatSubmission(submission);
  }

  async getAuditTrail(submissionId: string) {
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

  private formatSubmission(submission: any) {
    return {
      id: submission.id,
      examType: submission.examType,
      patientName: submission.patientName,
      patientNric: submission.patientNric,
      patientDateOfBirth: submission.patientDob.toISOString().split('T')[0],
      examinationDate: submission.examinationDate ? submission.examinationDate.toISOString().split('T')[0] : null,
      status: submission.status,
      createdBy: submission.createdById,
      createdByName: submission.createdBy?.name,
      createdDate: submission.createdDate,
      submittedDate: submission.submittedDate,
      approvedBy: submission.approvedById,
      approvedByName: submission.approvedBy?.name,
      approvedDate: submission.approvedDate,
      assignedDoctorId: submission.assignedDoctorId,
      assignedDoctorName: submission.assignedDoctor?.name,
      rejectedReason: submission.rejectedReason,
      clinicId: submission.clinicId,
      formData: submission.formData,
    };
  }
}
