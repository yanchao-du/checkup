import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CorpPassStrategy } from './strategies/corppass.strategy';
import { CorpPassValidatorService } from './services/corppass-validator.service';
import { SessionService } from './services/session.service';
import { UserSessionService } from './services/user-session.service';
import { CorpPassExceptionFilter } from './filters/corppass-exception.filter';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    CorpPassStrategy,
    CorpPassValidatorService,
    SessionService,
    UserSessionService,
    CorpPassExceptionFilter,
  ],
  exports: [AuthService, SessionService, UserSessionService],
})
export class AuthModule {}
