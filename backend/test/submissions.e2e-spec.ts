import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Submissions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let doctorToken: string;
  let nurseToken: string;
  let adminToken: string;

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

    // Get tokens for all user roles
    const doctorRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'doctor@clinic.sg', password: 'password' });
    doctorToken = doctorRes.body.token;

    const nurseRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'nurse@clinic.sg', password: 'password' });
    nurseToken = nurseRes.body.token;

    const adminRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'admin@clinic.sg', password: 'password' });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/v1/submissions (GET)', () => {
    it('should return submissions for doctor', () => {
      return request(app.getHttpServer())
        .get('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('totalItems');
        });
    });

    it('should return submissions for nurse', () => {
      return request(app.getHttpServer())
        .get('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return all clinic submissions for admin', () => {
      return request(app.getHttpServer())
        .get('/v1/submissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/v1/submissions?status=submitted')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((s: any) => s.status === 'submitted')).toBe(true);
        });
    });

    it('should filter by exam type', () => {
      return request(app.getHttpServer())
        .get('/v1/submissions?examType=SIX_MONTHLY_MDW')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);
    });

    it('should paginate results', () => {
      return request(app.getHttpServer())
        .get('/v1/submissions?page=1&limit=2')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(2);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/v1/submissions')
        .expect(401);
    });
  });

  describe('/v1/submissions (POST)', () => {
    it('should create submission as doctor (direct submit)', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'SIX_MONTHLY_MDW',
          patientName: 'Test Patient Doctor',
          patientNric: 'S9999999A',
          patientDateOfBirth: '1990-01-01',
          formData: {
            height: '170',
            weight: '65',
            bloodPressure: '120/80',
            pregnancyTest: 'Negative',
            chestXray: 'Normal',
          },
        })
        .expect(201);

      expect(res.body.status).toBe('submitted');
      expect(res.body.patientName).toBe('Test Patient Doctor');
      expect(res.body.examType).toBe('SIX_MONTHLY_MDW');
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('createdBy');
      expect(res.body).toHaveProperty('submittedDate');
    });

    it('should create submission as nurse (pending approval)', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'WORK_PERMIT',
          patientName: 'Test Patient Nurse',
          patientNric: 'S8888888B',
          patientDateOfBirth: '1985-05-15',
          formData: {
            height: '165',
            weight: '60',
            bloodPressure: '118/75',
            hivTest: 'Negative',
            tbTest: 'Negative',
          },
          routeForApproval: true,
        })
        .expect(201);

      expect(res.body.status).toBe('pending_approval');
      expect(res.body.patientName).toBe('Test Patient Nurse');
      expect(res.body.submittedDate).toBeNull();
    });

    it('should create submission as nurse without routing for approval', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'AGED_DRIVERS',
          patientName: 'Test Patient Direct',
          patientNric: 'S7777777C',
          patientDateOfBirth: '1960-03-20',
          formData: {
            visualAcuity: '6/6',
            hearingTest: 'Normal',
            bloodPressure: '125/80',
          },
          routeForApproval: false,
        })
        .expect(201);

      expect(res.body.status).toBe('draft');
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/v1/submissions')
        .send({
          examType: 'SIX_MONTHLY_MDW',
          patientName: 'Test',
          patientNric: 'S1111111A',
          patientDateOfBirth: '1990-01-01',
          formData: {},
        })
        .expect(401);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'SIX_MONTHLY_MDW',
          // Missing required fields
        })
        .expect(400);
    });

    it('should create FMW submission without vitals as doctor', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'SIX_MONTHLY_FMW',
          patientName: 'Female Worker Test',
          patientNric: 'S8888888F',
          examinationDate: '2025-10-30',
          formData: {
            pregnancyTestPositive: 'false',
            syphilisTestPositive: 'false',
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
            hasAdditionalRemarks: 'true',
            remarks: 'Patient appears healthy, no concerns noted.',
          },
        })
        .expect(201);

      expect(res.body.status).toBe('submitted');
      expect(res.body.patientName).toBe('Female Worker Test');
      expect(res.body.examType).toBe('SIX_MONTHLY_FMW');
      expect(res.body.formData.pregnancyTestPositive).toBe('false');
      expect(res.body.formData.hasAdditionalRemarks).toBe('true');
      expect(res.body.formData.remarks).toBe('Patient appears healthy, no concerns noted.');
      // Should not have height/weight
      expect(res.body.formData.height).toBeUndefined();
      expect(res.body.formData.weight).toBeUndefined();
    });

    it('should create FMW submission as nurse (pending approval)', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'SIX_MONTHLY_FMW',
          patientName: 'FMW Nurse Test',
          patientNric: 'S7777777E',
          examinationDate: '2025-10-30',
          formData: {
            pregnancyTestPositive: 'true',
            syphilisTestPositive: 'false',
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
          },
          routeForApproval: true,
        })
        .expect(201);

      expect(res.body.status).toBe('pending_approval');
      expect(res.body.examType).toBe('SIX_MONTHLY_FMW');
      expect(res.body.assignedDoctorId).toBeDefined();
    });
  });

  describe('/v1/submissions/:id (GET)', () => {
    let submissionId: string;

    beforeAll(async () => {
      // Create a test submission
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'SIX_MONTHLY_MDW',
          patientName: 'Test Get',
          patientNric: 'S6666666D',
          patientDateOfBirth: '1992-06-10',
          formData: { height: '160' },
        });
      submissionId = res.body.id;
    });

    it('should get submission by id', () => {
      return request(app.getHttpServer())
        .get(`/v1/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(submissionId);
          expect(res.body.patientName).toBe('Test Get');
        });
    });

    it('should fail for non-existent submission', () => {
      return request(app.getHttpServer())
        .get('/v1/submissions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(404);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/v1/submissions/${submissionId}`)
        .expect(401);
    });

    it('should get FMW submission by id', async () => {
      // First create a FMW submission
      const createRes = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'SIX_MONTHLY_FMW',
          patientName: 'FMW Get Test',
          patientNric: 'S5555555F',
          examinationDate: '2025-10-30',
          formData: {
            pregnancyTestPositive: 'false',
            syphilisTestPositive: 'false',
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
          },
        });

      const fmwSubmissionId = createRes.body.id;

      // Then retrieve it
      return request(app.getHttpServer())
        .get(`/v1/submissions/${fmwSubmissionId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(fmwSubmissionId);
          expect(res.body.examType).toBe('SIX_MONTHLY_FMW');
          expect(res.body.patientName).toBe('FMW Get Test');
          expect(res.body.formData.pregnancyTestPositive).toBe('false');
        });
    });

    it('should filter submissions by FMW exam type', async () => {
      return request(app.getHttpServer())
        .get('/v1/submissions?examType=SIX_MONTHLY_FMW')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          // All results should be FMW type
          if (res.body.data.length > 0) {
            res.body.data.forEach((submission: any) => {
              expect(submission.examType).toBe('SIX_MONTHLY_FMW');
            });
          }
        });
    });
  });

  describe('/v1/submissions/:id (PUT)', () => {
    let submissionId: string;

    beforeAll(async () => {
      // Create a test submission in pending_approval status
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'WORK_PERMIT',
          patientName: 'Test Update',
          patientNric: 'S5555555E',
          patientDateOfBirth: '1988-08-08',
          formData: { height: '170' },
          routeForApproval: true,
        });
      submissionId = res.body.id;
    });

    it('should update submission', async () => {
      const res = await request(app.getHttpServer())
        .put(`/v1/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patientName: 'Test Update Modified',
          formData: { height: '175', weight: '70' },
        })
        .expect(200);

      expect(res.body.patientName).toBe('Test Update Modified');
      expect(res.body.formData.height).toBe('175');
      expect(res.body.formData.weight).toBe('70');
    });

    it('should fail to update submitted submission', async () => {
      // Create submitted submission
      const submitted = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'SIX_MONTHLY_MDW',
          patientName: 'Already Submitted',
          patientNric: 'S4444444F',
          patientDateOfBirth: '1991-01-01',
          formData: {},
        });

      return request(app.getHttpServer())
        .put(`/v1/submissions/${submitted.body.id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ patientName: 'Should Fail' })
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .put(`/v1/submissions/${submissionId}`)
        .send({ patientName: 'Fail' })
        .expect(401);
    });

    it('should update FMW submission', async () => {
      // Create FMW draft
      const created = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'SIX_MONTHLY_FMW',
          patientName: 'FMW Update Test',
          patientNric: 'S3333333F',
          examinationDate: '2025-10-30',
          formData: {
            pregnancyTestPositive: 'false',
            syphilisTestPositive: 'false',
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
          },
          routeForApproval: false,
        });

      // Update it
      const res = await request(app.getHttpServer())
        .put(`/v1/submissions/${created.body.id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patientName: 'FMW Updated Name',
          formData: {
            pregnancyTestPositive: 'true',
            syphilisTestPositive: 'false',
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
          },
        })
        .expect(200);

      expect(res.body.patientName).toBe('FMW Updated Name');
      expect(res.body.formData.pregnancyTestPositive).toBe('true');
      expect(res.body.examType).toBe('SIX_MONTHLY_FMW');
    });
  });

  describe('/v1/submissions/:id (DELETE)', () => {
    let draftId: string;

    beforeEach(async () => {
      // Create a draft for testing delete
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'SIX_MONTHLY_MDW',
          patientName: 'Delete Test',
          patientNric: 'S9999999Z',
          patientDateOfBirth: '1990-01-01',
          formData: {},
          routeForApproval: false, // Save as draft
        });
      draftId = res.body.id;
    });

    it('should delete a draft submission', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/v1/submissions/${draftId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');

      // Verify the draft appears deleted (returns 404 for non-admin)
      await request(app.getHttpServer())
        .get(`/v1/submissions/${draftId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(404);

      // Verify it's actually a soft delete - the record still exists in DB
      const submission = await prisma.medicalSubmission.findUnique({
        where: { id: draftId },
      });
      expect(submission).toBeDefined();
      expect(submission?.deletedAt).toBeDefined();
    });

    it('should preserve audit log after soft deleting draft', async () => {
      // Delete the draft
      await request(app.getHttpServer())
        .delete(`/v1/submissions/${draftId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      // Verify audit log still exists and contains the deletion event
      const auditLogs = await prisma.auditLog.findMany({
        where: { submissionId: draftId },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      const deletionLog = auditLogs.find(log => log.eventType === 'deleted');
      expect(deletionLog).toBeDefined();
      expect(deletionLog?.changes).toHaveProperty('status', 'draft');
      expect(deletionLog?.changes).toHaveProperty('patientName', 'Delete Test');
    });

    it('should hide deleted drafts from non-admin users', async () => {
      // Delete the draft
      await request(app.getHttpServer())
        .delete(`/v1/submissions/${draftId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      // Nurse should not see it in their drafts list
      const nurseDrafts = await request(app.getHttpServer())
        .get('/v1/submissions?status=draft')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      const deletedDraft = nurseDrafts.body.data.find((d: any) => d.id === draftId);
      expect(deletedDraft).toBeUndefined();
    });

    it('should show deleted drafts to admin when includeDeleted=true', async () => {
      // Delete the draft
      await request(app.getHttpServer())
        .delete(`/v1/submissions/${draftId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      // Admin should see it when includeDeleted=true
      const adminDrafts = await request(app.getHttpServer())
        .get('/v1/submissions?status=draft&includeDeleted=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deletedDraft = adminDrafts.body.data.find((d: any) => d.id === draftId);
      expect(deletedDraft).toBeDefined();
      expect(deletedDraft?.deletedAt).toBeDefined();
    });

    it('should hide deleted drafts from admin when includeDeleted=false', async () => {
      // Delete the draft
      await request(app.getHttpServer())
        .delete(`/v1/submissions/${draftId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      // Admin should NOT see it when includeDeleted is not set
      const adminDrafts = await request(app.getHttpServer())
        .get('/v1/submissions?status=draft')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deletedDraft = adminDrafts.body.data.find((d: any) => d.id === draftId);
      expect(deletedDraft).toBeUndefined();
    });

    it('should not allow deleting a non-draft submission', async () => {
      // Create a submitted submission
      const submitted = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'SIX_MONTHLY_MDW',
          patientName: 'Submitted Exam',
          patientNric: 'S8888888Y',
          patientDateOfBirth: '1990-01-01',
          formData: {},
        });

      return request(app.getHttpServer())
        .delete(`/v1/submissions/${submitted.body.id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);
    });

    it('should not allow deleting another users draft', async () => {
      // Try to delete nurse's draft as doctor
      return request(app.getHttpServer())
        .delete(`/v1/submissions/${draftId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/v1/submissions/${draftId}`)
        .expect(401);
    });

    it('should soft delete FMW submission', async () => {
      // Create FMW draft
      const created = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'SIX_MONTHLY_FMW',
          patientName: 'FMW Delete Test',
          patientNric: 'S2222222D',
          examinationDate: '2025-10-30',
          formData: {
            pregnancyTestPositive: 'false',
            syphilisTestPositive: 'false',
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
          },
          routeForApproval: false,
        });

      // Delete it
      const res = await request(app.getHttpServer())
        .delete(`/v1/submissions/${created.body.id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);

      // Verify it's soft deleted
      await request(app.getHttpServer())
        .get(`/v1/submissions/${created.body.id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(404);
    });
  });

  describe('ICA Exam Types', () => {
    it('should create PR_MEDICAL submission as doctor', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'PR_MEDICAL',
          patientName: 'Test PR Patient',
          patientNric: 'S1234567A',
          examinationDate: '2025-10-31',
          formData: {
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
            remarks: 'No abnormalities detected',
          },
        })
        .expect(201);

      expect(res.body.status).toBe('submitted');
      expect(res.body.examType).toBe('PR_MEDICAL');
      expect(res.body.patientName).toBe('Test PR Patient');
      expect(res.body.formData.hivTestPositive).toBe('false');
      expect(res.body.formData.chestXrayPositive).toBe('false');
    });

    it('should create STUDENT_PASS_MEDICAL submission as doctor', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'STUDENT_PASS_MEDICAL',
          patientName: 'Test Student',
          patientNric: 'S7654321B',
          examinationDate: '2025-10-31',
          formData: {
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
            hasAdditionalRemarks: 'true',
            remarks: 'All tests negative',
          },
        })
        .expect(201);

      expect(res.body.status).toBe('submitted');
      expect(res.body.examType).toBe('STUDENT_PASS_MEDICAL');
      expect(res.body.patientName).toBe('Test Student');
    });

    it('should create LTVP_MEDICAL submission as doctor', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          examType: 'LTVP_MEDICAL',
          patientName: 'Test LTVP Patient',
          patientNric: 'S9876543C',
          examinationDate: '2025-10-31',
          formData: {
            hivTestPositive: 'true',
            chestXrayPositive: 'false',
            hasAdditionalRemarks: 'true',
            remarks: 'HIV positive - requires follow-up',
          },
        })
        .expect(201);

      expect(res.body.status).toBe('submitted');
      expect(res.body.examType).toBe('LTVP_MEDICAL');
      expect(res.body.formData.hivTestPositive).toBe('true');
    });

    it('should create ICA submission as nurse (pending approval)', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'PR_MEDICAL',
          patientName: 'Test PR Nurse',
          patientNric: 'S1111222A',
          examinationDate: '2025-10-31',
          formData: {
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
          },
          routeForApproval: true,
        })
        .expect(201);

      expect(res.body.status).toBe('pending_approval');
      expect(res.body.examType).toBe('PR_MEDICAL');
    });

    it('should filter ICA submissions by exam type', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/submissions?examType=PR_MEDICAL')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        res.body.data.forEach((submission: any) => {
          expect(submission.examType).toBe('PR_MEDICAL');
        });
      }
    });

    it('should update ICA submission', async () => {
      // Create a draft submission as nurse
      const created = await request(app.getHttpServer())
        .post('/v1/submissions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          examType: 'STUDENT_PASS_MEDICAL',
          patientName: 'Original Name',
          patientNric: 'S3333444B',
          examinationDate: '2025-10-31',
          formData: {
            hivTestPositive: 'false',
            chestXrayPositive: 'false',
          },
          routeForApproval: false,
        })
        .expect(201);

      expect(created.body.status).toBe('draft');

      // Update it using PUT (not PATCH)
      const res = await request(app.getHttpServer())
        .put(`/v1/submissions/${created.body.id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patientName: 'Updated Name',
          formData: {
            hivTestPositive: 'false',
            chestXrayPositive: 'true',
            hasAdditionalRemarks: 'true',
            remarks: 'Updated: Chest X-ray positive for TB',
          },
        })
        .expect(200);

      expect(res.body.patientName).toBe('Updated Name');
      expect(res.body.formData.chestXrayPositive).toBe('true');
      expect(res.body.formData.remarks).toContain('TB');
    });
  });
});
