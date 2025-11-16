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
    const mockUser = { id: 'user-1', role: 'doctor' };

    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
    });

    it('should generate and return PDF for valid submission', async () => {
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('submission-1', mockUser as any, mockResponse as Response);

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', mockUser);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalledWith(mockSubmission);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="submission-submission-1.pdf"',
        'Content-Length': mockPdfBuffer.length,
      });
      expect(mockResponse.send).toHaveBeenCalledWith(mockPdfBuffer);
    });

    it('should throw NotFoundException for non-existent submission', async () => {
      mockSubmissionsService.findOne.mockRejectedValue(
        new Error('Submission not found')
      );

      await expect(
        controller.downloadPdf('non-existent', mockUser as any, mockResponse as Response)
      ).rejects.toThrow();

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('non-existent', mockUser);
      expect(mockPdfService.generateSubmissionPdf).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      mockSubmissionsService.findOne.mockRejectedValue(
        new Error('You do not have permission to access this submission')
      );

      await expect(
        controller.downloadPdf('submission-1', mockUser as any, mockResponse as Response)
      ).rejects.toThrow();

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', mockUser);
      expect(mockPdfService.generateSubmissionPdf).not.toHaveBeenCalled();
    });

    it('should handle PDF generation errors', async () => {
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockRejectedValue(
        new Error('PDF generation failed')
      );

      await expect(
        controller.downloadPdf('submission-1', mockUser as any, mockResponse as Response)
      ).rejects.toThrow('PDF generation failed');

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', mockUser);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalledWith(mockSubmission);
    });

    it('should set correct filename with submission ID', async () => {
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('test-id-123', mockUser as any, mockResponse as Response);

      expect(mockResponse.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Disposition': 'attachment; filename="submission-test-id-123.pdf"',
        })
      );
    });

    it('should set correct Content-Length', async () => {
      const largePdfBuffer = Buffer.alloc(50000);
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(largePdfBuffer);

      await controller.downloadPdf('submission-1', mockUser as any, mockResponse as Response);

      expect(mockResponse.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Length': 50000,
        })
      );
    });

    it('should work for admin user accessing any clinic submission', async () => {
      const adminUser = { id: 'admin-1', role: 'admin' };
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('submission-1', adminUser as any, mockResponse as Response);

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', adminUser);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalled();
    });

    it('should work for doctor accessing their approved submission', async () => {
      const doctorUser = { id: 'doctor-1', role: 'doctor' };
      const doctorSubmission = {
        ...mockSubmission,
        approvedById: 'doctor-1',
      };
      mockSubmissionsService.findOne.mockResolvedValue(doctorSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('submission-1', doctorUser as any, mockResponse as Response);

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', doctorUser);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalled();
    });

    it('should work for nurse accessing their created submission', async () => {
      const nurseUser = { id: 'nurse-1', role: 'nurse' };
      const nurseSubmission = {
        ...mockSubmission,
        createdById: 'nurse-1',
      };
      mockSubmissionsService.findOne.mockResolvedValue(nurseSubmission);
      mockPdfService.generateSubmissionPdf.mockResolvedValue(mockPdfBuffer);

      await controller.downloadPdf('submission-1', nurseUser as any, mockResponse as Response);

      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith('submission-1', nurseUser);
      expect(mockPdfService.generateSubmissionPdf).toHaveBeenCalled();
    });
  });
});
