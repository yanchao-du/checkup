import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';

describe('ApprovalsController', () => {
  let controller: ApprovalsController;
  let service: ApprovalsService;

  const mockUser = {
    id: 'doctor-1',
    email: 'doctor@clinic.sg',
    role: 'doctor',
    clinicId: 'clinic-1',
  };

  const mockApprovalResult = {
    data: [
      {
        id: 'sub-1',
        examType: 'MDW_SIX_MONTHLY',
        patientName: 'John Doe',
        status: 'pending_approval',
        createdBy: 'Nurse Test',
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      totalPages: 1,
      totalItems: 1,
      hasNext: false,
      hasPrevious: false,
    },
  };

  const mockService = {
    findPendingApprovals: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprovalsController],
      providers: [
        {
          provide: ApprovalsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ApprovalsController>(ApprovalsController);
    service = module.get<ApprovalsService>(ApprovalsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findPendingApprovals', () => {
    it('should return pending approvals for clinic', async () => {
      mockService.findPendingApprovals.mockResolvedValue(mockApprovalResult);

      const result = await controller.findPendingApprovals(mockUser, {});

      expect(service.findPendingApprovals).toHaveBeenCalledWith(
        mockUser.clinicId,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockApprovalResult);
    });

    it('should filter by exam type', async () => {
      mockService.findPendingApprovals.mockResolvedValue(mockApprovalResult);

      await controller.findPendingApprovals(mockUser, {
        examType: 'MDW_SIX_MONTHLY',
      });

      expect(service.findPendingApprovals).toHaveBeenCalledWith(
        mockUser.clinicId,
        'MDW_SIX_MONTHLY',
        undefined,
        undefined,
      );
    });

    it('should support pagination', async () => {
      mockService.findPendingApprovals.mockResolvedValue(mockApprovalResult);

      await controller.findPendingApprovals(mockUser, {
        page: 2,
        limit: 10,
      });

      expect(service.findPendingApprovals).toHaveBeenCalledWith(
        mockUser.clinicId,
        undefined,
        2,
        10,
      );
    });
  });

  describe('approve', () => {
    it('should approve a submission', async () => {
      const approvedSubmission = {
        id: 'sub-1',
        status: 'submitted',
        approvedBy: 'Doctor Test',
      };
      mockService.approve.mockResolvedValue(approvedSubmission);

      const result = await controller.approve('sub-1', mockUser, {
        notes: 'Looks good',
      });

      expect(service.approve).toHaveBeenCalledWith(
        'sub-1',
        mockUser.id,
        mockUser.clinicId,
        'Looks good',
      );
      expect(result).toEqual(approvedSubmission);
    });

    it('should approve without notes', async () => {
      const approvedSubmission = {
        id: 'sub-1',
        status: 'submitted',
      };
      mockService.approve.mockResolvedValue(approvedSubmission);

      await controller.approve('sub-1', mockUser, {});

      expect(service.approve).toHaveBeenCalledWith(
        'sub-1',
        mockUser.id,
        mockUser.clinicId,
        undefined,
      );
    });
  });

  describe('reject', () => {
    it('should reject a submission with reason', async () => {
      const rejectedSubmission = {
        id: 'sub-1',
        status: 'rejected',
        approvedBy: 'Doctor Test',
      };
      mockService.reject.mockResolvedValue(rejectedSubmission);

      const result = await controller.reject('sub-1', mockUser, {
        reason: 'Incomplete vital signs',
      });

      expect(service.reject).toHaveBeenCalledWith(
        'sub-1',
        mockUser.id,
        mockUser.clinicId,
        'Incomplete vital signs',
      );
      expect(result).toEqual(rejectedSubmission);
    });

    it('should require rejection reason', async () => {
      mockService.reject.mockResolvedValue({});

      await controller.reject('sub-1', mockUser, {
        reason: 'Required field missing',
      });

      expect(service.reject).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        'Required field missing',
      );
    });
  });
});
