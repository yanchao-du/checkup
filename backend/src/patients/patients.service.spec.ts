import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PatientsService - Test Requirements Extraction', () => {
  let service: PatientsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useValue: {
            medicalSubmission: {
              findFirst: jest.fn(),
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('lookupByNric - Test Requirements', () => {
    it('should extract all test requirements when all are present', async () => {
      const mockSubmission = {
        patientNric: 'F1234567A',
        patientName: 'Test Patient',
        examinationDate: new Date('2025-04-15'),
        formData: {
          height: '165',
          weight: '58',
          hivTestRequired: 'true',
          chestXrayRequired: 'true',
        },
      };

      jest.spyOn(prisma.medicalSubmission, 'findFirst').mockResolvedValue(mockSubmission as any);

      const result = await service.lookupByNric('F1234567A');

      expect(result).toEqual({
        nric: 'F1234567A',
        name: 'Test Patient',
        lastHeight: '165',
        lastWeight: '58',
        lastExamDate: '2025-04-15',
        requiredTests: {
          pregnancy: true,
          syphilis: true,
          hiv: true,
          chestXray: true,
        },
      });
    });

    it('should set hiv and chestXray to false when not required', async () => {
      const mockSubmission = {
        patientNric: 'F1234567A',
        patientName: 'Test Patient',
        examinationDate: new Date('2025-04-15'),
        formData: {
          height: '165',
          weight: '58',
          // No hivTestRequired or chestXrayRequired fields
        },
      };

      jest.spyOn(prisma.medicalSubmission, 'findFirst').mockResolvedValue(mockSubmission as any);

      const result = await service.lookupByNric('F1234567A');

      expect(result?.requiredTests).toEqual({
        pregnancy: true,
        syphilis: true,
        hiv: false,
        chestXray: false,
      });
    });

    it('should handle only HIV test required', async () => {
      const mockSubmission = {
        patientNric: 'F1234567A',
        patientName: 'Test Patient',
        examinationDate: new Date('2025-04-15'),
        formData: {
          hivTestRequired: 'true',
          // No chestXrayRequired
        },
      };

      jest.spyOn(prisma.medicalSubmission, 'findFirst').mockResolvedValue(mockSubmission as any);

      const result = await service.lookupByNric('F1234567A');

      expect(result?.requiredTests).toEqual({
        pregnancy: true,
        syphilis: true,
        hiv: true,
        chestXray: false,
      });
    });

    it('should handle only Chest X-ray required', async () => {
      const mockSubmission = {
        patientNric: 'F1234567A',
        patientName: 'Test Patient',
        examinationDate: new Date('2025-04-15'),
        formData: {
          chestXrayRequired: 'true',
          // No hivTestRequired
        },
      };

      jest.spyOn(prisma.medicalSubmission, 'findFirst').mockResolvedValue(mockSubmission as any);

      const result = await service.lookupByNric('F1234567A');

      expect(result?.requiredTests).toEqual({
        pregnancy: true,
        syphilis: true,
        hiv: false,
        chestXray: true,
      });
    });

    it('should return null for non-existent patient', async () => {
      jest.spyOn(prisma.medicalSubmission, 'findFirst').mockResolvedValue(null);

      const result = await service.lookupByNric('F9999999Z');

      expect(result).toBeNull();
    });

    it('should handle empty formData', async () => {
      const mockSubmission = {
        patientNric: 'F1234567A',
        patientName: 'Test Patient',
        examinationDate: new Date('2025-04-15'),
        formData: {},
      };

      jest.spyOn(prisma.medicalSubmission, 'findFirst').mockResolvedValue(mockSubmission as any);

      const result = await service.lookupByNric('F1234567A');

      expect(result?.requiredTests).toEqual({
        pregnancy: true,
        syphilis: true,
        hiv: false,
        chestXray: false,
      });
    });
  });
});
