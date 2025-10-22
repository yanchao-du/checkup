import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async findPendingApprovals(clinicId: string, examType?: string, pageParam?: number, limitParam?: number) {
    const page = Number(pageParam) || 1;
    const limit = Number(limitParam) || 20;
    
    const where: any = {
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

  async approve(id: string, doctorId: string, clinicId: string, notes?: string) {
    const submission = await this.prisma.medicalSubmission.findUnique({ where: { id } });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.clinicId !== clinicId) {
      throw new ForbiddenException('Access denied');
    }

    if (submission.status !== 'pending_approval') {
      throw new ForbiddenException('Submission is not pending approval');
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

    // Audit log
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

  async reject(id: string, doctorId: string, clinicId: string, reason: string) {
    const submission = await this.prisma.medicalSubmission.findUnique({ where: { id } });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.clinicId !== clinicId) {
      throw new ForbiddenException('Access denied');
    }

    if (submission.status !== 'pending_approval') {
      throw new ForbiddenException('Submission is not pending approval');
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

    // Audit log
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

  private formatSubmission(submission: any) {
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
}
