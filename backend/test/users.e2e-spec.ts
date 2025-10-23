import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let doctorToken: string;
  let nurseToken: string;
  let clinicId: string;
  let createdUserId: string | null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.enableCors();

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Get clinic ID from existing admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@clinic.sg' },
    });
    if (!adminUser) {
      throw new Error('Admin user not found in database');
    }
    clinicId = adminUser.clinicId;

    // Login as admin
    const adminResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'admin@clinic.sg', password: 'password' })
      .expect(201);
    adminToken = adminResponse.body.token;

    // Login as doctor
    const doctorResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'doctor@clinic.sg', password: 'password' })
      .expect(201);
    doctorToken = doctorResponse.body.token;

    // Login as nurse
    const nurseResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'nurse@clinic.sg', password: 'password' })
      .expect(201);
    nurseToken = nurseResponse.body.token;
  });

  afterAll(async () => {
    // Clean up created test user if exists
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    await app.close();
  });

  describe('GET /v1/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('totalPages');

      // Verify user structure
      const user = response.body.data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('status');
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should deny access to doctor', async () => {
      await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);
    });

    it('should deny access to nurse', async () => {
      await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(403);
    });

    it('should deny access without token', async () => {
      await request(app.getHttpServer())
        .get('/v1/users')
        .expect(401);
    });
  });

  describe('POST /v1/users', () => {
    it('should create a new user as admin', async () => {
      const newUser = {
        name: 'Test E2E User',
        email: `test-e2e-${Date.now()}@clinic.sg`,
        password: 'password123',
        role: 'nurse',
      };

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);
      expect(response.body.role).toBe(newUser.role);
      expect(response.body.status).toBe('active');
      expect(response.body).not.toHaveProperty('passwordHash');

      // Save for cleanup
      createdUserId = response.body.id;
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          // missing email, password, role
        })
        .expect(400);
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
          role: 'nurse',
        })
        .expect(400);
    });

    it('should validate password minimum length', async () => {
      await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          email: 'test@clinic.sg',
          password: '12345', // too short
          role: 'nurse',
        })
        .expect(400);
    });

    it('should validate role enum', async () => {
      await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          email: 'test@clinic.sg',
          password: 'password123',
          role: 'invalid-role',
        })
        .expect(400);
    });

    it('should prevent duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate User',
          email: 'admin@clinic.sg', // already exists
          password: 'password123',
          role: 'nurse',
        })
        .expect(409);
    });

    it('should deny access to non-admin', async () => {
      await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          name: 'Test User',
          email: 'test@clinic.sg',
          password: 'password123',
          role: 'nurse',
        })
        .expect(403);
    });
  });

  describe('GET /v1/users/:id', () => {
    it('should return a specific user', async () => {
      const allUsers = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const userId = allUsers.body.data[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-999999999999';
      await request(app.getHttpServer())
        .get(`/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should deny access to non-admin', async () => {
      const allUsers = await request(app.getHttpServer())
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const userId = allUsers.body.data[0].id;

      await request(app.getHttpServer())
        .get(`/v1/users/${userId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);
    });
  });

  describe('PUT /v1/users/:id', () => {
    it('should update a user as admin', async () => {
      if (!createdUserId) {
        // Create a user first if not exists
        const newUser = await request(app.getHttpServer())
          .post('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'User To Update',
            email: `update-test-${Date.now()}@clinic.sg`,
            password: 'password123',
            role: 'nurse',
          })
          .expect(201);
        createdUserId = newUser.body.id;
      }

      const updateData = {
        name: 'Updated Name',
        role: 'doctor',
      };

      const response = await request(app.getHttpServer())
        .put(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.role).toBe('doctor');
    });

    it('should update password', async () => {
      if (!createdUserId) {
        const newUser = await request(app.getHttpServer())
          .post('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'User For Password Update',
            email: `pwd-test-${Date.now()}@clinic.sg`,
            password: 'password123',
            role: 'nurse',
          })
          .expect(201);
        createdUserId = newUser.body.id;
      }

      await request(app.getHttpServer())
        .put(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password: 'newPassword123' })
        .expect(200);

      // Password should be hashed, not returned
      const user = await prisma.user.findUnique({
        where: { id: createdUserId! },
      });
      expect(user).toBeDefined();
      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe('newPassword123');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-999999999999';
      await request(app.getHttpServer())
        .put(`/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should deny access to non-admin', async () => {
      if (!createdUserId) {
        const newUser = await request(app.getHttpServer())
          .post('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'User',
            email: `test-${Date.now()}@clinic.sg`,
            password: 'password123',
            role: 'nurse',
          })
          .expect(201);
        createdUserId = newUser.body.id;
      }

      await request(app.getHttpServer())
        .put(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ name: 'Hacked Name' })
        .expect(403);
    });
  });

  describe('DELETE /v1/users/:id', () => {
    it('should delete a user as admin', async () => {
      // Create a user to delete
      const userToDelete = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'User To Delete',
          email: `delete-test-${Date.now()}@clinic.sg`,
          password: 'password123',
          role: 'nurse',
        })
        .expect(201);

      const userId = userToDelete.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User deleted successfully');

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(deletedUser).toBeNull();

      // Clear createdUserId if it was the one deleted
      if (createdUserId === userId) {
        createdUserId = null;
      }
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-999999999999';
      await request(app.getHttpServer())
        .delete(`/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should deny access to non-admin', async () => {
      const userToDelete = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'User',
          email: `test-${Date.now()}@clinic.sg`,
          password: 'password123',
          role: 'nurse',
        })
        .expect(201);

      const userId = userToDelete.body.id;

      await request(app.getHttpServer())
        .delete(`/v1/users/${userId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(403);

      // Cleanup
      await request(app.getHttpServer())
        .delete(`/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Doctor-Clinic Relationships', () => {
    let testDoctorId: string;
    let secondClinicId: string;

    beforeAll(async () => {
      // Create a test doctor
      const doctorResponse = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Test E2E',
          email: `doctor-e2e-${Date.now()}@clinic.sg`,
          password: 'password123',
          role: 'doctor',
          mcrNumber: 'T99999Z',
        })
        .expect(201);
      testDoctorId = doctorResponse.body.id;

      // Create a second clinic
      const clinicResponse = await request(app.getHttpServer())
        .post('/v1/clinics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Second E2E Clinic',
          hciCode: 'E2E0002',
        })
        .expect(201);
      secondClinicId = clinicResponse.body.id;
    });

    afterAll(async () => {
      // Cleanup
      if (testDoctorId) {
        await prisma.user.delete({ where: { id: testDoctorId } }).catch(() => {});
      }
      if (secondClinicId) {
        await prisma.clinic.delete({ where: { id: secondClinicId } }).catch(() => {});
      }
    });

    describe('GET /v1/users/:id/clinics', () => {
      it('should return clinics for a doctor', async () => {
        const response = await request(app.getHttpServer())
          .get(`/v1/users/${testDoctorId}/clinics`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        
        const clinic = response.body[0];
        expect(clinic).toHaveProperty('id');
        expect(clinic).toHaveProperty('name');
        expect(clinic).toHaveProperty('hciCode');
        expect(clinic).toHaveProperty('isPrimary');
        expect(clinic.isPrimary).toBe(true); // First clinic is primary
      });
    });

    describe('POST /v1/users/:id/clinics', () => {
      it('should assign doctor to a clinic', async () => {
        const response = await request(app.getHttpServer())
          .post(`/v1/users/${testDoctorId}/clinics`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            clinicId: secondClinicId,
            isPrimary: false,
          })
          .expect(201);

        expect(response.body.doctorId).toBe(testDoctorId);
        expect(response.body.clinicId).toBe(secondClinicId);
        expect(response.body.isPrimary).toBe(false);
        expect(response.body).toHaveProperty('doctor');
        expect(response.body).toHaveProperty('clinic');
      });

      it('should reject duplicate assignment', async () => {
        // Try to assign again
        const response = await request(app.getHttpServer())
          .post(`/v1/users/${testDoctorId}/clinics`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            clinicId: secondClinicId,
            isPrimary: false,
          })
          .expect(409);

        expect(response.body.message).toContain('already assigned');
      });

      it('should deny access to non-admin', async () => {
        await request(app.getHttpServer())
          .post(`/v1/users/${testDoctorId}/clinics`)
          .set('Authorization', `Bearer ${nurseToken}`)
          .send({
            clinicId: secondClinicId,
            isPrimary: false,
          })
          .expect(403);
      });
    });

    describe('PUT /v1/users/:id/clinics/:clinicId/primary', () => {
      it('should set a clinic as primary', async () => {
        const response = await request(app.getHttpServer())
          .put(`/v1/users/${testDoctorId}/clinics/${secondClinicId}/primary`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.isPrimary).toBe(true);
        expect(response.body.clinicId).toBe(secondClinicId);

        // Verify the change
        const clinicsResponse = await request(app.getHttpServer())
          .get(`/v1/users/${testDoctorId}/clinics`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const primaryClinic = clinicsResponse.body.find(
          (c: any) => c.isPrimary === true,
        );
        expect(primaryClinic.id).toBe(secondClinicId);
      });

      it('should return 404 for unassigned clinic', async () => {
        const fakeClinicId = '00000000-0000-0000-0000-000000000000';
        await request(app.getHttpServer())
          .put(`/v1/users/${testDoctorId}/clinics/${fakeClinicId}/primary`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });

    describe('DELETE /v1/users/:id/clinics/:clinicId', () => {
      it('should prevent removing the only clinic', async () => {
        // First, remove the original clinic to have only one
        const clinicsResponse = await request(app.getHttpServer())
          .get(`/v1/users/${testDoctorId}/clinics`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const nonPrimaryClinic = clinicsResponse.body.find(
          (c: any) => c.isPrimary === false,
        );

        if (nonPrimaryClinic) {
          await request(app.getHttpServer())
            .delete(`/v1/users/${testDoctorId}/clinics/${nonPrimaryClinic.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        }

        // Now try to remove the last clinic
        const primaryClinic = clinicsResponse.body.find(
          (c: any) => c.isPrimary === true,
        );

        const response = await request(app.getHttpServer())
          .delete(`/v1/users/${testDoctorId}/clinics/${primaryClinic.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(409);

        expect(response.body.message).toContain(
          'Doctor must have at least one clinic',
        );
      });
    });
  });

  describe('MCR Number Validation', () => {
    it('should accept valid MCR number format', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Valid MCR',
          email: `valid-mcr-${Date.now()}@clinic.sg`,
          password: 'password123',
          role: 'doctor',
          mcrNumber: 'V12345A',
        })
        .expect(201);

      expect(response.body.mcrNumber).toBe('V12345A');

      // Cleanup
      await prisma.user.delete({ where: { id: response.body.id } });
    });

    it('should reject invalid MCR number formats', async () => {
      const invalidMCRs = [
        'M12345',    // Missing last letter
        '12345AB',   // Missing first letter
        'M1234AB',   // Only 4 digits
        'm12345a',   // Lowercase
        'M-12345-A', // Contains hyphens
      ];

      for (const mcrNumber of invalidMCRs) {
        await request(app.getHttpServer())
          .post('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Dr. Invalid MCR',
            email: `invalid-mcr-${Date.now()}-${Math.random()}@clinic.sg`,
            password: 'password123',
            role: 'doctor',
            mcrNumber,
          })
          .expect(400);
      }
    });

    it('should reject duplicate MCR number', async () => {
      const mcrNumber = 'D55555E';
      
      // Create first doctor
      const first = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. First',
          email: `first-${Date.now()}@clinic.sg`,
          password: 'password123',
          role: 'doctor',
          mcrNumber,
        })
        .expect(201);

      // Try to create second doctor with same MCR
      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Second',
          email: `second-${Date.now()}@clinic.sg`,
          password: 'password123',
          role: 'doctor',
          mcrNumber,
        })
        .expect(409);

      expect(response.body.message).toContain('MCR Number already exists');

      // Cleanup
      await prisma.user.delete({ where: { id: first.body.id } });
    });

    it('should require MCR number for doctors', async () => {
      await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. No MCR',
          email: `no-mcr-${Date.now()}@clinic.sg`,
          password: 'password123',
          role: 'doctor',
          // mcrNumber missing
        })
        .expect(400);
    });
  });
});
