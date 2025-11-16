import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * PDF Generation E2E Tests
 * 
 * These tests use existing seeded data from the database.
 * Prerequisites:
 * - Run `npm run seed` before running these tests
 * - Ensure seeded data includes a submitted submission
 */
describe('PDF Generation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let doctorToken: string;
  let nurseToken: string;
  let submissionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();

    // Login as doctor (uses existing seeded data)
    const doctorLoginResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'doctor@clinic.sg',
        password: 'password',
      });
    doctorToken = doctorLoginResponse.body.token;

    // Login as nurse (uses existing seeded data)
    const nurseLoginResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'nurse@clinic.sg',
        password: 'password',
      });
    nurseToken = nurseLoginResponse.body.token;

    // Find a submitted submission from seeded data
    const submission = await prisma.medicalSubmission.findFirst({
      where: {
        status: 'submitted',
      },
    });
    
    if (submission) {
      submissionId = submission.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /v1/submissions/:id/pdf', () => {
    beforeEach(() => {
      if (!submissionId) {
        throw new Error('No submitted submission found in database. Run `npm run seed` first.');
      }
    });

    it('should return PDF for authorized doctor', () => {
      return request(app.getHttpServer())
        .get(`/v1/submissions/${submissionId}/pdf`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.headers['content-disposition']).toContain('attachment');
          expect(res.headers['content-disposition']).toContain('.pdf');
        });
    });

    it('should return PDF for authorized nurse', () => {
      return request(app.getHttpServer())
        .get(`/v1/submissions/${submissionId}/pdf`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should return 401 for missing authentication', () => {
      return request(app.getHttpServer())
        .get(`/v1/submissions/${submissionId}/pdf`)
        .expect(401);
    });

    it('should return 401 for invalid token', () => {
      return request(app.getHttpServer())
        .get(`/v1/submissions/${submissionId}/pdf`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 404 for non-existent submission', () => {
      return request(app.getHttpServer())
        .get('/v1/submissions/non-existent-id-12345/pdf')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(404);
    });

    it('should have correct Content-Length header', () => {
      return request(app.getHttpServer())
        .get(`/v1/submissions/${submissionId}/pdf`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          const contentLength = parseInt(res.headers['content-length']);
          expect(contentLength).toBeGreaterThan(0);
          expect(contentLength).toBe(res.body.length);
        });
    });

    it('should generate PDF within reasonable time', () => {
      const startTime = Date.now();
      return request(app.getHttpServer())
        .get(`/v1/submissions/${submissionId}/pdf`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect(() => {
          const duration = Date.now() - startTime;
          expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });

    it('should return correct filename in Content-Disposition header', () => {
      return request(app.getHttpServer())
        .get(`/v1/submissions/${submissionId}/pdf`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-disposition']).toContain(`submission-${submissionId}.pdf`);
        });
    });
  });

  describe('PDF Generation for Different Exam Types', () => {
    it('should generate PDF for any exam type in database', async () => {
      // Find submissions of different exam types
      const examTypes = ['SIX_MONTHLY_MDW', 'SIX_MONTHLY_FMW', 'FULL_MEDICAL_EXAM', 'PR_MEDICAL', 'DRIVING_LICENCE_TP'];
      
      for (const examType of examTypes) {
        const submission = await prisma.medicalSubmission.findFirst({
          where: {
            examType: examType as any,
            status: 'submitted',
          },
        });

        if (submission) {
          await request(app.getHttpServer())
            .get(`/v1/submissions/${submission.id}/pdf`)
            .set('Authorization', `Bearer ${doctorToken}`)
            .expect(200)
            .expect('Content-Type', 'application/pdf');
        }
      }
    });
  });
});
