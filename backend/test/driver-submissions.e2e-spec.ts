import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ExamType } from '@prisma/client';

describe('Driver Submissions E2E Tests', () => {
  let app: INestApplication;
  let doctorToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();

    await app.init();

    // Login as doctor (use existing seeded user)
    const doctorRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'doctor@clinic.sg', password: 'password' });
    doctorToken = doctorRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/submissions - Driver exam validation', () => {
    it('should reject DRIVING_LICENCE_TP submission without AMT score', async () => {
      // Use existing seeded patient S1234567A (Maria Santos, DOB: 1990-05-15)
      const response = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: ExamType.DRIVING_LICENCE_TP,
          patientName: 'Maria Santos',
          patientNric: 'S1234567A',
          patientDateOfBirth: '1990-05-15',
          examinationDate: '2024-04-20', // Within 2 months before May 15
          formData: {
            medicalDeclaration: {
              hasReadDeclaration: true,
              declarationDate: '2024-04-20',
            },
            medicalHistory: {
              hasChronicConditions: false,
              hasMedications: false,
              hasAllergies: false,
            },
            // Missing AMT - should fail validation
            medicalPractitionerAssessment: {
              fitToDrive: true,
              requiresSpecialistReview: false,
            },
          },
        })
        .expect(400);

      expect(response.body.message).toContain('Abbreviated Mental Test');
    });

    it('should reject DRIVING_LICENCE_TP submission with exam date outside 2-month window', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: ExamType.DRIVING_LICENCE_TP,
          patientName: 'Maria Santos',
          patientNric: 'S1234567A',
          patientDateOfBirth: '1990-05-15', // DOB: 1990-05-15
          examinationDate: '2024-01-01', // Too early (> 2 months before May 15)
          formData: {
            medicalDeclaration: {
              hasReadDeclaration: true,
              declarationDate: '2024-01-01',
            },
            medicalHistory: {
              hasChronicConditions: false,
              hasMedications: false,
              hasAllergies: false,
            },
            amt: {
              score: 10,
              date: '2024-01-01',
            },
            medicalPractitionerAssessment: {
              fitToDrive: true,
              requiresSpecialistReview: false,
            },
          },
        })
        .expect(400);

      expect(response.body.message).toContain('within 2 months before');
    });

    it('should reject DRIVING_LICENCE_TP submission without fitToDrive assessment', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: ExamType.DRIVING_LICENCE_TP,
          patientName: 'Maria Santos',
          patientNric: 'S1234567A',
          patientDateOfBirth: '1990-05-15',
          examinationDate: '2024-04-20',
          formData: {
            medicalDeclaration: {
              hasReadDeclaration: true,
              declarationDate: '2024-04-20',
            },
            medicalHistory: {
              hasChronicConditions: false,
              hasMedications: false,
              hasAllergies: false,
            },
            amt: {
              score: 9,
              date: '2024-04-20',
            },
            medicalPractitionerAssessment: {
              // Missing fitToDrive
              requiresSpecialistReview: false,
            },
          },
        })
        .expect(400);

      expect(response.body.message).toContain('Fitness to drive');
    });

    it('should reject DRIVING_VOCATIONAL_TP_LTA submission without LTA vocational data', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: ExamType.DRIVING_VOCATIONAL_TP_LTA,
          patientName: 'Maria Santos',
          patientNric: 'S1234567A',
          patientDateOfBirth: '1990-05-15',
          examinationDate: '2024-04-20',
          formData: {
            medicalDeclaration: {
              hasReadDeclaration: true,
              declarationDate: '2024-04-20',
            },
            medicalHistory: {
              hasChronicConditions: false,
              hasMedications: false,
              hasAllergies: false,
            },
            amt: {
              score: 10,
              date: '2024-04-20',
            },
            // Missing ltaVocationalLicence
            medicalPractitionerAssessment: {
              fitToDrive: true,
              fitForVocational: true,
              requiresSpecialistReview: false,
            },
          },
        })
        .expect(400);

      expect(response.body.message).toContain('LTA Vocational Licence');
    });

    it('should reject DRIVING_VOCATIONAL_TP_LTA submission without fitForVocational', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: ExamType.DRIVING_VOCATIONAL_TP_LTA,
          patientName: 'Maria Santos',
          patientNric: 'S1234567A',
          patientDateOfBirth: '1990-05-15',
          examinationDate: '2024-04-20',
          formData: {
            medicalDeclaration: {
              hasReadDeclaration: true,
              declarationDate: '2024-04-20',
            },
            medicalHistory: {
              hasChronicConditions: false,
              hasMedications: false,
              hasAllergies: false,
            },
            amt: {
              score: 10,
              date: '2024-04-20',
            },
            ltaVocationalLicence: {
              colorVision: true,
              peripheralVision: true,
              nightVision: true,
            },
            medicalPractitionerAssessment: {
              fitToDrive: true,
              // Missing fitForVocational
              requiresSpecialistReview: false,
            },
          },
        })
        .expect(400);

      expect(response.body.message).toContain('vocational duty determination');
    });

    it('should reject DRIVING_VOCATIONAL_TP_LTA submission with incomplete vision tests', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: ExamType.DRIVING_VOCATIONAL_TP_LTA,
          patientName: 'Maria Santos',
          patientNric: 'S1234567A',
          patientDateOfBirth: '1990-05-15',
          examinationDate: '2024-04-20',
          formData: {
            medicalDeclaration: {
              hasReadDeclaration: true,
              declarationDate: '2024-04-20',
            },
            medicalHistory: {
              hasChronicConditions: false,
              hasMedications: false,
              hasAllergies: false,
            },
            amt: {
              score: 10,
              date: '2024-04-20',
            },
            ltaVocationalLicence: {
              colorVision: true,
              // Missing peripheralVision and nightVision
            },
            medicalPractitionerAssessment: {
              fitToDrive: true,
              fitForVocational: true,
              requiresSpecialistReview: false,
            },
          },
        })
        .expect(400);

      expect(response.body.message).toContain('vision');
    });

    it('should reject VOCATIONAL_LICENCE_LTA submission without vision tests', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: ExamType.VOCATIONAL_LICENCE_LTA,
          patientName: 'Maria Santos',
          patientNric: 'S1234567A',
          patientDateOfBirth: '1990-05-15',
          examinationDate: '2024-04-20',
          formData: {
            medicalDeclaration: {
              hasReadDeclaration: true,
              declarationDate: '2024-04-20',
            },
            medicalHistory: {
              hasChronicConditions: false,
              hasMedications: false,
              hasAllergies: false,
            },
            ltaVocationalLicence: {
              colorVision: true,
              // Missing peripheralVision and nightVision
            },
            medicalPractitionerAssessment: {
              fitForVocational: true,
              requiresSpecialistReview: false,
            },
          },
        })
        .expect(400);

      expect(response.body.message).toContain('vision');
    });
  });
});

