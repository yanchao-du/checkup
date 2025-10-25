import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Approvals (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let doctorToken: string;
  let nurseToken: string;

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

    // Get tokens
    const doctorRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'doctor@clinic.sg', password: 'password' });
    doctorToken = doctorRes.body.token;

    const nurseRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'nurse@clinic.sg', password: 'password' });
    nurseToken = nurseRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/v1/approvals (GET)', () => {
    let pendingSubmissionId: string;

    beforeAll(async () => {
      // Create a pending approval
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'SIX_MONTHLY_MDW',
          patientName: 'Pending Approval Test',
          patientNric: 'S3333333G',
          patientDateOfBirth: '1989-09-09',
          formData: {
            height: '165',
            weight: '58',
            bloodPressure: '115/70',
            pregnancyTest: 'Negative',
            chestXray: 'Normal',
          },
          routeForApproval: true,
        });
      pendingSubmissionId = res.body.id;
    });

    it('should return pending approvals for doctor', () => {
      return request(app.getHttpServer())
        .get('/v1/approvals')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          
          // Check if our pending submission is in the list
          const found = res.body.data.find((s: any) => s.id === pendingSubmissionId);
          if (found) {
            expect(found.status).toBe('pending_approval');
          }
        });
    });

    it('should fail for nurse (not authorized)', () => {
      return request(app.getHttpServer())
        .get('/v1/approvals')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/v1/approvals')
        .expect(401);
    });

    it('should filter by exam type', () => {
      return request(app.getHttpServer())
        .get('/v1/approvals?examType=SIX_MONTHLY_MDW')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });

    it('should paginate results', () => {
      return request(app.getHttpServer())
        .get('/v1/approvals?page=1&limit=5')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(5);
        });
    });
  });

  describe('/v1/approvals/:id/approve (POST)', () => {
    let submissionId: string;

    beforeEach(async () => {
      // Create a new pending submission for each test
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'WORK_PERMIT',
          patientName: 'Test Approve',
          patientNric: `S${Math.floor(Math.random() * 9000000) + 1000000}H`,
          patientDateOfBirth: '1987-07-07',
          formData: {
            height: '172',
            weight: '68',
            bloodPressure: '120/78',
            hivTest: 'Negative',
            tbTest: 'Negative',
          },
          routeForApproval: true,
        });
      submissionId = res.body.id;
    });

    it('should approve submission as doctor', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/approve`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ notes: 'Approved after review' })
        .expect(201);

      expect(res.body.status).toBe('submitted');
      expect(res.body).toHaveProperty('approvedBy');
      expect(res.body).toHaveProperty('approvedDate');
      expect(res.body).toHaveProperty('submittedDate');
    });

    it('should approve submission without notes', () => {
      return request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/approve`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({})
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe('submitted');
        });
    });

    it('should fail for nurse (not authorized)', () => {
      return request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/approve`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({})
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/approve`)
        .send({})
        .expect(401);
    });

    it('should fail for non-existent submission', () => {
      return request(app.getHttpServer())
        .post('/v1/approvals/00000000-0000-0000-0000-000000000000/approve')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({})
        .expect(404);
    });

    it('should fail to approve already approved submission', async () => {
      // First approval
      await request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/approve`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({});

      // Try to approve again
      return request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/approve`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('/v1/approvals/:id/reject (POST)', () => {
    let submissionId: string;

    beforeEach(async () => {
      // Create a new pending submission for each test
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'AGED_DRIVERS',
          patientName: 'Test Reject',
          patientNric: `S${Math.floor(Math.random() * 9000000) + 1000000}I`,
          patientDateOfBirth: '1955-05-05',
          formData: {
            visualAcuity: '6/9',
            hearingTest: 'Normal',
            bloodPressure: '130/85',
            diabetes: 'Yes',
          },
          routeForApproval: true,
        });
      submissionId = res.body.id;
    });

    it('should reject submission with reason', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/reject`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ reason: 'Incomplete medical history' })
        .expect(201);

      expect(res.body.status).toBe('rejected');
      expect(res.body.rejectedReason).toBe('Incomplete medical history');
      expect(res.body.approvedBy).toBe("550e8400-e29b-41d4-a716-446655440001");
      expect(res.body.submittedDate).toBeNull();
    });

    it('should fail without reason', () => {
      return request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/reject`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({})
        .expect(400); // Validation error for missing required field
    });

    it('should fail for nurse (not authorized)', () => {
      return request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/reject`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({ reason: 'Should not work' })
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/reject`)
        .send({ reason: 'Should fail' })
        .expect(401);
    });

    it('should fail for non-existent submission', () => {
      return request(app.getHttpServer())
        .post('/v1/approvals/00000000-0000-0000-0000-000000000000/reject')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ reason: 'Does not exist' })
        .expect(404);
    });

    it('should fail to reject already submitted submission', async () => {
      // First approve it
      await request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/approve`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({});

      // Try to reject
      return request(app.getHttpServer())
        .post(`/v1/approvals/${submissionId}/reject`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ reason: 'Too late' })
        .expect(403);
    });
  });
});
