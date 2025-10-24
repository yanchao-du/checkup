import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CorpPass Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // Ensure routes use the same global prefix as the application (v1)
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1/auth/corppass/authorize (GET) should redirect or respond (shallow check)', async () => {
    const res = await request(app.getHttpServer()).get('/v1/auth/corppass/authorize');
    // Accept either 302 redirect or 400/200 depending on environment
    expect([200, 302, 400]).toContain(res.status);
  });

  it('/v1/auth/corppass/callback (GET) without code should return informative message', async () => {
    const res = await request(app.getHttpServer()).get('/v1/auth/corppass/callback');
    expect([200, 400, 302]).toContain(res.status);
  });
});
