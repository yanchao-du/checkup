import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { UsersModule } from './users/users.module';
import { ClinicsModule } from './clinics/clinics.module';
import { WellKnownController } from './well-known/well-known.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    SubmissionsModule,
    ApprovalsModule,
    UsersModule,
    ClinicsModule,
  ],
  controllers: [AppController, WellKnownController],
  providers: [AppService],
})
export class AppModule {}
