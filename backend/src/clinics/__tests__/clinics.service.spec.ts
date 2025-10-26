import { Test, TestingModule } from '@nestjs/testing';
import { ClinicsService } from '../clinics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ClinicsService', () => {
  let service: ClinicsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    clinic: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    doctorClinic: {
      findMany: jest.fn(),
    },
  };

  const clinicId = '550e8400-e29b-41d4-a716-446655440000';
  const doctorId = '550e8400-e29b-41d4-a716-446655440001';

  const mockClinic = {
    id: clinicId,
    name: 'HealthFirst Medical Clinic',
    hciCode: 'HCI0001',
    registrationNumber: 'REG-001',
    address: '123 Medical Street',
    phone: '+65 6123 4567',
    email: 'info@healthfirst.sg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockDoctor = {
    id: doctorId,
    name: 'Dr. Sarah Tan',
    email: 'sarah.tan@clinic.sg',
    mcrNumber: 'M12345A',
    status: 'active',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClinicsService>(ClinicsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated clinics', async () => {
      const clinics = [mockClinic];
      mockPrismaService.clinic.findMany.mockResolvedValue(clinics);
      mockPrismaService.clinic.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: clinics,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(prisma.clinic.findMany).toHaveBeenCalledWith({
        select: expect.any(Object),
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10,
      });
    });

    it('should handle pagination correctly', async () => {
      const clinics = [mockClinic];
      mockPrismaService.clinic.findMany.mockResolvedValue(clinics);
      mockPrismaService.clinic.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(3);
      expect(prisma.clinic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return clinic with doctors', async () => {
      const clinicWithDoctors = {
        ...mockClinic,
        doctorClinics: [
          {
            isPrimary: true,
            doctor: mockDoctor,
          },
        ],
        nurseClinics: [],
      };
      mockPrismaService.clinic.findUnique.mockResolvedValue(clinicWithDoctors);

      const result = await service.findOne(clinicId);

      expect(result).toEqual({
        ...mockClinic,
        doctors: [
          {
            ...mockDoctor,
            isPrimary: true,
          },
        ],
        nurses: [],
      });
      expect(prisma.clinic.findUnique).toHaveBeenCalledWith({
        where: { id: clinicId },
        select: expect.objectContaining({
          doctorClinics: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundException when clinic not found', async () => {
      mockPrismaService.clinic.findUnique.mockResolvedValue(null);

      await expect(service.findOne(clinicId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(clinicId)).rejects.toThrow(
        'Clinic not found',
      );
    });
  });

  describe('create', () => {
    const createClinicDto = {
      name: 'New Clinic',
      hciCode: 'HCI0002',
      registrationNumber: 'REG-002',
      address: '456 Health Avenue',
      phone: '+65 6234 5678',
      email: 'info@newclinic.sg',
    };

    it('should create a clinic successfully', async () => {
      mockPrismaService.clinic.findUnique.mockResolvedValue(null);
      mockPrismaService.clinic.create.mockResolvedValue(mockClinic);

      const result = await service.create(createClinicDto);

      expect(result).toEqual(mockClinic);
      expect(prisma.clinic.create).toHaveBeenCalledWith({
        data: createClinicDto,
        select: expect.any(Object),
      });
    });

    it('should throw ConflictException when HCI code already exists', async () => {
      mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);

      await expect(service.create(createClinicDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createClinicDto)).rejects.toThrow(
        'HCI Code already exists',
      );
    });

    it('should throw ConflictException when registration number already exists', async () => {
      const createDto = { ...createClinicDto };
      delete (createDto as any).hciCode; // Remove HCI code
      
      // Registration number check returns existing clinic
      mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      
      // Reset and test again
      jest.clearAllMocks();
      mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);
      
      await expect(service.create(createDto)).rejects.toThrow(
        'Registration number already exists',
      );
    });

    it('should create clinic without HCI code or registration number', async () => {
      const dtoWithoutHCI = {
        name: 'Simple Clinic',
        address: '123 Test St',
      };
      mockPrismaService.clinic.create.mockResolvedValue(mockClinic);

      await service.create(dtoWithoutHCI);

      expect(prisma.clinic.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateClinicDto = {
      name: 'Updated Clinic Name',
      hciCode: 'HCI0003',
    };

    it('should update a clinic successfully', async () => {
      const clinicWithDoctors = {
        ...mockClinic,
        doctorClinics: [],
        nurseClinics: [],
      };
      mockPrismaService.clinic.findUnique
        .mockResolvedValueOnce(clinicWithDoctors) // findOne check
        .mockResolvedValueOnce(null); // HCI code uniqueness check
      mockPrismaService.clinic.update.mockResolvedValue({
        ...mockClinic,
        ...updateClinicDto,
        doctorClinics: [],
        nurseClinics: [],
      });

      const result = await service.update(clinicId, updateClinicDto);

      expect(result.name).toBe(updateClinicDto.name);
      expect(prisma.clinic.update).toHaveBeenCalledWith({
        where: { id: clinicId },
        data: updateClinicDto,
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException when clinic not found', async () => {
      mockPrismaService.clinic.findUnique.mockResolvedValue(null);

      await expect(service.update(clinicId, updateClinicDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when updating to existing HCI code', async () => {
      const existingClinic = { ...mockClinic, id: 'different-id' };
      const clinicWithDoctors = {
        ...mockClinic,
        doctorClinics: [],
        nurseClinics: [],
      };
      mockPrismaService.clinic.findUnique
        .mockResolvedValueOnce(clinicWithDoctors) // findOne check
        .mockResolvedValueOnce(existingClinic); // HCI code uniqueness check

      await expect(service.update(clinicId, updateClinicDto)).rejects.toThrow(
        ConflictException,
      );
      
      // Reset mocks for second assertion
      jest.clearAllMocks();
      mockPrismaService.clinic.findUnique
        .mockResolvedValueOnce(clinicWithDoctors)
        .mockResolvedValueOnce(existingClinic);
        
      await expect(service.update(clinicId, updateClinicDto)).rejects.toThrow(
        'HCI Code already exists',
      );
    });

    it('should allow updating to same HCI code', async () => {
      const clinicWithDoctors = {
        ...mockClinic,
        doctorClinics: [],
        nurseClinics: [],
      };
      mockPrismaService.clinic.findUnique
        .mockResolvedValueOnce(clinicWithDoctors)
        .mockResolvedValueOnce(mockClinic); // Same clinic
      mockPrismaService.clinic.update.mockResolvedValue({
        ...mockClinic,
        doctorClinics: [],
        nurseClinics: [],
      });

      await service.update(clinicId, { hciCode: mockClinic.hciCode });

      expect(prisma.clinic.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a clinic successfully', async () => {
      const clinicWithDoctors = {
        ...mockClinic,
        doctorClinics: [],
        nurseClinics: [],
      };
      mockPrismaService.clinic.findUnique.mockResolvedValue(clinicWithDoctors);
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.clinic.delete.mockResolvedValue(mockClinic);

      const result = await service.remove(clinicId);

      expect(result).toEqual({ message: 'Clinic deleted successfully' });
      expect(prisma.clinic.delete).toHaveBeenCalledWith({
        where: { id: clinicId },
      });
    });

    it('should throw NotFoundException when clinic not found', async () => {
      mockPrismaService.clinic.findUnique.mockResolvedValue(null);

      await expect(service.remove(clinicId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when clinic has users', async () => {
      const clinicWithDoctors = {
        ...mockClinic,
        doctorClinics: [],
        nurseClinics: [],
      };
      mockPrismaService.clinic.findUnique.mockResolvedValue(clinicWithDoctors);
      mockPrismaService.user.count.mockResolvedValue(5);

      await expect(service.remove(clinicId)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove(clinicId)).rejects.toThrow(
        'Cannot delete clinic with existing users',
      );
    });
  });

  describe('getDoctors', () => {
    it('should return doctors for a clinic', async () => {
      mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);
      mockPrismaService.doctorClinic.findMany.mockResolvedValue([
        {
          isPrimary: true,
          doctor: mockDoctor,
        },
        {
          isPrimary: false,
          doctor: {
            ...mockDoctor,
            id: 'another-doctor-id',
            name: 'Dr. James Lee',
            mcrNumber: 'M23456B',
          },
        },
      ]);

      const result = await service.getDoctors(clinicId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ ...mockDoctor, isPrimary: true });
      expect(result[1].isPrimary).toBe(false);
      expect(prisma.doctorClinic.findMany).toHaveBeenCalledWith({
        where: { clinicId },
        select: expect.any(Object),
        orderBy: { doctor: { name: 'asc' } },
      });
    });

    it('should throw NotFoundException when clinic not found', async () => {
      mockPrismaService.clinic.findUnique.mockResolvedValue(null);

      await expect(service.getDoctors(clinicId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array when clinic has no doctors', async () => {
      mockPrismaService.clinic.findUnique.mockResolvedValue(mockClinic);
      mockPrismaService.doctorClinic.findMany.mockResolvedValue([]);

      const result = await service.getDoctors(clinicId);

      expect(result).toEqual([]);
    });
  });
});
