import { Test, TestingModule } from '@nestjs/testing';
import { ClinicsController } from '../clinics.controller';
import { ClinicsService } from '../clinics.service';

describe('ClinicsController', () => {
  let controller: ClinicsController;
  let service: ClinicsService;

  const mockClinicsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getDoctors: jest.fn(),
  };

  const clinicId = '550e8400-e29b-41d4-a716-446655440000';

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
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Dr. Sarah Tan',
    email: 'sarah.tan@clinic.sg',
    mcrNumber: 'M12345A',
    status: 'active',
    isPrimary: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicsController],
      providers: [
        {
          provide: ClinicsService,
          useValue: mockClinicsService,
        },
      ],
    }).compile();

    controller = module.get<ClinicsController>(ClinicsController);
    service = module.get<ClinicsService>(ClinicsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated clinics with default parameters', async () => {
      const result = {
        data: [mockClinic],
        meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
      };
      mockClinicsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(1, 100);
    });

    it('should return paginated clinics with custom parameters', async () => {
      const result = {
        data: [mockClinic],
        meta: { total: 1, page: 2, limit: 10, totalPages: 1 },
      };
      mockClinicsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('2', '10')).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(2, 10);
    });
  });

  describe('findOne', () => {
    it('should return a clinic by id', async () => {
      const clinicWithDoctors = {
        ...mockClinic,
        doctors: [mockDoctor],
      };
      mockClinicsService.findOne.mockResolvedValue(clinicWithDoctors);

      expect(await controller.findOne(clinicId)).toBe(clinicWithDoctors);
      expect(service.findOne).toHaveBeenCalledWith(clinicId);
    });
  });

  describe('getDoctors', () => {
    it('should return doctors for a clinic', async () => {
      const doctors = [mockDoctor];
      mockClinicsService.getDoctors.mockResolvedValue(doctors);

      expect(await controller.getDoctors(clinicId)).toBe(doctors);
      expect(service.getDoctors).toHaveBeenCalledWith(clinicId);
    });
  });

  describe('create', () => {
    it('should create a new clinic', async () => {
      const createDto = {
        name: 'New Clinic',
        hciCode: 'HCI0002',
        registrationNumber: 'REG-002',
        address: '456 Health Avenue',
        phone: '+65 6234 5678',
        email: 'info@newclinic.sg',
      };
      mockClinicsService.create.mockResolvedValue(mockClinic);

      expect(await controller.create(createDto)).toBe(mockClinic);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a clinic', async () => {
      const updateDto = {
        name: 'Updated Clinic',
        hciCode: 'HCI0003',
      };
      const updatedClinic = { ...mockClinic, ...updateDto };
      mockClinicsService.update.mockResolvedValue(updatedClinic);

      expect(await controller.update(clinicId, updateDto)).toBe(updatedClinic);
      expect(service.update).toHaveBeenCalledWith(clinicId, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a clinic', async () => {
      const result = { message: 'Clinic deleted successfully' };
      mockClinicsService.remove.mockResolvedValue(result);

      expect(await controller.remove(clinicId)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(clinicId);
    });
  });
});
