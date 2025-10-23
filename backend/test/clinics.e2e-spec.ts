import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Clinics (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let nurseToken: string;
  let clinicId: string;
  let testClinicId: string | null = null;

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

    // Login as nurse
    const nurseResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'nurse@clinic.sg', password: 'password' })
      .expect(201);
    nurseToken = nurseResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test clinic if created
    if (testClinicId) {
      await prisma.clinic.delete({ where: { id: testClinicId } }).catch(() => {});
    }
    await app.close();
  });

  describe('POST /v1/clinics', () => {
    it('should create a new clinic as admin', async () => {
      const createDto = {
        name: 'E2E Test Clinic',
        hciCode: 'TEST001',
        registrationNumber: 'REG-E2E-001',
        address: '123 Test Street',
        phone: '+65 6111 2222',
        email: 'test@e2eclinic.sg',
      };

      const response = await request(app.getHttpServer())
        .post('/v1/clinics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.hciCode).toBe(createDto.hciCode);
      expect(response.body.registrationNumber).toBe(createDto.registrationNumber);
      
      testClinicId = response.body.id;
    });

    it('should reject invalid HCI code format', async () => {
      const createDto = {
        name: 'Invalid Clinic',
        hciCode: 'INV', // Only 3 characters - invalid format (needs 7)
      };

      await request(app.getHttpServer())
        .post('/v1/clinics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should reject duplicate HCI code', async () => {
      const createDto = {
        name: 'Duplicate HCI Clinic',
        hciCode: 'HCI0001', // Existing HCI code from seed
      };

      const response = await request(app.getHttpServer())
        .post('/v1/clinics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(409);

      expect(response.body.message).toContain('HCI Code already exists');
    });

    it('should reject unauthorized access (nurse)', async () => {
      const createDto = {
        name: 'Unauthorized Clinic',
        hciCode: 'UNAUTH1',
      };

      await request(app.getHttpServer())
        .post('/v1/clinics')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send(createDto)
        .expect(403);
    });
  });

  describe('GET /v1/clinics', () => {
    it('should return all clinics for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/clinics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const clinic = response.body.data[0];
      expect(clinic).toHaveProperty('id');
      expect(clinic).toHaveProperty('name');
      expect(clinic).toHaveProperty('hciCode');
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/clinics?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.meta.limit).toBe(1);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });

    it('should reject unauthorized access (nurse)', async () => {
      await request(app.getHttpServer())
        .get('/v1/clinics')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(403);
    });
  });

  describe('GET /v1/clinics/:id', () => {
    it('should return clinic details with doctors', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/clinics/${clinicId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('doctors');
      expect(Array.isArray(response.body.doctors)).toBe(true);

      if (response.body.doctors.length > 0) {
        const doctor = response.body.doctors[0];
        expect(doctor).toHaveProperty('id');
        expect(doctor).toHaveProperty('name');
        expect(doctor).toHaveProperty('mcrNumber');
        expect(doctor).toHaveProperty('isPrimary');
      }
    });

    it('should return 404 for non-existent clinic', async () => {
      await request(app.getHttpServer())
        .get('/v1/clinics/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /v1/clinics/:id/doctors', () => {
    it('should return doctors for a clinic (admin)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/clinics/${clinicId}/doctors`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const doctor = response.body[0];
        expect(doctor).toHaveProperty('id');
        expect(doctor).toHaveProperty('name');
        expect(doctor).toHaveProperty('email');
        expect(doctor).toHaveProperty('mcrNumber');
        expect(doctor).toHaveProperty('isPrimary');
      }
    });

    it('should allow nurse to get doctors at clinic', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/clinics/${clinicId}/doctors`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /v1/clinics/:id', () => {
    it('should update clinic details', async () => {
      if (!testClinicId) {
        // Create a test clinic first
        const createResponse = await request(app.getHttpServer())
          .post('/v1/clinics')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Clinic To Update',
            hciCode: 'UPD0001',
          })
          .expect(201);
        testClinicId = createResponse.body.id;
      }

      const updateDto = {
        name: 'Updated E2E Clinic',
        address: '456 Updated Street',
      };

      const response = await request(app.getHttpServer())
        .put(`/v1/clinics/${testClinicId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.address).toBe(updateDto.address);
    });

    it('should reject duplicate HCI code on update', async () => {
      if (!testClinicId) {
        return; // Skip if no test clinic
      }

      await request(app.getHttpServer())
        .put(`/v1/clinics/${testClinicId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ hciCode: 'HCI0001' }) // Existing HCI code
        .expect(409);
    });
  });

  describe('DELETE /v1/clinics/:id', () => {
    it('should prevent deletion of clinic with users', async () => {
      // Try to delete the main clinic (has users from seed)
      const response = await request(app.getHttpServer())
        .delete(`/v1/clinics/${clinicId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);

      expect(response.body.message).toContain(
        'Cannot delete clinic with existing users',
      );
    });

    it('should delete empty clinic successfully', async () => {
      // Create a new clinic specifically for deletion
      const createResponse = await request(app.getHttpServer())
        .post('/v1/clinics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Clinic To Delete',
          hciCode: 'DEL0001',
        })
        .expect(201);

      const clinicToDelete = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/v1/clinics/${clinicToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Clinic deleted successfully');

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/v1/clinics/${clinicToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('HCI Code Validation', () => {
    it('should accept valid 7-character alphanumeric HCI codes', async () => {
      const validCodes = ['HCI9999', 'ABC1234', 'XYZ0000'];

      for (const hciCode of validCodes) {
        const response = await request(app.getHttpServer())
          .post('/v1/clinics')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Clinic ${hciCode}`,
            hciCode,
          })
          .expect(201);

        expect(response.body.hciCode).toBe(hciCode);

        // Clean up
        await prisma.clinic.delete({ where: { id: response.body.id } });
      }
    });

    it('should reject invalid HCI code formats', async () => {
      const invalidCodes = [
        'HCI-001', // Contains hyphen
        'HCI001',  // Only 6 characters
        'HCI00001', // 8 characters
        'hci0001', // Lowercase
        'HCI 001', // Contains space
      ];

      for (const hciCode of invalidCodes) {
        await request(app.getHttpServer())
          .post('/v1/clinics')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Invalid Clinic ${hciCode}`,
            hciCode,
          })
          .expect(400);
      }
    });
  });
});
