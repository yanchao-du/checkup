import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto, UpdateSubmissionDto, SubmissionQueryDto } from './dto/submission.dto';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

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

    // Create audit log(s)
    // Always create a 'created' event for draft creation
    await this.prisma.auditLog.create({
      data: {
        submissionId: submission.id,
        userId,
        eventType: 'created',
        changes: { 
          status: 'draft', 
          examType: dto.examType,
        },
      },
    });

    // If created with pending_approval status, also create a 'submitted' event for routing
    if (status === 'pending_approval') {
      await this.prisma.auditLog.create({
        data: {
          submissionId: submission.id,
          userId,
          eventType: 'submitted',
          changes: { 
            status: 'pending_approval',
            ...(submission.assignedDoctor && {
              assignedDoctorName: submission.assignedDoctor.name,
            }),
          },
        },
      });
    }

    return this.formatSubmission(submission);
  }

  async findAll(userId: string, userRole: string, clinicId: string, query: SubmissionQueryDto) {
    const { status, examType, patientName, patientNric, fromDate, toDate, includeDeleted } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    
    const where: any = {};

    // Only admins can see deleted drafts, and only if they explicitly request them for drafts
    if (status === 'draft') {
      if (userRole === 'admin' && includeDeleted) {
        // Admins requesting deleted drafts: show all drafts (deleted and not deleted)
        // Do not filter deletedAt
      } else {
        // Everyone else: only show non-deleted drafts
        where.deletedAt = null;
      }
      where.status = 'draft';
    } else {
      // For non-draft submissions, always exclude deleted
      where.deletedAt = null;
      if (status) where.status = status;
      else where.status = { not: 'draft' };
    }

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

    // Non-admins cannot access soft-deleted submissions
    if (submission.deletedAt && userRole !== 'admin') {
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
    this.logger.log(`Updating submission ${id}`);
    
    const existing = await this.prisma.medicalSubmission.findUnique({ where: { id } });

    if (!existing) {
      this.logger.warn(`Submission ${id} not found`);
      throw new NotFoundException('Submission not found');
    }

    this.logger.debug(`Existing submission status: ${existing.status}, rejectedReason: ${existing.rejectedReason ? 'present' : 'null'}, approvedById: ${existing.approvedById || 'null'}`);

    if (existing.createdById !== userId && userRole !== 'admin') {
      this.logger.warn(`Access denied for user ${userId} to update submission ${id} (creator: ${existing.createdById})`);
      throw new ForbiddenException('Access denied');
    }

    // Allow editing drafts and pending_approval, but not submitted submissions
    // Rejected submissions that have been reopened will have status='draft'
    if (existing.status === 'submitted') {
      this.logger.warn(`Cannot edit submitted submission ${id}`);
      throw new ForbiddenException('Cannot edit submitted submissions');
    }

    // Note: Drafts with rejectedReason and approvedById (reopened rejections) CAN be edited
    // They have status='draft' so they pass the above check

    this.logger.log(`Proceeding with update for submission ${id} (status: ${existing.status})`);

    try {
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

      this.logger.log(`Successfully updated submission ${id}`);
      return this.formatSubmission(submission);
    } catch (error) {
      this.logger.error('Error updating submission', {
        error: error.message,
        stack: error.stack,
        submissionId: id,
        existingStatus: existing.status,
        existingRejectedReason: existing.rejectedReason,
        existingApprovedById: existing.approvedById,
        dto,
      });
      throw error;
    }
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

    // Doctors submit directly to 'submitted' status
    // Nurses submit to 'pending_approval' status
    const status = userRole === 'doctor' ? 'submitted' : 'pending_approval';

    const submission = await this.prisma.medicalSubmission.update({
      where: { id },
      data: {
        status: status as any,
        submittedDate: new Date(),
        // If doctor, auto-approve
        ...(userRole === 'doctor' && {
          approvedById: userId,
          approvedDate: new Date(),
        }),
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
          status,
          ...(status === 'pending_approval' && submission.assignedDoctor && {
            assignedDoctorName: submission.assignedDoctor.name,
          }),
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

  async delete(id: string, userId: string, userRole: string) {
    const existing = await this.prisma.medicalSubmission.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Submission not found');
    }

    // Only allow deleting drafts
    if (existing.status !== 'draft') {
      throw new ForbiddenException('Only draft submissions can be deleted');
    }

    // Only creator or admin can delete
    if (existing.createdById !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Access denied: You can only delete your own drafts');
    }

    const deletionTime = new Date();

    // Soft delete: set deletedAt timestamp
    await this.prisma.medicalSubmission.update({
      where: { id },
      data: {
        deletedAt: deletionTime,
      } as any,
    });

    // Create audit log for deletion
    await this.prisma.auditLog.create({
      data: {
        submissionId: id,
        userId,
        eventType: 'deleted',
        changes: { 
          status: existing.status,
          patientName: existing.patientName,
          examType: existing.examType,
          deletedAt: deletionTime.toISOString(),
        },
      },
    });

    this.logger.log(`Soft deleted draft submission ${id} by user ${userId}`);

    return { success: true, message: 'Draft deleted successfully' };
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
      deletedAt: submission.deletedAt,
      clinicId: submission.clinicId,
      formData: submission.formData,
    };
  }
}
