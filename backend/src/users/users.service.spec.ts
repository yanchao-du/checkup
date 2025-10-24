import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    doctorClinic: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    nurseClinic: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    clinic: {
      findUnique: jest.fn(),
    },
  };

  const clinicId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  const mockUser = {
    id: userId,
    name: 'Test User',
    email: 'test@clinic.sg',
    role: 'doctor',
    status: 'active',
    lastLoginAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(clinicId, 1, 20);

      expect(result).toEqual({
        data: users,
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
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
        select: expect.any(Object),
        orderBy: { email: 'asc' },
        skip: 0,
        take: 20,
      });
      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: {
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
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(50);

      const result = await service.findAll(clinicId, 2, 10);

      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(5);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne(userId, clinicId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: userId,
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
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, clinicId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createUserDto = {
      name: 'New User',
      email: 'newuser@clinic.sg',
      password: 'password123',
      role: 'nurse' as const,
    };

    it('should create a new user with hashed password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(clinicId, createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          clinicId,
          name: createUserDto.name,
          email: createUserDto.email,
          passwordHash: 'hashedPassword',
          role: createUserDto.role,
          mcrNumber: undefined,
          status: 'active',
        },
        select: expect.any(Object),
      });
    });

    it('should create doctor with MCR number and auto-create DoctorClinic', async () => {
      const doctorDto = {
        name: 'Dr. Sarah Tan',
        email: 'sarah.tan@clinic.sg',
        password: 'password123',
        role: 'doctor' as const,
        mcrNumber: 'M12345A',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null); // email check
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        ...doctorDto,
      });
      mockPrismaService.doctorClinic.create.mockResolvedValue({
        doctorId: userId,
        clinicId,
        isPrimary: true,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(clinicId, doctorDto);

      expect(result.mcrNumber).toBe('M12345A');
      expect(mockPrismaService.doctorClinic.create).toHaveBeenCalledWith({
        data: {
          doctorId: result.id,
          clinicId,
          isPrimary: true,
        },
      });
    });

    it('should throw ConflictException if MCR number already exists', async () => {
      const doctorDto = {
        name: 'Dr. Sarah Tan',
        email: 'sarah.tan@clinic.sg',
        password: 'password123',
        role: 'doctor' as const,
        mcrNumber: 'M12345A',
      };
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check passes
        .mockResolvedValueOnce(mockUser); // MCR check fails

      await expect(service.create(clinicId, doctorDto)).rejects.toThrow(
        ConflictException,
      );
      
      // Reset mocks for second assertion
      jest.clearAllMocks();
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check passes
        .mockResolvedValueOnce(mockUser); // MCR check fails
        
      await expect(service.create(clinicId, doctorDto)).rejects.toThrow(
        'MCR Number already exists',
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(clinicId, createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto = {
      name: 'Updated Name',
      role: 'admin' as const,
    };

    it('should update a user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });

      const result = await service.update(userId, clinicId, updateUserDto);

      expect(result.name).toBe('Updated Name');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining({
          name: 'Updated Name',
          role: 'admin',
        }),
        select: expect.any(Object),
      });
    });

    it('should hash password if provided in update', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      await service.update(userId, clinicId, { password: 'newPassword123' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: 'newHashedPassword',
          }),
        }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, clinicId, updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already taken by another user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        id: 'different-id',
      });

      await expect(
        service.update(userId, clinicId, { email: 'taken@clinic.sg' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if MCR number already taken', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        id: 'different-id',
        mcrNumber: 'M99999Z',
      });

      await expect(
        service.update(userId, clinicId, { mcrNumber: 'M99999Z' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(userId, clinicId, { mcrNumber: 'M99999Z' }),
      ).rejects.toThrow('MCR Number already exists');
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(userId, clinicId);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, clinicId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignDoctorToClinic', () => {
    const doctorId = '550e8400-e29b-41d4-a716-446655440002';
    const secondClinicId = '550e8400-e29b-41d4-a716-446655440003';

    const mockDoctor = {
      id: doctorId,
      name: 'Dr. Sarah Tan',
      email: 'sarah.tan@clinic.sg',
      role: 'doctor',
      mcrNumber: 'M12345A',
    };

    const mockClinic = {
      id: secondClinicId,
      name: 'CareWell Medical Centre',
      hciCode: 'HCI0002',
    };

    it('should assign doctor to clinic', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockDoctor);
      mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);
      mockPrismaService.doctorClinic.findUnique.mockResolvedValue(null);
      mockPrismaService.doctorClinic.create.mockResolvedValue({
        doctorId,
        clinicId: secondClinicId,
        isPrimary: false,
        doctor: mockDoctor,
        clinic: mockClinic,
      });

      const result = await service.assignDoctorToClinic(
        doctorId,
        secondClinicId,
        false,
      );

      expect(result.doctorId).toBe(doctorId);
      expect(result.clinicId).toBe(secondClinicId);
      expect(result.isPrimary).toBe(false);
      expect(mockPrismaService.doctorClinic.create).toHaveBeenCalled();
    });

    it('should set as primary and unset others when isPrimary is true', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockDoctor);
      mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);
      mockPrismaService.doctorClinic.findUnique.mockResolvedValue(null);
      mockPrismaService.doctorClinic.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.doctorClinic.create.mockResolvedValue({
        doctorId,
        clinicId: secondClinicId,
        isPrimary: true,
        doctor: mockDoctor,
        clinic: mockClinic,
      });

      await service.assignDoctorToClinic(doctorId, secondClinicId, true);

      expect(mockPrismaService.doctorClinic.updateMany).toHaveBeenCalledWith({
        where: { doctorId, isPrimary: true },
        data: { isPrimary: false },
      });
      expect(mockPrismaService.doctorClinic.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isPrimary: true,
          }),
        }),
      );
    });

    it('should throw NotFoundException when doctor not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.assignDoctorToClinic(doctorId, secondClinicId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.assignDoctorToClinic(doctorId, secondClinicId),
      ).rejects.toThrow('Doctor not found');
    });

    it('should throw NotFoundException when clinic not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockDoctor);
      mockPrismaService.clinic.findUnique.mockResolvedValue(null);

      await expect(
        service.assignDoctorToClinic(doctorId, secondClinicId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.assignDoctorToClinic(doctorId, secondClinicId),
      ).rejects.toThrow('Clinic not found');
    });

    it('should throw ConflictException when relationship already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockDoctor);
      mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);
      mockPrismaService.doctorClinic.findUnique.mockResolvedValue({
        doctorId,
        clinicId: secondClinicId,
        isPrimary: false,
      });

      await expect(
        service.assignDoctorToClinic(doctorId, secondClinicId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.assignDoctorToClinic(doctorId, secondClinicId),
      ).rejects.toThrow('Doctor is already assigned to this clinic');
    });
  });

  describe('removeDoctorFromClinic', () => {
    const doctorId = '550e8400-e29b-41d4-a716-446655440002';
    const secondClinicId = '550e8400-e29b-41d4-a716-446655440003';

    it('should remove doctor from clinic', async () => {
      mockPrismaService.doctorClinic.findUnique.mockResolvedValue({
        doctorId,
        clinicId: secondClinicId,
        isPrimary: false,
      });
      mockPrismaService.doctorClinic.delete.mockResolvedValue({});

      const result = await service.removeDoctorFromClinic(
        doctorId,
        secondClinicId,
      );

      expect(result).toEqual({
        message: 'Doctor removed from clinic successfully',
      });
      expect(mockPrismaService.doctorClinic.delete).toHaveBeenCalledWith({
        where: { doctorId_clinicId: { doctorId, clinicId: secondClinicId } },
      });
    });

    it('should throw NotFoundException when relationship not found', async () => {
      mockPrismaService.doctorClinic.findUnique.mockResolvedValue(null);

      await expect(
        service.removeDoctorFromClinic(doctorId, secondClinicId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.removeDoctorFromClinic(doctorId, secondClinicId),
      ).rejects.toThrow('Doctor is not assigned to this clinic');
    });

    it('should throw ConflictException when removing last primary clinic', async () => {
      mockPrismaService.doctorClinic.findUnique.mockResolvedValue({
        doctorId,
        clinicId: secondClinicId,
        isPrimary: true,
      });
      mockPrismaService.doctorClinic.count.mockResolvedValue(1);

      await expect(
        service.removeDoctorFromClinic(doctorId, secondClinicId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.removeDoctorFromClinic(doctorId, secondClinicId),
      ).rejects.toThrow(
        'Cannot remove primary clinic. Doctor must have at least one clinic assignment.',
      );
    });

    it('should allow removing primary clinic if doctor has multiple clinics', async () => {
      mockPrismaService.doctorClinic.findUnique.mockResolvedValue({
        doctorId,
        clinicId: secondClinicId,
        isPrimary: true,
      });
      mockPrismaService.doctorClinic.count.mockResolvedValue(2);
      mockPrismaService.doctorClinic.delete.mockResolvedValue({});

      const result = await service.removeDoctorFromClinic(
        doctorId,
        secondClinicId,
      );

      expect(result.message).toBe('Doctor removed from clinic successfully');
    });
  });

  describe('setPrimaryClinic', () => {
    const doctorId = '550e8400-e29b-41d4-a716-446655440002';
    const secondClinicId = '550e8400-e29b-41d4-a716-446655440003';

    const mockDoctor = {
      id: doctorId,
      name: 'Dr. Sarah Tan',
      email: 'sarah.tan@clinic.sg',
      mcrNumber: 'M12345A',
    };

    const mockClinic = {
      id: secondClinicId,
      name: 'CareWell Medical Centre',
      hciCode: 'HCI0002',
    };

    it('should set primary clinic', async () => {
      mockPrismaService.doctorClinic.findUnique.mockResolvedValue({
        doctorId,
        clinicId: secondClinicId,
        isPrimary: false,
      });
      mockPrismaService.doctorClinic.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.doctorClinic.update.mockResolvedValue({
        doctorId,
        clinicId: secondClinicId,
        isPrimary: true,
        doctor: mockDoctor,
        clinic: mockClinic,
      });

      const result = await service.setPrimaryClinic(doctorId, secondClinicId);

      expect(result.isPrimary).toBe(true);
      expect(mockPrismaService.doctorClinic.updateMany).toHaveBeenCalledWith({
        where: { doctorId, isPrimary: true },
        data: { isPrimary: false },
      });
      expect(mockPrismaService.doctorClinic.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when relationship not found', async () => {
      mockPrismaService.doctorClinic.findUnique.mockResolvedValue(null);

      await expect(
        service.setPrimaryClinic(doctorId, secondClinicId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.setPrimaryClinic(doctorId, secondClinicId),
      ).rejects.toThrow('Doctor is not assigned to this clinic');
    });
  });

  describe('getDoctorClinics', () => {
    const doctorId = '550e8400-e29b-41d4-a716-446655440002';

    const mockDoctor = {
      id: doctorId,
      name: 'Dr. Sarah Tan',
      email: 'sarah.tan@clinic.sg',
      role: 'doctor',
    };

    it('should return doctor clinics', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockDoctor);
      mockPrismaService.doctorClinic.findMany.mockResolvedValue([
        {
          isPrimary: true,
          clinic: {
            id: clinicId,
            name: 'HealthFirst Medical Clinic',
            hciCode: 'HCI0001',
            address: '123 Medical Street',
            phone: '+65 6123 4567',
          },
        },
        {
          isPrimary: false,
          clinic: {
            id: '550e8400-e29b-41d4-a716-446655440003',
            name: 'CareWell Medical Centre',
            hciCode: 'HCI0002',
            address: '456 Health Avenue',
            phone: '+65 6234 5678',
          },
        },
      ]);

      const result = await service.getDoctorClinics(doctorId);

      expect(result).toHaveLength(2);
      expect(result[0].isPrimary).toBe(true);
      expect(result[1].isPrimary).toBe(false);
      expect(mockPrismaService.doctorClinic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { doctorId },
          orderBy: { isPrimary: 'desc' },
        }),
      );
    });

    it('should throw NotFoundException when doctor not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.getDoctorClinics(doctorId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getDoctorClinics(doctorId)).rejects.toThrow(
        'Doctor not found',
      );
    });
  });

  describe('Nurse-Clinic Management', () => {
    const nurseId = '550e8400-e29b-41d4-a716-446655440004';
    const clinic2Id = '550e8400-e29b-41d4-a716-446655440005';

    const mockNurse = {
      id: nurseId,
      name: 'Nurse Jane Smith',
      email: 'jane.smith@clinic.sg',
      role: 'nurse',
      status: 'active',
    };

    const mockClinic = {
      id: clinicId,
      name: 'HealthFirst Medical Clinic',
      hciCode: 'HCI0001',
    };

    const mockClinic2 = {
      id: clinic2Id,
      name: 'CareWell Medical Centre',
      hciCode: 'HCI0002',
    };

    describe('assignNurseToClinic', () => {
      it('should assign nurse to clinic', async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockNurse);
        mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);
        mockPrismaService.nurseClinic.findUnique.mockResolvedValue(null);
        mockPrismaService.nurseClinic.create.mockResolvedValue({
          nurseId,
          clinicId,
          isPrimary: false,
          nurse: mockNurse,
          clinic: mockClinic,
        });

        const result = await service.assignNurseToClinic(
          nurseId,
          clinicId,
          false,
        );

        expect(result).toBeDefined();
        expect(result.nurseId).toBe(nurseId);
        expect(result.clinicId).toBe(clinicId);
        expect(mockPrismaService.nurseClinic.create).toHaveBeenCalledWith({
          data: {
            nurseId,
            clinicId,
            isPrimary: false,
          },
          select: expect.any(Object),
        });
      });

      it('should assign nurse as primary clinic', async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockNurse);
        mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);
        mockPrismaService.nurseClinic.findUnique.mockResolvedValue(null);
        mockPrismaService.nurseClinic.updateMany.mockResolvedValue({ count: 1 });
        mockPrismaService.nurseClinic.create.mockResolvedValue({
          nurseId,
          clinicId,
          isPrimary: true,
          nurse: mockNurse,
          clinic: mockClinic,
        });

        const result = await service.assignNurseToClinic(
          nurseId,
          clinicId,
          true,
        );

        expect(result.isPrimary).toBe(true);
        expect(mockPrismaService.nurseClinic.updateMany).toHaveBeenCalledWith({
          where: { nurseId, isPrimary: true },
          data: { isPrimary: false },
        });
      });

      it('should throw NotFoundException when nurse not found', async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(null);

        await expect(
          service.assignNurseToClinic(nurseId, clinicId, false),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.assignNurseToClinic(nurseId, clinicId, false),
        ).rejects.toThrow('Nurse not found');
      });

      it('should throw NotFoundException when clinic not found', async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockNurse);
        mockPrismaService.clinic.findUnique.mockResolvedValue(null);

        await expect(
          service.assignNurseToClinic(nurseId, clinicId, false),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.assignNurseToClinic(nurseId, clinicId, false),
        ).rejects.toThrow('Clinic not found');
      });

      it('should throw ConflictException when relationship already exists', async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockNurse);
        mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);
        mockPrismaService.nurseClinic.findUnique.mockResolvedValue({
          nurseId,
          clinicId,
          isPrimary: false,
        });

        await expect(
          service.assignNurseToClinic(nurseId, clinicId, false),
        ).rejects.toThrow(ConflictException);
        await expect(
          service.assignNurseToClinic(nurseId, clinicId, false),
        ).rejects.toThrow('Nurse is already assigned to this clinic');
      });
    });

    describe('removeNurseFromClinic', () => {
      it('should remove nurse from clinic', async () => {
        mockPrismaService.nurseClinic.findUnique.mockResolvedValue({
          nurseId,
          clinicId,
          isPrimary: false,
        });
        mockPrismaService.nurseClinic.delete.mockResolvedValue({
          nurseId,
          clinicId,
        });

        const result = await service.removeNurseFromClinic(nurseId, clinicId);

        expect(result).toEqual({
          message: 'Nurse removed from clinic successfully',
        });
        expect(mockPrismaService.nurseClinic.delete).toHaveBeenCalledWith({
          where: {
            nurseId_clinicId: {
              nurseId,
              clinicId,
            },
          },
        });
      });

      it('should throw NotFoundException when relationship not found', async () => {
        mockPrismaService.nurseClinic.findUnique.mockResolvedValue(null);

        await expect(
          service.removeNurseFromClinic(nurseId, clinicId),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.removeNurseFromClinic(nurseId, clinicId),
        ).rejects.toThrow('Nurse is not assigned to this clinic');
      });

      it('should throw ConflictException when removing last clinic', async () => {
        mockPrismaService.nurseClinic.findUnique.mockResolvedValue({
          nurseId,
          clinicId,
          isPrimary: true,
        });
        mockPrismaService.nurseClinic.count.mockResolvedValue(1);

        await expect(
          service.removeNurseFromClinic(nurseId, clinicId),
        ).rejects.toThrow(ConflictException);
        await expect(
          service.removeNurseFromClinic(nurseId, clinicId),
        ).rejects.toThrow(
          'Cannot remove primary clinic. Nurse must have at least one clinic assignment.',
        );
      });

      it('should allow removing primary clinic when other clinics exist', async () => {
        mockPrismaService.nurseClinic.findUnique.mockResolvedValue({
          nurseId,
          clinicId,
          isPrimary: true,
        });
        mockPrismaService.nurseClinic.count.mockResolvedValue(2);
        mockPrismaService.nurseClinic.delete.mockResolvedValue({
          nurseId,
          clinicId,
        });

        const result = await service.removeNurseFromClinic(nurseId, clinicId);

        expect(result).toEqual({
          message: 'Nurse removed from clinic successfully',
        });
      });
    });

    describe('setNursePrimaryClinic', () => {
      it('should set primary clinic for nurse', async () => {
        mockPrismaService.nurseClinic.findUnique.mockResolvedValue({
          nurseId,
          clinicId,
          isPrimary: false,
        });
        mockPrismaService.nurseClinic.updateMany.mockResolvedValue({ count: 1 });
        mockPrismaService.nurseClinic.update.mockResolvedValue({
          nurseId,
          clinicId,
          isPrimary: true,
          nurse: mockNurse,
          clinic: mockClinic,
        });

        const result = await service.setNursePrimaryClinic(nurseId, clinicId);

        expect(result.isPrimary).toBe(true);
        expect(mockPrismaService.nurseClinic.updateMany).toHaveBeenCalledWith({
          where: { nurseId, isPrimary: true },
          data: { isPrimary: false },
        });
        expect(mockPrismaService.nurseClinic.update).toHaveBeenCalledWith({
          where: {
            nurseId_clinicId: {
              nurseId,
              clinicId,
            },
          },
          data: { isPrimary: true },
          select: expect.any(Object),
        });
      });

      it('should throw NotFoundException when relationship not found', async () => {
        mockPrismaService.nurseClinic.findUnique.mockResolvedValue(null);

        await expect(
          service.setNursePrimaryClinic(nurseId, clinicId),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.setNursePrimaryClinic(nurseId, clinicId),
        ).rejects.toThrow('Nurse is not assigned to this clinic');
      });
    });

    describe('getNurseClinics', () => {
      it('should return nurse clinics', async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockNurse);
        mockPrismaService.nurseClinic.findMany.mockResolvedValue([
          {
            isPrimary: true,
            clinic: {
              id: clinicId,
              name: 'HealthFirst Medical Clinic',
              hciCode: 'HCI0001',
              address: '123 Medical Street',
              phone: '+65 6123 4567',
            },
          },
          {
            isPrimary: false,
            clinic: {
              id: clinic2Id,
              name: 'CareWell Medical Centre',
              hciCode: 'HCI0002',
              address: '456 Health Avenue',
              phone: '+65 6234 5678',
            },
          },
        ]);

        const result = await service.getNurseClinics(nurseId);

        expect(result).toHaveLength(2);
        expect(result[0].isPrimary).toBe(true);
        expect(result[1].isPrimary).toBe(false);
        expect(mockPrismaService.nurseClinic.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { nurseId },
            orderBy: { isPrimary: 'desc' },
          }),
        );
      });

      it('should throw NotFoundException when nurse not found', async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(null);

        await expect(service.getNurseClinics(nurseId)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.getNurseClinics(nurseId)).rejects.toThrow(
          'Nurse not found',
        );
      });

      it('should return empty array when nurse has no clinics', async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockNurse);
        mockPrismaService.nurseClinic.findMany.mockResolvedValue([]);

        const result = await service.getNurseClinics(nurseId);

        expect(result).toEqual([]);
      });
    });
  });
});
