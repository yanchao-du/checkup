import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(clinicId: string, page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { clinicId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { email: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { clinicId } }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findDoctors(clinicId: string) {
    const doctors = await this.prisma.user.findMany({
      where: {
        clinicId,
        role: 'doctor',
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });

    return doctors;
  }

  async findOne(id: string, clinicId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, clinicId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(clinicId: string, createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        clinicId,
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role,
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, clinicId: string, updateUserDto: UpdateUserDto) {
    // Check if user exists and belongs to clinic
    await this.findOne(id, clinicId);

    // If email is being updated, check for conflicts
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: any = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      role: updateUserDto.role,
      status: updateUserDto.status,
    };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return user;
  }

  async remove(id: string, clinicId: string) {
    // Check if user exists and belongs to clinic
    await this.findOne(id, clinicId);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async getDefaultDoctor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        defaultDoctorId: true,
        defaultDoctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      defaultDoctorId: user.defaultDoctorId,
      defaultDoctor: user.defaultDoctor,
    };
  }

  async setDefaultDoctor(userId: string, defaultDoctorId: string) {
    // Verify the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify the doctor exists and is in the same clinic
    if (defaultDoctorId) {
      const doctor = await this.prisma.user.findFirst({
        where: {
          id: defaultDoctorId,
          clinicId: user.clinicId,
          role: 'doctor',
          status: 'active',
        },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found or inactive');
      }
    }

    // Update the user's default doctor
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { defaultDoctorId },
      select: {
        id: true,
        defaultDoctorId: true,
        defaultDoctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Default doctor updated successfully',
      defaultDoctorId: updatedUser.defaultDoctorId,
      defaultDoctor: updatedUser.defaultDoctor,
    };
  }
}
