import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/core/mail/mail.service';
import { REPOSITORY } from 'src/core/constants';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepositoryMock: any;
  let usersServiceMock: any;
  let jwtServiceMock: any;
  let mailServiceMock: any;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    // Mock the user repository
    userRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    // Mock the UsersService
    usersServiceMock = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };

    // Mock the JwtService
    jwtServiceMock = {
      sign: jest.fn(),
    };

    // Mock the MailService
    mailServiceMock = {
      sendEmailVerification: jest.fn(),
      sendPasswordReset: jest.fn(),
      sendUserConfirmation: jest.fn(),
      sendUserOnBoard: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { dataValues: { email, password: 'hashedPassword' } };

      usersServiceMock.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(usersServiceMock.findOneByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(user.dataValues);
    });

    it('should return null if user is not found', async () => {
      usersServiceMock.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { dataValues: { email, password: 'hashedPassword' } };

      usersServiceMock.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return user and token on successful login', async () => {
      const user = { id: '1', email: 'test@example.com', role: 'user' };
      const token = 'jwt-token';

      jest.spyOn(service as any, 'generateToken').mockResolvedValue(token);

      const result = await service.login(user);

      expect(result).toEqual({ user, token });
    });

    it('should throw UnauthorizedException if token generation fails', async () => {
      const user = { id: '1', email: 'test@example.com', role: 'user' };

      jest
        .spyOn(service as any, 'generateToken')
        .mockRejectedValue(new Error('Token generation failed'));

      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('create', () => {
    it('should create a new user and return user and token', async () => {
      const userDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword';
      const createdUser = {
        dataValues: { id: '1', ...userDto, password: hashedPassword },
      };
      const token = 'jwt-token';

      jest
        .spyOn(service as any, 'hashPassword')
        .mockResolvedValue(hashedPassword);
      usersServiceMock.create.mockResolvedValue(createdUser);
      jest.spyOn(service as any, 'generateToken').mockResolvedValue(token);
      mailServiceMock.sendUserConfirmation.mockResolvedValue(undefined);
      mailServiceMock.sendUserOnBoard.mockResolvedValue(undefined);

      const result = await service.create(userDto);

      expect(usersServiceMock.create).toHaveBeenCalledWith({
        ...userDto,
        password: hashedPassword,
      });
      expect(result).toEqual({ user: createdUser.dataValues, token });
    });
  });

  describe('requestEmailVerification', () => {
    it('should send an email verification link', async () => {
      const email = 'test@example.com';
      const user = {
        email,
        isEmailVerified: false,
        emailVerificationToken: undefined,
        save: jest.fn(),
      };
      const token = 'verification-token';

      userRepositoryMock.findOne.mockResolvedValue(user);
      jest.spyOn(crypto, 'randomBytes').mockImplementation(() => token);

      const result = await service.requestEmailVerification(email);

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(user.emailVerificationToken).toBe(token);
      expect(mailServiceMock.sendEmailVerification).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Verification email sent' });
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.requestEmailVerification('test@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return a message if email is already verified', async () => {
      const user = { email: 'test@example.com', isEmailVerified: true };

      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.requestEmailVerification('test@example.com');

      expect(result).toEqual({ message: 'Email already verified' });
    });
  });
  describe('verifyEmail', () => {
    it('should verify the email if token is valid', async () => {
      const token = 'verification-token';
      const user = {
        emailVerificationToken: token,
        isEmailVerified: false,
        save: jest.fn(),
      };

      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.verifyEmail(token);

      expect(user.emailVerificationToken).toBeNull();
      expect(user.isEmailVerified).toBe(true);
      expect(result).toEqual({ message: 'Email verified successfully' });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
