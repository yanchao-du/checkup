import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PatientInfo {
  nric: string;
  name: string;
  gender?: string;
  lastHeight?: string;
  lastWeight?: string;
  lastExamDate?: string;
  requiredTests?: {
    pregnancy: boolean;
    syphilis: boolean;
    hiv: boolean;
    chestXray: boolean;
  };
}

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Lookup patient information by NRIC/FIN from the most recent submission
   */
  async lookupByNric(nric: string): Promise<PatientInfo | null> {
    if (!nric || nric.length < 9) {
      return null;
    }

    const cleanNric = nric.trim().toUpperCase();

    // Find the most recent submission for this NRIC
    const submission = await this.prisma.medicalSubmission.findFirst({
      where: {
        patientNric: cleanNric,
        deletedAt: null,
      },
      orderBy: {
        examinationDate: 'desc',
      },
      select: {
        patientName: true,
        patientNric: true,
        examinationDate: true,
        formData: true,
      },
    });

    if (!submission || !submission.patientNric) {
      return null;
    }

    // Extract height and weight from formData if available
    const formData = submission.formData as any;
    const lastHeight = formData?.height?.toString() || undefined;
    const lastWeight = formData?.weight?.toString() || undefined;
    const lastExamDate = submission.examinationDate?.toISOString().split('T')[0] || undefined;
    const gender = formData?.gender || undefined;

    // Extract test requirements from formData
    // Pregnancy and Syphilis are always required for MDW/FMW exams
    // HIV and Chest X-ray requirements are stored in formData
    const requiredTests = {
      pregnancy: true,
      syphilis: true,
      hiv: formData?.hivTestRequired === 'true',
      chestXray: formData?.chestXrayRequired === 'true',
    };

    return {
      nric: submission.patientNric,
      name: submission.patientName,
      gender,
      lastHeight,
      lastWeight,
      lastExamDate,
      requiredTests,
    };
  }

  /**
   * Get a random test FIN from the seeded patient data
   * This is used for displaying test FINs to users for exam types that support lookup
   */
  async getRandomTestFin(examType?: string): Promise<{ fin: string; name: string } | null> {
    // Determine which patient pool to use based on exam type
    let idPrefix: string;
    if (examType === 'FULL_MEDICAL_EXAM') {
      // For FME, use both male and female patients
      const useMale = Math.random() < 0.5;
      idPrefix = useMale ? 'fme-male-' : 'fme-female-';
    } else {
      // For MDW/FMW/WORK_PERMIT, use the original patient pool
      idPrefix = 'patient-';
    }

    // Get a random patient from the seeded data
    const count = await this.prisma.medicalSubmission.count({
      where: {
        id: {
          startsWith: idPrefix,
        },
        deletedAt: null,
      },
    });

    if (count === 0) {
      return null;
    }

    // Get a random index
    const randomIndex = Math.floor(Math.random() * count);

    // Fetch the random patient
    const patient = await this.prisma.medicalSubmission.findMany({
      where: {
        id: {
          startsWith: idPrefix,
        },
        deletedAt: null,
        patientNric: {
          not: null,
        },
      },
      select: {
        patientNric: true,
        patientName: true,
      },
      skip: randomIndex,
      take: 1,
    });

    if (patient.length === 0 || !patient[0].patientNric) {
      return null;
    }

    return {
      fin: patient[0].patientNric,
      name: patient[0].patientName,
    };
  }
}
