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
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            // Admins still have direct clinicId
            { clinicId, role: 'admin' },
            // Doctors are associated through DoctorClinic junction table
            {
              role: 'doctor',
              doctorClinics: {
                some: {
                  clinicId,
                },
              },
            },
            // Nurses are associated through NurseClinic junction table
            {
              role: 'nurse',
              nurseClinics: {
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
            { clinicId, role: 'admin' },
            {
              role: 'doctor',
              doctorClinics: {
                some: {
                  clinicId,
                },
              },
            },
            {
              role: 'nurse',
              nurseClinics: {
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

  async findNurses(clinicId: string) {
    // Find all nurses who work at this clinic (either as primary or secondary)
    const nurseClinics = await this.prisma.nurseClinic.findMany({
      where: {
        clinicId,
        nurse: {
          status: 'active',
        },
      },
      select: {
        isPrimary: true,
        nurse: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        nurse: {
          name: 'asc',
        },
      },
    });

    return nurseClinics.map(nc => ({
      ...nc.nurse,
      isPrimary: nc.isPrimary,
    }));
  }

  async findOne(id: string, clinicId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        OR: [
          { clinicId, role: 'admin' },
          {
            role: 'doctor',
            doctorClinics: {
              some: { clinicId },
            },
          },
          {
            role: 'nurse',
            nurseClinics: {
              some: { clinicId },
            },
          },
        ],
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
        nurseClinics: {
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
        nurseClinics: undefined,
      };
    }

    if (user.role === 'nurse' && user.nurseClinics) {
      return {
        ...user,
        clinics: user.nurseClinics.map(nc => ({
          ...nc.clinic,
          isPrimary: nc.isPrimary,
        })),
        doctorClinics: undefined,
        nurseClinics: undefined,
      };
    }

    return {
      ...user,
      doctorClinics: undefined,
      nurseClinics: undefined,
    };
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

    // If creating a nurse, automatically create NurseClinic relationship with primary clinic
    if (createUserDto.role === 'nurse') {
      await this.prisma.nurseClinic.create({
        data: {
          nurseId: user.id,
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
      favoriteExamTypes: updateUserDto.favoriteExamTypes,
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
        favoriteExamTypes: true,
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

  async updateFavoriteExamTypes(userId: string, favoriteExamTypes: string[]) {
    // Verify the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the user's favorite exam types
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { favoriteExamTypes },
      select: {
        id: true,
        favoriteExamTypes: true,
      },
    });

    return {
      id: updatedUser.id,
      favoriteExamTypes: updatedUser.favoriteExamTypes,
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

  // Nurse-Clinic relationship management
  async assignNurseToClinic(
    nurseId: string,
    clinicId: string,
    isPrimary: boolean = false,
  ) {
    // Verify the nurse exists
    const nurse = await this.prisma.user.findFirst({
      where: {
        id: nurseId,
        role: 'nurse',
      },
    });

    if (!nurse) {
      throw new NotFoundException('Nurse not found');
    }

    // Verify the clinic exists
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    // Check if relationship already exists
    const existing = await this.prisma.nurseClinic.findUnique({
      where: {
        nurseId_clinicId: {
          nurseId,
          clinicId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Nurse is already assigned to this clinic');
    }

    // If setting as primary, unset other primary clinics
    if (isPrimary) {
      await this.prisma.nurseClinic.updateMany({
        where: { nurseId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const nurseClinic = await this.prisma.nurseClinic.create({
      data: {
        nurseId,
        clinicId,
        isPrimary,
      },
      select: {
        nurseId: true,
        clinicId: true,
        isPrimary: true,
        nurse: {
          select: {
            id: true,
            name: true,
            email: true,
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

    return nurseClinic;
  }

  async removeNurseFromClinic(nurseId: string, clinicId: string) {
    // Verify the relationship exists
    const nurseClinic = await this.prisma.nurseClinic.findUnique({
      where: {
        nurseId_clinicId: {
          nurseId,
          clinicId,
        },
      },
    });

    if (!nurseClinic) {
      throw new NotFoundException('Nurse is not assigned to this clinic');
    }

    // Prevent removal if it's the primary clinic and the only clinic
    if (nurseClinic.isPrimary) {
      const clinicCount = await this.prisma.nurseClinic.count({
        where: { nurseId },
      });

      if (clinicCount === 1) {
        throw new ConflictException(
          'Cannot remove primary clinic. Nurse must have at least one clinic assignment.',
        );
      }
    }

    await this.prisma.nurseClinic.delete({
      where: {
        nurseId_clinicId: {
          nurseId,
          clinicId,
        },
      },
    });

    return { message: 'Nurse removed from clinic successfully' };
  }

  async setNursePrimaryClinic(nurseId: string, clinicId: string) {
    // Verify the relationship exists
    const nurseClinic = await this.prisma.nurseClinic.findUnique({
      where: {
        nurseId_clinicId: {
          nurseId,
          clinicId,
        },
      },
    });

    if (!nurseClinic) {
      throw new NotFoundException('Nurse is not assigned to this clinic');
    }

    // Unset all other primary clinics for this nurse
    await this.prisma.nurseClinic.updateMany({
      where: { nurseId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set the new primary clinic
    const updated = await this.prisma.nurseClinic.update({
      where: {
        nurseId_clinicId: {
          nurseId,
          clinicId,
        },
      },
      data: { isPrimary: true },
      select: {
        nurseId: true,
        clinicId: true,
        isPrimary: true,
        nurse: {
          select: {
            id: true,
            name: true,
            email: true,
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

  async getNurseClinics(nurseId: string) {
    const nurse = await this.prisma.user.findFirst({
      where: {
        id: nurseId,
        role: 'nurse',
      },
    });

    if (!nurse) {
      throw new NotFoundException('Nurse not found');
    }

    const nurseClinics = await this.prisma.nurseClinic.findMany({
      where: { nurseId },
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

    return nurseClinics.map(nc => ({
      ...nc.clinic,
      isPrimary: nc.isPrimary,
    }));
  }

  /**
   * Get all clinics associated with the current user (doctor or nurse)
   * Returns clinic details including name, HCI code, and phone number
   */
  async getUserClinics(userId: string, role: string) {
    if (role === 'doctor') {
      const doctor = await this.prisma.user.findFirst({
        where: {
          id: userId,
          role: 'doctor',
        },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      const doctorClinics = await this.prisma.doctorClinic.findMany({
        where: { doctorId: userId },
        select: {
          isPrimary: true,
          clinic: {
            select: {
              id: true,
              name: true,
              hciCode: true,
              phone: true,
              address: true,
            },
          },
        },
        orderBy: {
          isPrimary: 'desc', // Primary clinic first
        },
      });

      return doctorClinics.map(dc => ({
        id: dc.clinic.id,
        name: dc.clinic.name,
        hciCode: dc.clinic.hciCode,
        phone: dc.clinic.phone,
        address: dc.clinic.address,
        isPrimary: dc.isPrimary,
      }));
    } else if (role === 'nurse') {
      const nurse = await this.prisma.user.findFirst({
        where: {
          id: userId,
          role: 'nurse',
        },
      });

      if (!nurse) {
        throw new NotFoundException('Nurse not found');
      }

      const nurseClinics = await this.prisma.nurseClinic.findMany({
        where: { nurseId: userId },
        select: {
          isPrimary: true,
          clinic: {
            select: {
              id: true,
              name: true,
              hciCode: true,
              phone: true,
              address: true,
            },
          },
        },
        orderBy: {
          isPrimary: 'desc', // Primary clinic first
        },
      });

      return nurseClinics.map(nc => ({
        id: nc.clinic.id,
        name: nc.clinic.name,
        hciCode: nc.clinic.hciCode,
        phone: nc.clinic.phone,
        address: nc.clinic.address,
        isPrimary: nc.isPrimary,
      }));
    } else {
      // Admins work with a single clinic
      const admin = await this.prisma.user.findFirst({
        where: {
          id: userId,
          role: 'admin',
        },
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
              hciCode: true,
              phone: true,
              address: true,
            },
          },
        },
      });

      if (!admin) {
        throw new NotFoundException('User not found');
      }

      return [
        {
          id: admin.clinic.id,
          name: admin.clinic.name,
          hciCode: admin.clinic.hciCode,
          phone: admin.clinic.phone,
          address: admin.clinic.address,
          isPrimary: true,
        },
      ];
    }
  }
}
