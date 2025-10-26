import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
