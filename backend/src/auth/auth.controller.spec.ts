import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockUser = {
    id: '1',
    name: 'Test Doctor',
    email: 'doctor@clinic.sg',
    role: 'doctor',
    clinicId: '1',
    clinicName: 'Test Clinic',
  };

  const mockLoginResponse = {
    token: 'mock-jwt-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'doctor@clinic.sg',
      password: 'password',
    };

    it('should successfully login with valid credentials', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockLoginResponse);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('doctor@clinic.sg');
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Account is inactive'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Account is inactive',
      );
    });

    it('should handle different user roles (nurse)', async () => {
      const nurseResponse = {
        token: 'nurse-token',
        user: { ...mockUser, role: 'nurse', email: 'nurse@clinic.sg' },
      };
      mockAuthService.login.mockResolvedValue(nurseResponse);

      const result = await controller.login({
        email: 'nurse@clinic.sg',
        password: 'password',
      });

      expect(result.user.role).toBe('nurse');
    });

    it('should handle different user roles (admin)', async () => {
      const adminResponse = {
        token: 'admin-token',
        user: { ...mockUser, role: 'admin', email: 'admin@clinic.sg' },
      };
      mockAuthService.login.mockResolvedValue(adminResponse);

      const result = await controller.login({
        email: 'admin@clinic.sg',
        password: 'password',
      });

      expect(result.user.role).toBe('admin');
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const result = await controller.logout();

      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should return success message', async () => {
      const result = await controller.logout();

      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('getMe', () => {
    it('should return current user information', async () => {
      const result = await controller.getMe(mockUser);

      expect(result).toEqual(mockUser);
      expect(result.id).toBe('1');
      expect(result.email).toBe('doctor@clinic.sg');
      expect(result.role).toBe('doctor');
    });

    it('should return user with clinic information', async () => {
      const result = await controller.getMe(mockUser);

      expect(result.clinicName).toBe('Test Clinic');
      expect(result.clinicId).toBe('1');
    });

    it('should handle different user roles', async () => {
      const nurseUser = { ...mockUser, role: 'nurse', email: 'nurse@clinic.sg' };
      const result = await controller.getMe(nurseUser);

      expect(result.role).toBe('nurse');
      expect(result.email).toBe('nurse@clinic.sg');
    });
  });
});
