import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { CorpPassUserInfo } from './services/corppass-validator.service';
import { UserSessionService } from './services/user-session.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userSessionService: UserSessionService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { clinic: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is inactive');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create user session
    const sessionId = this.userSessionService.createSession(
      user.id,
      user.email,
      user.role,
      user.clinicId,
      'email',
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
      sessionId,  // Include session ID in JWT
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nric: user.nric ?? undefined,
        role: user.role,
        clinicId: user.clinicId,
        clinicName: user.clinic.name,
        authMethod: 'email' as const,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { clinic: true },
    });

    if (!user || user.status !== 'active') {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      nric: user.nric ?? undefined,
      role: user.role,
      clinicId: user.clinicId,
      clinicName: user.clinic.name,
    };
  }

  /**
   * Find or create user based on CorpPass authentication
   * @param corpPassInfo - CorpPass user information from validated ID token
   * @returns User object
   */
  async findOrCreateCorpPassUser(corpPassInfo: CorpPassUserInfo) {
    // First check if CorpPass user already exists
    const existingCorpPassUser = await this.prisma.corpPassUser.findUnique({
      where: { corpPassSub: corpPassInfo.sub },
      include: {
        user: {
          include: { clinic: true },
        },
      },
    });

    if (existingCorpPassUser) {
      // Existing CorpPass user - return associated user
      const user = existingCorpPassUser.user;
      
      if (user.status !== 'active') {
        throw new UnauthorizedException('Account is pending approval or inactive');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinicId,
        clinicName: user.clinic.name,
        authMethod: 'corppass' as const,
      };
    }

    // Check if user with this NRIC already exists (account linking)
    // NRIC is the primary identifier for Singapore users
    if (corpPassInfo.nric) {
      const existingNricUser = await this.prisma.user.findUnique({
        where: { nric: corpPassInfo.nric },
        include: { clinic: true },
      });

      if (existingNricUser) {
        // Link CorpPass to existing user by NRIC
        await this.prisma.corpPassUser.create({
          data: {
            userId: existingNricUser.id,
            corpPassSub: corpPassInfo.sub,
            uen: corpPassInfo.uen,
            nric: corpPassInfo.nric,
          },
        });

        if (existingNricUser.status !== 'active') {
          throw new UnauthorizedException('Account is pending approval or inactive');
        }

        // Update last login
        await this.prisma.user.update({
          where: { id: existingNricUser.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: existingNricUser.id,
          email: existingNricUser.email,
          name: existingNricUser.name,
          role: existingNricUser.role,
          clinicId: existingNricUser.clinicId,
          clinicName: existingNricUser.clinic.name,
          authMethod: 'corppass' as const,
        };
      }
    }

    // New CorpPass user - create with pending status
    // Get default clinic (or create placeholder)
    let defaultClinic = await this.prisma.clinic.findFirst();
    
    if (!defaultClinic) {
      // Create a default clinic if none exists
      defaultClinic = await this.prisma.clinic.create({
        data: {
          name: 'Pending Assignment',
          address: 'To be assigned',
        },
      });
    }

    // Create new user with pending status
    const newUser = await this.prisma.user.create({
      data: {
        email: corpPassInfo.email,
        name: corpPassInfo.name,
        nric: corpPassInfo.nric,
        passwordHash: '', // No password for CorpPass-only users
        role: 'nurse', // Default role
        status: 'inactive', // Pending admin approval
        clinicId: defaultClinic.id,
      },
      include: { clinic: true },
    });

    // Link CorpPass account
    await this.prisma.corpPassUser.create({
      data: {
        userId: newUser.id,
        corpPassSub: corpPassInfo.sub,
        uen: corpPassInfo.uen,
        nric: corpPassInfo.nric,
      },
    });

    // Throw error to prevent login - admin approval required
    throw new UnauthorizedException(
      'Account created successfully. Please wait for administrator approval before logging in.',
    );
  }
}
