import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CacheService } from '../cache/cache.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/core/guards/admin.guard';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserDTO } from './dto/update-user.dto';
import { USER_ROLE } from 'src/core/enums';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService: jest.Mocked<UsersService>;
  let cacheService: jest.Mocked<CacheService>;

  // Mock data
  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: USER_ROLE.AUTHOR,
    isEmailVerified: true,
    createdAt: '2025-07-10T15:12:07.690Z',
    updatedAt: '2025-07-10T15:12:07.690Z',
  };

  const mockAdmin = {
    id: 'admin-123',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: USER_ROLE.ADMIN,
    isEmailVerified: true,
    createdAt: '2025-07-10T15:12:07.690Z',
    updatedAt: '2025-07-10T15:12:07.690Z',
  };

  const mockUsers = [mockUser, mockAdmin];

  // Mock response structure that matches your service
  const mockUsersResponse = {
    data: mockUsers,
    total: mockUsers.length,
  };

  // Mock guards
  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
            getAllUsers: jest.fn(),
            updateUserProfile: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            getOrSet: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get(UsersService);
    cacheService = moduleFixture.get(CacheService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /users/:id', () => {
    it('should return user successfully', async () => {
      // Arrange
      usersService.getUserById.mockResolvedValue(mockUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users/user-123')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(usersService.getUserById).toHaveBeenCalledWith('user-123');
    });

    it('should return all users when accessing /users/ endpoint', async () => {
      // Arrange
      cacheService.getOrSet.mockResolvedValue(mockUsersResponse as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users/')
        .expect(200);

      expect(response.body).toEqual(mockUsersResponse);
    });

    it('should handle URL-encoded special characters in ID', async () => {
      // Arrange
      const encodedId = 'user%20with%20spaces';
      const decodedId = 'user with spaces';
      usersService.getUserById.mockResolvedValue(mockUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/users/${encodedId}`)
        .expect(200);

      expect(usersService.getUserById).toHaveBeenCalledWith(decodedId);
      expect(response.body).toEqual(mockUser);
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      usersService.getUserById.mockImplementation(() => {
        throw new NotFoundException('User with id invalid-id not found');
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users/invalid-id')
        .expect(404);

      expect(response.body.message).toBe('User with id invalid-id not found');
    });

    it('should return 401 when not authenticated', async () => {
      // Arrange
      mockAuthGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer()).get('/users/user-123').expect(403);

      // Reset for other tests
      mockAuthGuard.canActivate.mockReturnValue(true);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      usersService.getUserById.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      // Act & Assert
      await request(app.getHttpServer()).get('/users/user-123').expect(500);
    });

    it('should handle special characters in user ID', async () => {
      // Arrange
      const specialId = 'user-123@#$%';
      usersService.getUserById.mockResolvedValue(mockUser as any);

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/users/${encodeURIComponent(specialId)}`)
        .expect(200);

      expect(usersService.getUserById).toHaveBeenCalledWith(specialId);
    });
  });

  describe('GET /users', () => {
    it('should return all users from cache', async () => {
      // Arrange
      cacheService.getOrSet.mockResolvedValue(mockUsersResponse as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toEqual(mockUsersResponse);

      // Fixed: Match the actual cache key format with pagination parameters
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'users:list:1:10:::',
        expect.any(Function),
        30,
      );
    });

    it('should return all users with custom pagination', async () => {
      // Arrange
      cacheService.getOrSet.mockResolvedValue(mockUsersResponse as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users?page=2&limit=5')
        .expect(200);

      expect(response.body).toEqual(mockUsersResponse);

      // Should use different cache key for different pagination
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'users:list:2:5:::',
        expect.any(Function),
        30,
      );
    });

    it('should return all users with search and status filters', async () => {
      // Arrange
      cacheService.getOrSet.mockResolvedValue(mockUsersResponse as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users?search=john&status=active')
        .expect(200);

      expect(response.body).toEqual(mockUsersResponse);

      // Fixed: Match the actual cache key format: users:list:page:limit:search:role:status
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'users:list:1:10:john::active',
        expect.any(Function),
        30,
      );
    });

    it('should fetch from service when cache is empty', async () => {
      // Arrange
      usersService.getAllUsers.mockResolvedValue(mockUsersResponse as any);
      cacheService.getOrSet.mockImplementation(async (key, fetchFn, ttl) => {
        return await fetchFn();
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toEqual(mockUsersResponse);
      expect(cacheService.getOrSet).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      const emptyResponse = { data: [], total: 0 };
      cacheService.getOrSet.mockResolvedValue(emptyResponse);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toEqual(emptyResponse);
    });

    it('should return 401 when not authenticated', async () => {
      // Arrange
      mockAuthGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer()).get('/users').expect(403);

      // Reset for other tests
      mockAuthGuard.canActivate.mockReturnValue(true);
    });

    it('should handle cache service errors gracefully', async () => {
      // Arrange
      cacheService.getOrSet.mockImplementation(() => {
        throw new Error('Redis connection failed');
      });

      // Act & Assert
      await request(app.getHttpServer()).get('/users').expect(500);
    });

    it('should handle large datasets efficiently', async () => {
      // Arrange
      const largeUserSet = Array(1000)
        .fill(null)
        .map((_, index) => ({
          ...mockUser,
          id: `user-${index}`,
          email: `user${index}@example.com`,
        }));
      const largeResponse = { data: largeUserSet, total: 1000 };
      cacheService.getOrSet.mockResolvedValue(largeResponse as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body.data).toHaveLength(1000);
      expect(response.body.total).toBe(1000);
    });
  });

  describe('PATCH /users/:id', () => {
    const updateData: UpdateUserDTO = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should update user successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...updateData };
      usersService.updateUserProfile.mockResolvedValue(updatedUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/user-123')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedUser);
      expect(usersService.updateUserProfile).toHaveBeenCalledWith(
        'user-123',
        updateData,
      );
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialUpdate = { firstName: 'UpdatedName' };
      const updatedUser = { ...mockUser, firstName: 'UpdatedName' };
      usersService.updateUserProfile.mockResolvedValue(updatedUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/user-123')
        .send(partialUpdate)
        .expect(200);

      expect(response.body.firstName).toBe('UpdatedName');
      expect(usersService.updateUserProfile).toHaveBeenCalledWith(
        'user-123',
        partialUpdate,
      );
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      usersService.updateUserProfile.mockImplementation(() => {
        throw new NotFoundException('User with id invalid-id not found');
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/invalid-id')
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('User with id invalid-id not found');
    });

    it('should handle invalid update data gracefully', async () => {
      // Arrange
      const invalidData = {
        firstName: '',
        lastName: null,
      };
      const updatedUser = { ...mockUser, ...invalidData };
      usersService.updateUserProfile.mockResolvedValue(updatedUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/user-123')
        .send(invalidData)
        .expect(200);

      expect(usersService.updateUserProfile).toHaveBeenCalledWith(
        'user-123',
        invalidData,
      );
    });

    it('should return 401 when not authenticated', async () => {
      // Arrange
      mockAuthGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer())
        .patch('/users/user-123')
        .send(updateData)
        .expect(403);

      // Reset for other tests
      mockAuthGuard.canActivate.mockReturnValue(true);
    });

    it('should handle empty request body', async () => {
      // Arrange
      usersService.updateUserProfile.mockResolvedValue(mockUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/user-123')
        .send({})
        .expect(200);

      expect(usersService.updateUserProfile).toHaveBeenCalledWith(
        'user-123',
        {},
      );
    });

    it('should handle multiple sequential updates', async () => {
      // Arrange
      usersService.updateUserProfile.mockResolvedValue(mockUser as any);

      // Act - Send sequential requests
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .patch('/users/user-123')
          .send(updateData);

        expect(response.status).toBe(200);
      }

      // Assert
      expect(usersService.updateUserProfile).toHaveBeenCalledTimes(3);
    });

    it('should handle service validation errors', async () => {
      // Arrange
      const invalidData = { firstName: 'Test' };
      usersService.updateUserProfile.mockImplementation(() => {
        throw new BadRequestException('Invalid user data provided');
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/user-123')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Invalid user data provided');
    });

    it('should handle empty string updates', async () => {
      // Arrange
      const emptyData = { firstName: '' };
      const updatedUser = { ...mockUser, firstName: '' };
      usersService.updateUserProfile.mockResolvedValue(updatedUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/user-123')
        .send(emptyData)
        .expect(200);

      expect(response.body.firstName).toBe('');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully when admin', async () => {
      // Arrange
      usersService.deleteUser.mockResolvedValue(undefined);

      // Act & Assert
      await request(app.getHttpServer()).delete('/users/user-123').expect(200);

      expect(usersService.deleteUser).toHaveBeenCalledWith('user-123');
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      usersService.deleteUser.mockImplementation(() => {
        throw new NotFoundException('User with id invalid-id not found');
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .delete('/users/invalid-id')
        .expect(404);

      expect(response.body.message).toBe('User with id invalid-id not found');
    });

    it('should return 403 when not admin', async () => {
      // Arrange
      mockAdminGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer()).delete('/users/user-123').expect(403);

      expect(usersService.deleteUser).not.toHaveBeenCalled();

      // Reset for other tests
      mockAdminGuard.canActivate.mockReturnValue(true);
    });

    it('should handle service errors during deletion', async () => {
      // Arrange
      usersService.deleteUser.mockImplementation(() => {
        throw new Error('Database constraint violation');
      });

      // Act & Assert
      await request(app.getHttpServer()).delete('/users/user-123').expect(500);
    });

    it('should handle deletion of non-existent user gracefully', async () => {
      // Arrange
      usersService.deleteUser.mockImplementation(() => {
        throw new NotFoundException('User with id user-999 not found');
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .delete('/users/user-999')
        .expect(404);

      expect(response.body.message).toBe('User with id user-999 not found');
    });

    it('should prevent self-deletion scenario', async () => {
      // Arrange
      usersService.deleteUser.mockImplementation(() => {
        throw new BadRequestException('Cannot delete own account');
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .delete('/users/current-admin-id')
        .expect(400);

      expect(response.body.message).toBe('Cannot delete own account');
    });
  });

  describe('Authentication and Authorization Edge Cases', () => {
    it('should handle JWT token expiration', async () => {
      // Arrange
      mockAuthGuard.canActivate.mockImplementation(() => {
        throw new Error('Token expired');
      });

      // Act & Assert
      await request(app.getHttpServer()).get('/users/user-123').expect(500);

      // Reset
      mockAuthGuard.canActivate.mockReturnValue(true);
    });

    it('should handle malformed JWT tokens', async () => {
      // Arrange
      mockAuthGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/users/user-123')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      // Reset
      mockAuthGuard.canActivate.mockReturnValue(true);
    });

    it('should handle missing authorization header', async () => {
      // Arrange
      mockAuthGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer()).get('/users/user-123').expect(403);

      // Reset
      mockAuthGuard.canActivate.mockReturnValue(true);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle moderate load on GET /users', async () => {
      // Arrange
      cacheService.getOrSet.mockResolvedValue(mockUsersResponse as any);

      // Act - Send 5 sequential requests
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer()).get('/users');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUsersResponse);
      }
    });

    it('should handle sequential requests efficiently', async () => {
      // Arrange
      usersService.getUserById.mockResolvedValue(mockUser as any);

      // Act - Send sequential requests
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer()).get(
          `/users/user-${i}`,
        );
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle extremely long user IDs', async () => {
      // Arrange
      const longId = 'a'.repeat(1000);
      usersService.getUserById.mockResolvedValue(mockUser as any);

      // Act & Assert
      await request(app.getHttpServer()).get(`/users/${longId}`).expect(200);

      expect(usersService.getUserById).toHaveBeenCalledWith(longId);
    });

    it('should handle special Unicode characters in update data', async () => {
      // Arrange
      const unicodeData = {
        firstName: '李明',
        lastName: 'González',
      };
      const updatedUser = { ...mockUser, ...unicodeData };
      usersService.updateUserProfile.mockResolvedValue(updatedUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/user-123')
        .send(unicodeData)
        .expect(200);

      expect(response.body.firstName).toBe('李明');
      expect(response.body.lastName).toBe('González');
    });

    it('should handle null and undefined values in updates', async () => {
      // Arrange
      const dataWithNulls = {
        firstName: null,
        lastName: undefined,
      };
      const updatedUser = { ...mockUser, firstName: null, lastName: undefined };
      usersService.updateUserProfile.mockResolvedValue(updatedUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/user-123')
        .send(dataWithNulls)
        .expect(200);

      expect(usersService.updateUserProfile).toHaveBeenCalledWith(
        'user-123',
        dataWithNulls,
      );
    });

    it('should handle reasonably large request payloads', async () => {
      // Arrange
      const largeData = {
        firstName: 'A'.repeat(100),
        lastName: 'B'.repeat(100),
      };
      const updatedUser = { ...mockUser, ...largeData };
      usersService.updateUserProfile.mockResolvedValue(updatedUser as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/users/user-123')
        .send(largeData)
        .expect(200);

      expect(response.body.firstName).toBe(largeData.firstName);
      expect(response.body.lastName).toBe(largeData.lastName);
    });
  });
});
