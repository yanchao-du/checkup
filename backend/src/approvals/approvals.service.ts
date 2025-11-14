import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async findPendingApprovals(
    clinicId: string, 
    doctorId: string,
    examType?: string,
    page: number = 1,
    limit: number = 50
  ) {
    const where: any = {
      clinicId,
      status: 'pending_approval',
      assignedDoctorId: doctorId, // Only show submissions assigned to this doctor
    };

    if (examType) {
      where.examType = examType;
    }

    // Ensure page/limit are sane numbers (in case controller passed strings or NaN)
    const pageNum = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 50;

    const [submissions, total] = await Promise.all([
      this.prisma.medicalSubmission.findMany({
        where,
        include: {
          createdBy: { select: { name: true } },
          assignedDoctor: { select: { name: true } },
        },
        orderBy: { createdDate: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.medicalSubmission.count({ where }),
    ]);

    return {
      data: submissions.map(s => this.formatSubmission(s)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrevious: pageNum > 1,
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

    // Determine agency based on exam type
    const agency = updated.examType === 'AGED_DRIVERS' 
      ? 'Singapore Police Force' 
      : 'Ministry of Manpower';

    // Create audit logs for both approval and agency submission
    await this.prisma.auditLog.createMany({
      data: [
        {
          submissionId: id,
          userId: doctorId,
          eventType: 'approved',
          changes: { notes },
        },
        {
          submissionId: id,
          userId: doctorId,
          eventType: 'submitted',
          changes: { 
            status: 'submitted',
            agency,
          },
        },
      ],
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
        approvedById: doctorId, // Track who rejected it (reusing approvedById field)
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
        eventType: 'rejected',
        changes: { reason },
      },
    });

    return this.formatSubmission(updated);
  }

  async findRejectedSubmissions(
    clinicId: string,
    doctorId: string,
    examType?: string,
    page: number = 1,
    limit: number = 50
  ) {
    const where: any = {
      clinicId,
      // Show submissions that are currently rejected OR were rejected and reopened (draft with rejectedReason)
      OR: [
        {
          status: 'rejected',
          OR: [
            { assignedDoctorId: doctorId },
            { approvedById: doctorId },
          ],
        },
        {
          // Reopened submissions: status is draft but has rejectedReason and approvedById
          status: 'draft',
          rejectedReason: { not: null },
          approvedById: doctorId,
        },
      ],
    };

    if (examType) {
      where.examType = examType;
    }

    const pageNum = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 50;

    const [submissions, total] = await Promise.all([
      this.prisma.medicalSubmission.findMany({
        where,
        include: {
          createdBy: { select: { name: true } },
          assignedDoctor: { select: { name: true } },
          approvedBy: { select: { name: true } },
        },
        orderBy: { createdDate: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.medicalSubmission.count({ where }),
    ]);

    return {
      data: submissions.map(s => this.formatSubmission(s)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrevious: pageNum > 1,
      },
    };
  }

  private formatSubmission(submission: any) {
    return {
      id: submission.id,
      examType: submission.examType,
      patientName: submission.patientName,
      patientNric: submission.patientNric,
      patientPassportNo: submission.patientPassportNo,
      // patientDob may occasionally be null; guard against calling toISOString on null
      patientDateOfBirth: submission.patientDob ? submission.patientDob.toISOString().split('T')[0] : null,
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
