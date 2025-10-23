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
    
    // For many-to-many relationship, we need to find users who work at this clinic
    // OR users who are admin/nurse at this clinic
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            // Admins and nurses still have direct clinicId
            { clinicId },
            // Doctors are associated through DoctorClinic junction table
            {
              role: 'doctor',
              doctorClinics: {
                some: {
                  clinicId,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          mcrNumber: true,
          lastLoginAt: true,
          createdAt: true,
          clinicId: true,
        },
        orderBy: { email: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { clinicId },
            {
              role: 'doctor',
              doctorClinics: {
                some: {
                  clinicId,
                },
              },
            },
          ],
        },
      }),
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
    // Find all doctors who work at this clinic (either as primary or secondary)
    const doctorClinics = await this.prisma.doctorClinic.findMany({
      where: {
        clinicId,
        doctor: {
          status: 'active',
        },
      },
      select: {
        isPrimary: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            mcrNumber: true,
          },
        },
      },
      orderBy: {
        doctor: {
          name: 'asc',
        },
      },
    });

    return doctorClinics.map(dc => ({
      ...dc.doctor,
      isPrimary: dc.isPrimary,
    }));
  }

  async findOne(id: string, clinicId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, clinicId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mcrNumber: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        doctorClinics: {
          select: {
            isPrimary: true,
            clinic: {
              select: {
                id: true,
                name: true,
                hciCode: true,
              },
            },
          },
          orderBy: {
            isPrimary: 'desc', // Primary clinic first
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Transform the response for cleaner structure
    if (user.role === 'doctor' && user.doctorClinics) {
      return {
        ...user,
        clinics: user.doctorClinics.map(dc => ({
          ...dc.clinic,
          isPrimary: dc.isPrimary,
        })),
        doctorClinics: undefined,
      };
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

    // Check if MCR number already exists (if provided for doctor)
    if (createUserDto.mcrNumber) {
      const existingMCR = await this.prisma.user.findUnique({
        where: { mcrNumber: createUserDto.mcrNumber },
      });

      if (existingMCR) {
        throw new ConflictException('MCR Number already exists');
      }
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
        mcrNumber: createUserDto.mcrNumber,
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mcrNumber: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    // If creating a doctor, automatically create DoctorClinic relationship with primary clinic
    if (createUserDto.role === 'doctor') {
      await this.prisma.doctorClinic.create({
        data: {
          doctorId: user.id,
          clinicId: clinicId,
          isPrimary: true,
        },
      });
    }

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

    // If MCR number is being updated, check for conflicts
    if (updateUserDto.mcrNumber) {
      const existingMCR = await this.prisma.user.findUnique({
        where: { mcrNumber: updateUserDto.mcrNumber },
      });

      if (existingMCR && existingMCR.id !== id) {
        throw new ConflictException('MCR Number already exists');
      }
    }

    const updateData: any = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      role: updateUserDto.role,
      status: updateUserDto.status,
      mcrNumber: updateUserDto.mcrNumber,
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
        mcrNumber: true,
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

  // Doctor-Clinic relationship management
  async assignDoctorToClinic(
    doctorId: string,
    clinicId: string,
    isPrimary: boolean = false,
  ) {
    // Verify the doctor exists
    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctorId,
        role: 'doctor',
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Verify the clinic exists
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    // Check if relationship already exists
    const existing = await this.prisma.doctorClinic.findUnique({
      where: {
        doctorId_clinicId: {
          doctorId,
          clinicId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Doctor is already assigned to this clinic');
    }

    // If setting as primary, unset other primary clinics
    if (isPrimary) {
      await this.prisma.doctorClinic.updateMany({
        where: { doctorId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const doctorClinic = await this.prisma.doctorClinic.create({
      data: {
        doctorId,
        clinicId,
        isPrimary,
      },
      select: {
        doctorId: true,
        clinicId: true,
        isPrimary: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            mcrNumber: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            hciCode: true,
          },
        },
      },
    });

    return doctorClinic;
  }

  async removeDoctorFromClinic(doctorId: string, clinicId: string) {
    // Verify the relationship exists
    const doctorClinic = await this.prisma.doctorClinic.findUnique({
      where: {
        doctorId_clinicId: {
          doctorId,
          clinicId,
        },
      },
    });

    if (!doctorClinic) {
      throw new NotFoundException('Doctor is not assigned to this clinic');
    }

    // Prevent removal if it's the primary clinic and the only clinic
    if (doctorClinic.isPrimary) {
      const clinicCount = await this.prisma.doctorClinic.count({
        where: { doctorId },
      });

      if (clinicCount === 1) {
        throw new ConflictException(
          'Cannot remove primary clinic. Doctor must have at least one clinic assignment.',
        );
      }
    }

    await this.prisma.doctorClinic.delete({
      where: {
        doctorId_clinicId: {
          doctorId,
          clinicId,
        },
      },
    });

    return { message: 'Doctor removed from clinic successfully' };
  }

  async setPrimaryClinic(doctorId: string, clinicId: string) {
    // Verify the relationship exists
    const doctorClinic = await this.prisma.doctorClinic.findUnique({
      where: {
        doctorId_clinicId: {
          doctorId,
          clinicId,
        },
      },
    });

    if (!doctorClinic) {
      throw new NotFoundException('Doctor is not assigned to this clinic');
    }

    // Unset all other primary clinics for this doctor
    await this.prisma.doctorClinic.updateMany({
      where: { doctorId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set the new primary clinic
    const updated = await this.prisma.doctorClinic.update({
      where: {
        doctorId_clinicId: {
          doctorId,
          clinicId,
        },
      },
      data: { isPrimary: true },
      select: {
        doctorId: true,
        clinicId: true,
        isPrimary: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            mcrNumber: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            hciCode: true,
          },
        },
      },
    });

    return updated;
  }

  async getDoctorClinics(doctorId: string) {
    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctorId,
        role: 'doctor',
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const doctorClinics = await this.prisma.doctorClinic.findMany({
      where: { doctorId },
      select: {
        isPrimary: true,
        clinic: {
          select: {
            id: true,
            name: true,
            hciCode: true,
            address: true,
            phone: true,
          },
        },
      },
      orderBy: {
        isPrimary: 'desc', // Primary clinic first
      },
    });

    return doctorClinics.map(dc => ({
      ...dc.clinic,
      isPrimary: dc.isPrimary,
    }));
  }
}
