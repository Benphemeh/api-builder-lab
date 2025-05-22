import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { REPOSITORY } from '../../core/constants';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepositoryMock: any;
  let authServiceMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    // Mock the user repository
    userRepositoryMock = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };

    // Mock the AuthService
    authServiceMock = {
      someAuthMethod: jest.fn(),
    };

    // Mock the JwtService
    jwtServiceMock = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: REPOSITORY.USER, useValue: userRepositoryMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userDto = {
        email: 'test@example.com',
        password: 'password123',
        gender: 'male',
      };
      const createdUser = { id: '1', ...userDto };

      userRepositoryMock.create.mockResolvedValue(createdUser);

      const result = await service.create(userDto);

      expect(userRepositoryMock.create).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const user = { id: '1', email, password: 'hashedPassword' };

      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.findOneByEmail(email);

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'password',
          'role',
        ],
      });
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      const email = 'nonexistent@example.com';

      userRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.findOneByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should return a user by ID', async () => {
      const id = '1';
      const user = { id, email: 'test@example.com' };

      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.findOneById(id);

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const id = 'nonexistent-id';

      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findOneById(id)).rejects.toThrow(
        new NotFoundException(`User with id ${id} not found`),
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: '1', email: 'test1@example.com' },
        { id: '2', email: 'test2@example.com' },
      ];

      userRepositoryMock.findAll.mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(userRepositoryMock.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(users);
    });
  });

  describe('updateUserProfile', () => {
    it('should update a user profile', async () => {
      const id = '1';
      const updateData = { firstName: 'UpdatedName' };
      const user = { id, firstName: 'OldName', update: jest.fn() };

      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.updateUserProfile(id, updateData);

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(user.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const id = 'nonexistent-id';
      const updateData = { firstName: 'UpdatedName' };

      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.updateUserProfile(id, updateData)).rejects.toThrow(
        new NotFoundException(`User with id ${id} not found`),
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      const id = '1';
      const user = { id, destroy: jest.fn() };

      userRepositoryMock.findOne.mockResolvedValue(user);

      await service.deleteUser(id);

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(user.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      const id = 'nonexistent-id';

      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.deleteUser(id)).rejects.toThrow(
        new NotFoundException(`User with id ${id} not found`),
      );
    });
  });
});
