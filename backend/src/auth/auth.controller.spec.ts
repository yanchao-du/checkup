import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './services/session.service';
import { UserSessionService } from './services/user-session.service';
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
    // Provide minimal mocks for injected services used by the controller
    const configMock = { get: jest.fn().mockReturnValue('') };
    const sessionServiceMock = {
      createOAuthSession: jest.fn().mockReturnValue({ sessionId: 'sess', state: 'st', nonce: 'n' }),
      verifyOAuthSession: jest.fn().mockReturnValue('n'),
      deleteOAuthSession: jest.fn(),
    };
    const userSessionServiceMock = {
      deleteSession: jest.fn(),
      createSession: jest.fn().mockReturnValue('user-sess'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: configMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: UserSessionService, useValue: userSessionServiceMock },
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
      // pass an empty user object so controller doesn't try to access sessionId
      const result = await controller.logout({} as any);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should return success message', async () => {
      const result = await controller.logout({} as any);

      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('getMe', () => {
    it('should return current user information', async () => {
      // provide a minimal response object with setHeader used by controller
      const res: any = { setHeader: jest.fn() };
      const result = await controller.getMe(mockUser as any, res);

      expect(result).toEqual(mockUser);
      expect(result.id).toBe('1');
      expect(result.email).toBe('doctor@clinic.sg');
      expect(result.role).toBe('doctor');
    });

    it('should return user with clinic information', async () => {
      const res: any = { setHeader: jest.fn() };
      const result = await controller.getMe(mockUser as any, res);

      expect(result.clinicName).toBe('Test Clinic');
      expect(result.clinicId).toBe('1');
    });

    it('should handle different user roles', async () => {
      const nurseUser = { ...mockUser, role: 'nurse', email: 'nurse@clinic.sg' };
      const res: any = { setHeader: jest.fn() };
      const result = await controller.getMe(nurseUser as any, res);

      expect(result.role).toBe('nurse');
      expect(result.email).toBe('nurse@clinic.sg');
    });
  });
});
