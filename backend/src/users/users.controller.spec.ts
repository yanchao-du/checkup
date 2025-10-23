import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Test User',
    email: 'test@clinic.sg',
    role: 'doctor',
    status: 'active',
    lastLoginAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
  };

  const mockCurrentUser = {
    id: '550e8400-e29b-41d4-a716-446655440003',
    clinicId: '550e8400-e29b-41d4-a716-446655440000',
    email: 'admin@clinic.sg',
    role: 'admin',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginatedResult = {
        data: [mockUser],
        meta: {
          total: 1,
          page: 1,
          limit: 100,
          totalPages: 1,
        },
      };
      mockUsersService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(mockCurrentUser);

      expect(result).toEqual(paginatedResult);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        mockCurrentUser.clinicId,
        1,
        100,
      );
    });

    it('should handle custom pagination parameters', async () => {
      const paginatedResult = {
        data: [],
        meta: { total: 0, page: 2, limit: 20, totalPages: 0 },
      };
      mockUsersService.findAll.mockResolvedValue(paginatedResult);

      await controller.findAll(mockCurrentUser, '2', '20');

      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        mockCurrentUser.clinicId,
        2,
        20,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id, mockCurrentUser);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(
        mockUser.id,
        mockCurrentUser.clinicId,
      );
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'newuser@clinic.sg',
        password: 'password123',
        role: 'nurse',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto, mockCurrentUser);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        mockCurrentUser.clinicId,
        createUserDto,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        role: 'admin',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(
        mockUser.id,
        updateUserDto,
        mockCurrentUser,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        mockCurrentUser.clinicId,
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const deleteResult = { message: 'User deleted successfully' };
      mockUsersService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(mockUser.id, mockCurrentUser);

      expect(result).toEqual(deleteResult);
      expect(mockUsersService.remove).toHaveBeenCalledWith(
        mockUser.id,
        mockCurrentUser.clinicId,
      );
    });
  });
});
