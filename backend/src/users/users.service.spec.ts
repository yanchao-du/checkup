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
        where: { clinicId },
        select: expect.any(Object),
        orderBy: { email: 'asc' },
        skip: 0,
        take: 20,
      });
      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: { clinicId },
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
        where: { id: userId, clinicId },
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
          status: 'active',
        },
        select: expect.any(Object),
      });
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
});
