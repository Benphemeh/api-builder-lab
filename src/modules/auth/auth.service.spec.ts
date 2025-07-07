import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/core/mail/mail.service';
import { REPOSITORY } from 'src/core/constants';
import { USER_ROLE } from 'src/core/enums';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Op } from 'sequelize';

describe('AuthService', () => {
  let service: AuthService;
  let userRepositoryMock: any;
  let usersServiceMock: any;
  let jwtServiceMock: any;
  let mailServiceMock: any;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    role: USER_ROLE.AUTHOR,
    isEmailVerified: false,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    save: jest.fn(),
    dataValues: {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: USER_ROLE.AUTHOR,
    },
  };

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    userRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    usersServiceMock = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn(),
    };

    mailServiceMock = {
      sendUserConfirmation: jest.fn(),
      sendUserOnBoard: jest.fn(),
      sendEmailVerification: jest.fn(),
      sendEmailVerified: jest.fn(),
      sendPasswordReset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: REPOSITORY.USER, useValue: userRepositoryMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: MailService, useValue: mailServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Mock environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      usersServiceMock.findOneByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password');

      expect(usersServiceMock.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result).toEqual(mockUser.dataValues);
    });

    it('should return null when user not found', async () => {
      usersServiceMock.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      usersServiceMock.findOneByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return user and token on successful login', async () => {
      const token = 'jwt-token';
      jwtServiceMock.sign.mockReturnValue(token);

      const result = await service.login(mockUser.dataValues);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.dataValues.id,
          email: mockUser.dataValues.email,
          role: mockUser.dataValues.role,
        },
        { secret: 'test-secret' },
      );
      expect(result).toEqual({ user: mockUser.dataValues, token });
    });

    it('should throw UnauthorizedException when token generation fails', async () => {
      jwtServiceMock.sign.mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      await expect(service.login(mockUser.dataValues)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('create', () => {
    it('should create user and return user with token', async () => {
      const userDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
      };
      const hashedPassword = 'hashedPassword';
      const createdUser = {
        dataValues: { ...mockUser.dataValues, password: hashedPassword },
      };
      const token = 'jwt-token';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      usersServiceMock.create.mockResolvedValue(createdUser);
      jwtServiceMock.sign.mockReturnValue(token);

      const result = await service.create(userDto);

      expect(usersServiceMock.create).toHaveBeenCalledWith({
        ...userDto,
        password: hashedPassword,
      });
      expect(mailServiceMock.sendUserConfirmation).toHaveBeenCalled();
      expect(mailServiceMock.sendUserOnBoard).toHaveBeenCalled();
      expect(result).toEqual({ user: createdUser.dataValues, token });
    });
  });

  describe('requestEmailVerification', () => {
    it('should send verification email when user exists and email not verified', async () => {
      const email = 'test@example.com';
      const token = 'verification-token';
      const user = { ...mockUser, isEmailVerified: false };

      userRepositoryMock.findOne.mockResolvedValue(user);
      jest.spyOn(crypto, 'randomBytes').mockImplementation(
        () =>
          ({
            toString: () => token,
          }) as unknown as Buffer,
      );

      const result = await service.requestEmailVerification(email);

      expect(user.emailVerificationToken).toBe(token);
      expect(user.save).toHaveBeenCalled();
      expect(mailServiceMock.sendEmailVerification).toHaveBeenCalledWith(
        user.email,
        user.firstName,
        `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
        token,
      );
      expect(result).toEqual({ message: 'Verification email sent' });
    });

    it('should return message when email already verified', async () => {
      const user = { ...mockUser, isEmailVerified: true };
      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.requestEmailVerification('test@example.com');

      expect(result).toEqual({ message: 'Email already verified' });
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.requestEmailVerification('test@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email when token is valid', async () => {
      const token = 'verification-token';
      const user = { ...mockUser, emailVerificationToken: token };

      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.verifyEmail(token);

      expect(user.isEmailVerified).toBe(true);
      expect(user.emailVerificationToken).toBeNull();
      expect(user.save).toHaveBeenCalled();
      expect(mailServiceMock.sendEmailVerified).toHaveBeenCalledWith(
        user.email,
        user.firstName,
      );
      expect(result).toEqual({ message: 'Email verified ' });
    });

    it('should throw BadRequestException when token is invalid', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email when user exists', async () => {
      const email = 'test@example.com';
      const token = 'reset-token';
      const user = { ...mockUser };

      userRepositoryMock.findOne.mockResolvedValue(user);
      jest.spyOn(crypto, 'randomBytes').mockImplementation(
        () =>
          ({
            toString: () => token,
          }) as unknown as Buffer,
      );

      const result = await service.forgotPassword(email);

      expect(user.resetPasswordToken).toBe(token);
      expect(user.resetPasswordExpires).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalled();
      expect(mailServiceMock.sendPasswordReset).toHaveBeenCalledWith(
        user.email,
        user.firstName,
        `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
        token,
      );
      expect(result).toEqual({ message: 'Password reset email sent' });
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.forgotPassword('test@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password when token is valid and not expired', async () => {
      const token = 'reset-token';
      const newPassword = 'newPassword';
      const hashedPassword = 'hashedNewPassword';
      const user = {
        ...mockUser,
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
      };

      userRepositoryMock.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const result = await service.resetPassword(token, newPassword);

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: expect.any(Date) },
        },
      });
      expect(user.password).toBe(hashedPassword);
      expect(user.resetPasswordToken).toBeNull();
      expect(user.resetPasswordExpires).toBeNull();
      expect(user.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Password has been reset successfully',
      });
    });

    it('should throw BadRequestException when token is invalid or expired', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid-token', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('onModuleInit', () => {
    it('should create super admin when not exists', async () => {
      process.env.SUPER_ADMIN_EMAIL = 'admin@example.com';
      process.env.SUPER_ADMIN_FIRST_NAME = 'Super';
      process.env.SUPER_ADMIN_LAST_NAME = 'Admin';
      process.env.SUPER_ADMIN_PASSWORD = 'adminPassword';

      userRepositoryMock.findOne.mockResolvedValue(null);
      userRepositoryMock.create.mockResolvedValue({});
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedAdminPassword' as never);

      await service.onModuleInit();

      expect(userRepositoryMock.create).toHaveBeenCalledWith({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@example.com',
        password: 'hashedAdminPassword',
        role: USER_ROLE.SUPER_ADMIN,
        isDefaultPassword: false,
        gender: 'male',
      });
    });

    it('should not create super admin when already exists', async () => {
      userRepositoryMock.findOne.mockResolvedValue(mockUser);

      await service.onModuleInit();

      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });
  });
});
