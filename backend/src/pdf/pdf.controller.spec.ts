import { Test, TestingModule } from '@nestjs/testing';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Response } from 'express';
import { ExamType } from '@prisma/client';

describe('PdfController', () => {
  let controller: PdfController;
  let pdfService: PdfService;
  let submissionsService: SubmissionsService;

  const mockPdfService = {
    generateSubmissionPdf: jest.fn(),
  };

  const mockSubmissionsService = {
    findOne: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { id: 'user-1', role: 'doctor' };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfController],
      providers: [
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
        {
          provide: SubmissionsService,
          useValue: mockSubmissionsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<PdfController>(PdfController);
    pdfService = module.get<PdfService>(PdfService);
    submissionsService = module.get<SubmissionsService>(SubmissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('downloadPdf', () => {
    const mockSubmission = {
      id: 'submission-1',
      examType: ExamType.SIX_MONTHLY_MDW,
      status: 'submitted',
      patientName: 'John Doe',
      submittedDate: new Date(),
      createdDate: new Date(),
      clinic: { name: 'Test Clinic' },
      createdBy: { name: 'Dr. Smith' },
    };

    const mockPdfBuffer = Buffer.from('PDF content');
    const mockUser = { userId: 'user-1', role: 'doctor', clinicId: 'clinic-1' };

    let mockResponse: Partial<Response>;
    let mockRequest: any;

    beforeEach(() => {
      mockResponse = {
        setHeader: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      mockRequest = {
        user: mockUser,
      };
    });

    it('should generate and return PDF for valid submission', async () => {
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('submission-1', mockRequest, mockResponse as Response);

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', mockUser.userId, mockUser.role, mockUser.clinicId);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalledWith(mockSubmission);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="submission-submission-1.pdf"');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Length', mockPdfBuffer.length);
      expect(mockResponse.send).toHaveBeenCalledWith(mockPdfBuffer);
    });

    it('should throw NotFoundException for non-existent submission', async () => {
      mockSubmissionsService.findOne.mockRejectedValue(
        new Error('Submission not found')
      );

      await expect(
        controller.downloadPdf('non-existent', mockRequest, mockResponse as Response)
      ).rejects.toThrow();

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('non-existent', mockUser.userId, mockUser.role, mockUser.clinicId);
      expect(mockPdfService.generateSubmissionPdf).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      mockSubmissionsService.findOne.mockRejectedValue(
        new Error('You do not have permission to access this submission')
      );

      await expect(
        controller.downloadPdf('submission-1', mockRequest, mockResponse as Response)
      ).rejects.toThrow();

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', mockUser.userId, mockUser.role, mockUser.clinicId);
      expect(mockPdfService.generateSubmissionPdf).not.toHaveBeenCalled();
    });

    it('should handle PDF generation errors', async () => {
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockRejectedValue(
        new Error('PDF generation failed')
      );

      await expect(
        controller.downloadPdf('submission-1', mockRequest, mockResponse as Response)
      ).rejects.toThrow('PDF generation failed');

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', mockUser.userId, mockUser.role, mockUser.clinicId);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalledWith(mockSubmission);
    });

    it('should set correct filename with submission ID', async () => {
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('test-id-123', mockRequest, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="submission-test-id-123.pdf"');
    });

    it('should set correct Content-Length', async () => {
      const largePdfBuffer = Buffer.alloc(50000);
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(largePdfBuffer);

      await controller.downloadPdf('submission-1', mockRequest, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Length', 50000);
    });

    it('should work for admin user accessing any clinic submission', async () => {
      const adminUser = { userId: 'admin-1', role: 'admin', clinicId: 'clinic-1' };
      const adminRequest = { user: adminUser };
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('submission-1', adminRequest, mockResponse as Response);

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', adminUser.userId, adminUser.role, adminUser.clinicId);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalled();
    });

    it('should work for doctor accessing their approved submission', async () => {
      const doctorUser = { userId: 'doctor-1', role: 'doctor', clinicId: 'clinic-1' };
      const doctorRequest = { user: doctorUser };
      const doctorSubmission = {
        ...mockSubmission,
        approvedById: 'doctor-1',
      };
      mockSubmissionsService.findOne.mockResolvedValue(doctorSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('submission-1', doctorRequest, mockResponse as Response);

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', doctorUser.userId, doctorUser.role, doctorUser.clinicId);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalled();
    });

    it('should work for nurse accessing their created submission', async () => {
      const nurseUser = { userId: 'nurse-1', role: 'nurse', clinicId: 'clinic-1' };
      const nurseRequest = { user: nurseUser };
      const nurseSubmission = {
        ...mockSubmission,
        createdById: 'nurse-1',
      };
      mockSubmissionsService.findOne.mockResolvedValue(nurseSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('submission-1', nurseRequest, mockResponse as Response);

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', nurseUser.userId, nurseUser.role, nurseUser.clinicId);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalled();
    });
  });
});
