import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDTO } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GENDER } from '../../core/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService: jest.Mocked<AuthService> = {
      create: jest.fn(),
      validateUser: jest.fn(),
      login: jest.fn(),
      requestEmailVerification: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    } as any;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should return created user and token', async () => {
      const dto: CreateUserDTO = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'securePass123',
        gender: GENDER.FEMALE,
      };

      const expected = { user: { ...dto, id: 'abc123' }, token: 'jwt.token' };
      authService.create.mockResolvedValue(expected);

      const result = await controller.signUp(dto);
      expect(authService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should return token on valid credentials', async () => {
      const dto: LoginDto = {
        email: 'john@example.com',
        password: 'password',
      };

      const user = { id: 'user123', email: dto.email };
      const token = { user, token: 'jwt.token' };

      authService.validateUser.mockResolvedValue(user);
      authService.login.mockResolvedValue(token);

      const result = await controller.login(dto);
      expect(authService.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(token);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const dto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrong',
      };

      authService.validateUser.mockResolvedValue(null);

      await expect(controller.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
    });
  });

  describe('requestEmailVerification', () => {
    it('should call requestEmailVerification with email and return response', async () => {
      const dto: RequestEmailVerificationDto = { email: 'test@example.com' };
      const expected = { message: 'Verification sent' };

      authService.requestEmailVerification.mockResolvedValue(expected);
      const result = await controller.requestEmailVerification(dto);

      expect(authService.requestEmailVerification).toHaveBeenCalledWith(
        dto.email,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('verifyEmail', () => {
    it('should call verifyEmail with token and return response', async () => {
      const dto: VerifyEmailDto = { token: 'verification-token' };
      const expected = { message: 'Email verified' };

      authService.verifyEmail.mockResolvedValue(expected);
      const result = await controller.verifyEmail(dto);

      expect(authService.verifyEmail).toHaveBeenCalledWith(dto.token);
      expect(result).toEqual(expected);
    });
  });

  describe('forgotPassword', () => {
    it('should call forgotPassword with email and return response', async () => {
      const dto: ForgotPasswordDto = { email: 'reset@example.com' };
      const expected = { message: 'Reset link sent' };

      authService.forgotPassword.mockResolvedValue(expected);
      const result = await controller.forgotPassword(dto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(dto.email);
      expect(result).toEqual(expected);
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword with token and new password', async () => {
      const dto: ResetPasswordDto = {
        token: 'reset-token',
        newPassword: 'newSecurePass',
      };
      const expected = { message: 'Password reset successful' };

      authService.resetPassword.mockResolvedValue(expected);
      const result = await controller.resetPassword(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        dto.token,
        dto.newPassword,
      );
      expect(result).toEqual(expected);
    });
  });
});
