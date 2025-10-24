import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    
    const [clinics, total] = await Promise.all([
      this.prisma.clinic.findMany({
        select: {
          id: true,
          name: true,
          hciCode: true,
          registrationNumber: true,
          address: true,
          phone: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.clinic.count(),
    ]);

    return {
      data: clinics,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        hciCode: true,
        registrationNumber: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        doctorClinics: {
          select: {
            isPrimary: true,
            doctor: {
              select: {
                id: true,
                name: true,
                email: true,
                mcrNumber: true,
                status: true,
              },
            },
          },
          orderBy: {
            doctor: {
              name: 'asc',
            },
          },
        },
        nurseClinics: {
          select: {
            isPrimary: true,
            nurse: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
              },
            },
          },
          orderBy: {
            nurse: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    // Transform the response to have a cleaner structure
    return {
      ...clinic,
      doctors: clinic.doctorClinics.map(dc => ({
        ...dc.doctor,
        isPrimary: dc.isPrimary,
      })),
      nurses: clinic.nurseClinics.map(nc => ({
        ...nc.nurse,
        isPrimary: nc.isPrimary,
      })),
      doctorClinics: undefined,
      nurseClinics: undefined,
    };
  }

  async create(createClinicDto: CreateClinicDto) {
    // Check if HCI code already exists (if provided)
    if (createClinicDto.hciCode) {
      const existingClinic = await this.prisma.clinic.findUnique({
        where: { hciCode: createClinicDto.hciCode },
      });

      if (existingClinic) {
        throw new ConflictException('HCI Code already exists');
      }
    }

    // Check if registration number already exists (if provided)
    if (createClinicDto.registrationNumber) {
      const existingClinic = await this.prisma.clinic.findUnique({
        where: { registrationNumber: createClinicDto.registrationNumber },
      });

      if (existingClinic) {
        throw new ConflictException('Registration number already exists');
      }
    }

    const clinic = await this.prisma.clinic.create({
      data: {
        name: createClinicDto.name,
        hciCode: createClinicDto.hciCode,
        registrationNumber: createClinicDto.registrationNumber,
        address: createClinicDto.address,
        phone: createClinicDto.phone,
        email: createClinicDto.email,
      },
      select: {
        id: true,
        name: true,
        hciCode: true,
        registrationNumber: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return clinic;
  }

  async update(id: string, updateClinicDto: UpdateClinicDto) {
    // Check if clinic exists
    await this.findOne(id);

    // If HCI code is being updated, check for conflicts
    if (updateClinicDto.hciCode) {
      const existingClinic = await this.prisma.clinic.findUnique({
        where: { hciCode: updateClinicDto.hciCode },
      });

      if (existingClinic && existingClinic.id !== id) {
        throw new ConflictException('HCI Code already exists');
      }
    }

    // If registration number is being updated, check for conflicts
    if (updateClinicDto.registrationNumber) {
      const existingClinic = await this.prisma.clinic.findUnique({
        where: { registrationNumber: updateClinicDto.registrationNumber },
      });

      if (existingClinic && existingClinic.id !== id) {
        throw new ConflictException('Registration number already exists');
      }
    }

    const clinic = await this.prisma.clinic.update({
      where: { id },
      data: {
        name: updateClinicDto.name,
        hciCode: updateClinicDto.hciCode,
        registrationNumber: updateClinicDto.registrationNumber,
        address: updateClinicDto.address,
        phone: updateClinicDto.phone,
        email: updateClinicDto.email,
      },
      select: {
        id: true,
        name: true,
        hciCode: true,
        registrationNumber: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return clinic;
  }

  async remove(id: string) {
    // Check if clinic exists
    await this.findOne(id);

    // Check if clinic has any users
    const usersCount = await this.prisma.user.count({
      where: { clinicId: id },
    });

    if (usersCount > 0) {
      throw new ConflictException(
        'Cannot delete clinic with existing users. Please reassign or remove users first.',
      );
    }

    await this.prisma.clinic.delete({
      where: { id },
    });

    return { message: 'Clinic deleted successfully' };
  }

  async getDoctors(id: string) {
    // Check if clinic exists
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    const doctorClinics = await this.prisma.doctorClinic.findMany({
      where: { clinicId: id },
      select: {
        isPrimary: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            mcrNumber: true,
            status: true,
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

  async getNurses(id: string) {
    // Check if clinic exists
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    const nurseClinics = await this.prisma.nurseClinic.findMany({
      where: { clinicId: id },
      select: {
        isPrimary: true,
        nurse: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
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
}
