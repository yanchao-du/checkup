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
});
