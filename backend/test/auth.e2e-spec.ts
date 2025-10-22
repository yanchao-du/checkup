import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/v1/auth/login (POST)', () => {
    it('should login successfully with valid credentials (doctor)', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'doctor@clinic.sg',
          password: 'password',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('doctor@clinic.sg');
          expect(res.body.user.role).toBe('doctor');
          expect(res.body.user.name).toBe('Dr. Sarah Tan');
          expect(res.body.user).toHaveProperty('clinicId');
          expect(res.body.user).toHaveProperty('clinicName');
        });
    });

    it('should login successfully with valid credentials (nurse)', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'nurse@clinic.sg',
          password: 'password',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.role).toBe('nurse');
          expect(res.body.user.name).toBe('Nurse Mary Lim');
        });
    });

    it('should login successfully with valid credentials (admin)', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'admin@clinic.sg',
          password: 'password',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.role).toBe('admin');
          expect(res.body.user.name).toBe('Admin John Wong');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'invalid@clinic.sg',
          password: 'password',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'doctor@clinic.sg',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('should fail with missing credentials', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({})
        .expect(400); // Validation error for missing required fields
    });
  });

  describe('/v1/auth/me (GET)', () => {
    let doctorToken: string;
    let nurseToken: string;

    beforeAll(async () => {
      // Get doctor token
      const doctorRes = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'doctor@clinic.sg',
          password: 'password',
        });
      doctorToken = doctorRes.body.token;

      // Get nurse token
      const nurseRes = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'nurse@clinic.sg',
          password: 'password',
        });
      nurseToken = nurseRes.body.token;
    });

    it('should return current user with valid token (doctor)', () => {
      return request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('doctor@clinic.sg');
          expect(res.body.role).toBe('doctor');
          expect(res.body.name).toBe('Dr. Sarah Tan');
        });
    });

    it('should return current user with valid token (nurse)', () => {
      return request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('nurse@clinic.sg');
          expect(res.body.role).toBe('nurse');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .get('/v1/auth/me')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/v1/auth/logout (POST)', () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'doctor@clinic.sg',
          password: 'password',
        });
      token = res.body.token;
    });

    it('should logout successfully with valid token', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Logged out successfully');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/logout')
        .expect(401);
    });
  });
});
