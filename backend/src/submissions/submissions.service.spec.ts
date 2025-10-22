import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto, UpdateSubmissionDto } from './dto/submission.dto';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let prismaService: PrismaService;

  const mockSubmission = {
    id: 'sub-1',
    examType: 'MDW_SIX_MONTHLY',
    patientName: 'John Doe',
    patientNric: 'S1234567A',
    patientDob: new Date('1990-01-01'),
    status: 'pending_approval',
    formData: {
      height: 170,
      weight: 70,
      bloodPressure: '120/80',
    },
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
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSubmissionDto = {
      examType: 'MDW_SIX_MONTHLY',
      patientName: 'John Doe',
      patientNric: 'S1234567A',
      patientDateOfBirth: '1990-01-01',
      formData: {
        height: 170,
        weight: 70,
        bloodPressure: '120/80',
      },
      routeForApproval: true,
    };

    it('should create submission with pending_approval status for nurse', async () => {
      mockPrismaService.medicalSubmission.create.mockResolvedValue(mockSubmission);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await service.create('user-1', 'nurse', 'clinic-1', createDto);

      expect(prismaService.medicalSubmission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            examType: 'MDW_SIX_MONTHLY',
            patientName: 'John Doe',
            status: 'pending_approval',
            clinicId: 'clinic-1',
            createdById: 'user-1',
          }),
          include: expect.any(Object),
        }),
      );
      expect(prismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should create submission with submitted status for doctor', async () => {
      const doctorSubmission = { ...mockSubmission, status: 'submitted' };
      mockPrismaService.medicalSubmission.create.mockResolvedValue(doctorSubmission);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await service.create('user-2', 'doctor', 'clinic-1', createDto);

      expect(prismaService.medicalSubmission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'submitted',
            approvedById: 'user-2',
          }),
        }),
      );
    });

    it('should create audit log entry', async () => {
      mockPrismaService.medicalSubmission.create.mockResolvedValue(mockSubmission);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await service.create('user-1', 'nurse', 'clinic-1', createDto);

      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          submissionId: mockSubmission.id,
          userId: 'user-1',
          eventType: 'created',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated submissions for nurse', async () => {
      mockPrismaService.medicalSubmission.findMany.mockResolvedValue([mockSubmission]);
      mockPrismaService.medicalSubmission.count.mockResolvedValue(1);

      const result = await service.findAll('user-1', 'nurse', 'clinic-1', {});

      expect(prismaService.medicalSubmission.findMany).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should filter by status', async () => {
      mockPrismaService.medicalSubmission.findMany.mockResolvedValue([mockSubmission]);
      mockPrismaService.medicalSubmission.count.mockResolvedValue(1);

      await service.findAll('user-1', 'nurse', 'clinic-1', {
        status: 'pending_approval',
      });

      expect(prismaService.medicalSubmission.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return submission by id', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(mockSubmission);

      const result = await service.findOne('sub-1', 'user-1', 'nurse', 'clinic-1');

      expect(prismaService.medicalSubmission.findUnique).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('invalid-id', 'user-1', 'nurse', 'clinic-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSubmissionDto = {
      formData: {
        height: 175,
        weight: 75,
      },
    };

    it('should update submission', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.medicalSubmission.update.mockResolvedValue({
        ...mockSubmission,
        ...updateDto,
      });
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await service.update('sub-1', 'user-1', 'nurse', updateDto);

      expect(prismaService.medicalSubmission.update).toHaveBeenCalled();
      expect(prismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', 'user-1', 'nurse', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for submitted submissions', async () => {
      const submittedSubmission = { ...mockSubmission, status: 'submitted' };
      mockPrismaService.medicalSubmission.findUnique.mockResolvedValue(submittedSubmission);

      await expect(
        service.update('sub-1', 'user-1', 'nurse', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
