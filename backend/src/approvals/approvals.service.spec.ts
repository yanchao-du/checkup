import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ApprovalsService', () => {
  let service: ApprovalsService;
  let prismaService: PrismaService;

  const mockSubmission = {
    id: 'sub-1',
    examType: 'MDW_SIX_MONTHLY',
    patientName: 'John Doe',
    patientNric: 'S1234567A',
    patientDob: new Date('1990-01-01'),
    status: 'pending_approval',
    formData: {},
    clinicId: 'clinic-1',
    createdById: 'user-1',
    createdDate: new Date(),
    submittedDate: null,
    approvedById: null,
    approvedDate: null,
    createdBy: { name: 'Nurse Test' },
    approvedBy: null,
  };

  const mockPrismaService = {
    medicalSubmission: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ApprovalsService>(ApprovalsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPendingApprovals', () => {
    it('should return paginated pending approvals for assigned doctor', async () => {
      mockPrismaService.medicalSubmission.findMany.mockResolvedValue([mockSubmission]);
      mockPrismaService.medicalSubmission.count.mockResolvedValue(1);

      const result = await service.findPendingApprovals('clinic-1', 'doctor-1');

      expect(prismaService.medicalSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            clinicId: 'clinic-1',
            status: 'pending_approval',
            assignedDoctorId: 'doctor-1',
          },
          include: expect.any(Object),
          orderBy: { createdDate: 'desc' },
        }),
      );
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
    });

    it('should filter by exam type and assigned doctor', async () => {
      mockPrismaService.medicalSubmission.findMany.mockResolvedValue([mockSubmission]);
      mockPrismaService.medicalSubmission.count.mockResolvedValue(1);

      await service.findPendingApprovals('clinic-1', 'doctor-1', 'MDW_SIX_MONTHLY');

      expect(prismaService.medicalSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            clinicId: 'clinic-1',
            status: 'pending_approval',
            assignedDoctorId: 'doctor-1',
            examType: 'MDW_SIX_MONTHLY',
          },
        }),
      );
    });

    it('should support pagination', async () => {
      mockPrismaService.medicalSubmission.findMany.mockResolvedValue([mockSubmission]);
      mockPrismaService.medicalSubmission.count.mockResolvedValue(50);

      const result = await service.findPendingApprovals('clinic-1', 'doctor-1', undefined, 2, 10);

      expect(prismaService.medicalSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(5);
    });
  });

  describe('approve', () => {
    it('should approve a pending submission', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.medicalSubmission.update.mockResolvedValue({
        ...mockSubmission,
        status: 'submitted',
        approvedById: 'doctor-1',
      });
  mockPrismaService.auditLog.createMany.mockResolvedValue({});

      const result = await service.approve('sub-1', 'doctor-1', 'clinic-1');

      expect(prismaService.medicalSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: expect.objectContaining({
            status: 'submitted',
            approvedById: 'doctor-1',
            approvedDate: expect.any(Date),
            submittedDate: expect.any(Date),
          }),
        }),
      );
      expect(prismaService.auditLog.createMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(null);

      await expect(
        service.approve('invalid-id', 'doctor-1', 'clinic-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for wrong clinic', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(mockSubmission);

      await expect(
        service.approve('sub-1', 'doctor-1', 'wrong-clinic'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if not pending approval', async () => {
      const submittedSubmission = { ...mockSubmission, status: 'submitted' };
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(submittedSubmission);

      await expect(
        service.approve('sub-1', 'doctor-1', 'clinic-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create audit log on approval', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.medicalSubmission.update.mockResolvedValue({
        ...mockSubmission,
        status: 'submitted',
      });
      mockPrismaService.auditLog.createMany.mockResolvedValue({});

      await service.approve('sub-1', 'doctor-1', 'clinic-1', 'Looks good');

      expect(prismaService.auditLog.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              submissionId: 'sub-1',
              userId: 'doctor-1',
              eventType: 'approved',
            }),
          ]),
        }),
      );
    });
  });

  describe('reject', () => {
    it('should reject a pending submission with reason', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.medicalSubmission.update.mockResolvedValue({
        ...mockSubmission,
        status: 'rejected',
      });
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.reject('sub-1', 'doctor-1', 'clinic-1', 'Incomplete data');

      expect(prismaService.medicalSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: expect.objectContaining({
            status: 'rejected',
            rejectedReason: 'Incomplete data',
          }),
        }),
      );
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(null);

      await expect(
        service.reject('invalid-id', 'doctor-1', 'clinic-1', 'reason'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create audit log on rejection', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.medicalSubmission.update.mockResolvedValue({
        ...mockSubmission,
        status: 'rejected',
      });
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await service.reject('sub-1', 'doctor-1', 'clinic-1', 'Incomplete data');

      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          submissionId: 'sub-1',
          userId: 'doctor-1',
          eventType: 'rejected',
          changes: expect.objectContaining({
            reason: 'Incomplete data',
          }),
        }),
      });
    });
  });
});
