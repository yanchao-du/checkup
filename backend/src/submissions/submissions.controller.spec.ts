import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/submission.dto';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let service: SubmissionsService;

  const mockUser = {
    id: 'user-1',
    email: 'nurse@clinic.sg',
    role: 'nurse',
    clinicId: 'clinic-1',
  };

  const mockSubmission = {
    id: 'sub-1',
    examType: 'MDW_SIX_MONTHLY',
    patientName: 'John Doe',
    patientNric: 'S1234567A',
    status: 'pending_approval',
    createdBy: 'Nurse Test',
    createdDate: new Date(),
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    getDrafts: jest.fn(),
    getHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        {
          provide: SubmissionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
    service = module.get<SubmissionsService>(SubmissionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSubmissionDto = {
      examType: 'MDW_SIX_MONTHLY',
      patientName: 'John Doe',
      patientNric: 'S1234567A',
      patientDateOfBirth: '1990-01-01',
      formData: {},
    };

    it('should create a new submission', async () => {
      mockService.create.mockResolvedValue(mockSubmission);

      const result = await controller.create(mockUser, createDto);

      expect(service.create).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.role,
        mockUser.clinicId,
        createDto,
      );
      expect(result).toEqual(mockSubmission);
    });

    it('should handle nurse creating submission', async () => {
      mockService.create.mockResolvedValue(mockSubmission);

      await controller.create(mockUser, createDto);

      expect(service.create).toHaveBeenCalledWith(
        mockUser.id,
        'nurse',
        mockUser.clinicId,
        createDto,
      );
    });

    it('should handle doctor creating submission', async () => {
      const doctorUser = { ...mockUser, role: 'doctor' };
      const doctorSubmission = { ...mockSubmission, status: 'submitted' };
      mockService.create.mockResolvedValue(doctorSubmission);

      await controller.create(doctorUser, createDto);

      expect(service.create).toHaveBeenCalledWith(
        doctorUser.id,
        'doctor',
        doctorUser.clinicId,
        createDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all submissions with pagination', async () => {
      const paginatedResult = {
        data: [mockSubmission],
        total: 1,
        page: 1,
        totalPages: 1,
      };
      mockService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(mockUser, {});

      expect(service.findAll).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.role,
        mockUser.clinicId,
        {},
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should handle filtering by status', async () => {
      mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 0 });

      await controller.findAll(mockUser, { status: 'pending_approval' });

      expect(service.findAll).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.role,
        mockUser.clinicId,
        { status: 'pending_approval' },
      );
    });
  });

  describe('findOne', () => {
    it('should return a single submission', async () => {
      mockService.findOne.mockResolvedValue(mockSubmission);

      const result = await controller.findOne('sub-1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith(
        'sub-1',
        mockUser.id,
        mockUser.role,
        mockUser.clinicId,
      );
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('update', () => {
    const updateDto = {
      formData: { height: 175 },
    };

    it('should update a submission', async () => {
      const updatedSubmission = { ...mockSubmission, formData: { height: 175 } };
      mockService.update.mockResolvedValue(updatedSubmission);

      const result = await controller.update('sub-1', mockUser, updateDto);

      expect(service.update).toHaveBeenCalledWith(
        'sub-1',
        mockUser.id,
        mockUser.role,
        updateDto,
      );
      expect(result).toEqual(updatedSubmission);
    });
  });
});
