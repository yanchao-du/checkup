import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PatientInfo {
  nric: string;
  name: string;
  lastHeight?: string;
  lastWeight?: string;
  lastExamDate?: string;
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

    if (!submission) {
      return null;
    }

    // Extract height and weight from formData if available
    const formData = submission.formData as any;
    const lastHeight = formData?.height?.toString() || undefined;
    const lastWeight = formData?.weight?.toString() || undefined;
    const lastExamDate = submission.examinationDate?.toISOString().split('T')[0] || undefined;

    return {
      nric: submission.patientNric,
      name: submission.patientName,
      lastHeight,
      lastWeight,
      lastExamDate,
    };
  }

  /**
   * Get a random test FIN from the seeded patient data
   * This is used for displaying test FINs to users for exam types that support lookup
   */
  async getRandomTestFin(): Promise<{ fin: string; name: string } | null> {
    // Get a random patient from the seeded data (those with IDs starting with 'patient-')
    const count = await this.prisma.medicalSubmission.count({
      where: {
        id: {
          startsWith: 'patient-',
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
          startsWith: 'patient-',
        },
        deletedAt: null,
      },
      select: {
        patientNric: true,
        patientName: true,
      },
      skip: randomIndex,
      take: 1,
    });

    if (patient.length === 0) {
      return null;
    }

    return {
      fin: patient[0].patientNric,
      name: patient[0].patientName,
    };
  }
}
