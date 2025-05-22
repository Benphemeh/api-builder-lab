import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateUserDTO } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersServiceMock: any;

  beforeEach(async () => {
    // Mock the UsersService
    usersServiceMock = {
      getUserById: jest.fn(),
      getAllUsers: jest.fn(),
      updateUserProfile: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const userId = '1';
      const user = { id: userId, email: 'test@example.com' };

      usersServiceMock.getUserById.mockResolvedValue(user);

      const result = await controller.getUser(userId);

      expect(usersServiceMock.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });

    it('should throw BadRequestException if ID is not provided', async () => {
      await expect(controller.getUser('')).rejects.toThrow(
        new BadRequestException('User ID is required'),
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'nonexistent-id';

      usersServiceMock.getUserById.mockRejectedValue(
        new NotFoundException(`User with id ${userId} not found`),
      );

      await expect(controller.getUser(userId)).rejects.toThrow(
        new NotFoundException(`User with id ${userId} not found`),
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: '1', email: 'test1@example.com' },
        { id: '2', email: 'test2@example.com' },
      ];

      usersServiceMock.getAllUsers.mockResolvedValue(users);

      const result = await controller.getAllUsers();

      expect(usersServiceMock.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('updateUser', () => {
    it('should update a user profile', async () => {
      const userId = '1';
      const updateData: UpdateUserDTO = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLastName',
      };
      const updatedUser = { id: userId, ...updateData };

      usersServiceMock.updateUserProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateUser(userId, updateData);

      expect(usersServiceMock.updateUserProfile).toHaveBeenCalledWith(
        userId,
        updateData,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'nonexistent-id';
      const updateData: UpdateUserDTO = {
        firstName: 'UpdatedName',
        lastName: undefined,
      };

      usersServiceMock.updateUserProfile.mockRejectedValue(
        new NotFoundException(`User with id ${userId} not found`),
      );

      await expect(controller.updateUser(userId, updateData)).rejects.toThrow(
        new NotFoundException(`User with id ${userId} not found`),
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      const userId = '1';

      usersServiceMock.deleteUser.mockResolvedValue(undefined);

      const result = await controller.deleteUser(userId);

      expect(usersServiceMock.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'nonexistent-id';

      usersServiceMock.deleteUser.mockRejectedValue(
        new NotFoundException(`User with id ${userId} not found`),
      );

      await expect(controller.deleteUser(userId)).rejects.toThrow(
        new NotFoundException(`User with id ${userId} not found`),
      );
    });
  });
});
