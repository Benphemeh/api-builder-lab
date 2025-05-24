import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { MailService } from 'src/core/mail/mail.service';
import { UsersService } from '../users/users.service';
import { REPOSITORY } from 'src/core/constants';
import Product from 'src/core/database/models/product.model';
import { Repository } from 'sequelize-typescript';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as fs from 'fs';
import cloudinary from 'src/core/cloudinary/cloudinary.config';

// Mock external dependencies
jest.mock('fs');
jest.mock('src/core/cloudinary/cloudinary.config');
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

// Mock the UsersService module to avoid bcrypt import issues
jest.mock('../users/users.service', () => ({
  UsersService: jest.fn().mockImplementation(() => ({
    findOneById: jest.fn(),
  })),
}));

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: jest.Mocked<Repository<Product>>;
  let mailService: jest.Mocked<MailService>;
  let userService: jest.Mocked<UsersService>;

  // Mock data
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    price: 100,
    stock: 10,
    category: 'electronics',
    userId: 'user-123',
    imageUrl: 'http://example.com/image.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
    save: jest.fn(),
    destroy: jest.fn(),
  } as any;

  const mockCreateProductDto: CreateProductDto = {
    name: 'Test Product',
    price: 100,
    stock: 10,
    category: 'electronics',
    description: 'Test description',
    size: 'medium',
    breed: 'none',
    type: 'product',
  };

  const mockUpdateProductDto: UpdateProductDto = {
    // name: 'Updated Product',
    price: 150,
    stock: 15,
  };

  const mockRequest = {
    user: { id: 'user-123' },
  } as any;

  const mockFile = {
    path: '/tmp/test-file.jpg',
    filename: 'test-file.jpg',
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: REPOSITORY.PRODUCT,
          useValue: {
            create: jest.fn(),
            findByPk: jest.fn(),
            findAndCountAll: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendProductListedEmail: jest.fn(),
            sendProductUpdatedEmail: jest.fn(),
            sendProductRestockedEmail: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get(REPOSITORY.PRODUCT);
    mailService = module.get(MailService);
    userService = module.get(UsersService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully without file upload', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(mockUser as any);
      productRepository.create.mockResolvedValue(mockProduct);
      mailService.sendProductListedEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.create(mockCreateProductDto, mockRequest);

      // Assert
      expect(userService.findOneById).toHaveBeenCalledWith('user-123');
      expect(productRepository.create).toHaveBeenCalledWith({
        ...mockCreateProductDto,
        userId: 'user-123',
        imageUrl: null,
      });
      expect(mailService.sendProductListedEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser,
        mockCreateProductDto.name,
        mockCreateProductDto.price,
        mockCreateProductDto.stock,
      );
      expect(result).toEqual(mockProduct);
    });

    it('should create a product successfully with file upload', async () => {
      // Arrange
      const mockUploadResult = {
        secure_url: 'http://cloudinary.com/image.jpg',
      };
      userService.findOneById.mockResolvedValue(mockUser as any);
      productRepository.create.mockResolvedValue(mockProduct);
      mailService.sendProductListedEmail.mockResolvedValue(undefined);
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(
        mockUploadResult,
      );
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      // Act
      const result = await service.create(
        mockCreateProductDto,
        mockRequest,
        mockFile,
      );

      // Assert
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(mockFile.path, {
        folder: 'products',
        public_id: mockCreateProductDto.name,
      });
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFile.path);
      expect(productRepository.create).toHaveBeenCalledWith({
        ...mockCreateProductDto,
        userId: 'user-123',
        imageUrl: mockUploadResult.secure_url,
      });
      expect(result).toEqual(mockProduct);
    });

    it('should use imageUrl from DTO when provided and no file uploaded', async () => {
      // Arrange
      const dtoWithImageUrl = {
        ...mockCreateProductDto,
        imageUrl: 'http://example.com/existing.jpg',
      };
      userService.findOneById.mockResolvedValue(mockUser as any);
      productRepository.create.mockResolvedValue(mockProduct);
      mailService.sendProductListedEmail.mockResolvedValue(undefined);

      // Act
      await service.create(dtoWithImageUrl, mockRequest);

      // Assert
      expect(productRepository.create).toHaveBeenCalledWith({
        ...dtoWithImageUrl,
        userId: 'user-123',
        imageUrl: 'http://example.com/existing.jpg',
      });
    });

    it('should throw BadRequestException when user is not found in request', async () => {
      // Arrange
      const requestWithoutUser = {} as any;

      // Act & Assert
      await expect(
        service.create(mockCreateProductDto, requestWithoutUser),
      ).rejects.toThrow(new BadRequestException('User not found'));
    });

    it('should throw BadRequestException when user does not exist in database', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create(mockCreateProductDto, mockRequest),
      ).rejects.toThrow(new BadRequestException('User not found'));
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(mockProduct);

      // Act
      const result = await service.findOne('product-123');

      // Assert
      expect(productRepository.findByPk).toHaveBeenCalledWith('product-123');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product is not found', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Product not found'),
      );
    });
  });

  describe('findAll', () => {
    const mockProducts = [mockProduct, { ...mockProduct, id: 'product-456' }];
    const mockFindAndCountAllResult: any = {
      rows: mockProducts,
      count: 2,
    };

    it('should return paginated products with default parameters', async () => {
      // Arrange
      productRepository.findAndCountAll.mockResolvedValue(
        mockFindAndCountAllResult,
      );

      // Act
      const result = await service.findAll(1, 10, '', 'createdAt', 'ASC', '');

      // Assert
      expect(productRepository.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['createdAt', 'ASC']],
      });
      expect(result).toEqual({
        data: mockProducts,
        total: 2,
      });
    });

    it('should apply search filter when provided', async () => {
      // Arrange
      productRepository.findAndCountAll.mockResolvedValue(
        mockFindAndCountAllResult,
      );

      // Act
      await service.findAll(1, 10, 'test', 'createdAt', 'ASC', '');

      // Assert
      expect(productRepository.findAndCountAll).toHaveBeenCalledWith({
        where: { name: { [Symbol.for('like')]: '%test%' } },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'ASC']],
      });
    });

    it('should apply all filters when provided', async () => {
      // Arrange
      productRepository.findAndCountAll.mockResolvedValue(
        mockFindAndCountAllResult,
      );

      // Act
      await service.findAll(
        2,
        5,
        'test',
        'name',
        'DESC',
        'electronics',
        'large',
        'poodle',
        'dog',
      );

      // Assert
      expect(productRepository.findAndCountAll).toHaveBeenCalledWith({
        where: {
          name: { [Symbol.for('like')]: '%test%' },
          category: 'electronics',
          size: 'large',
          breed: 'poodle',
          type: 'dog',
        },
        limit: 5,
        offset: 5,
        order: [['name', 'DESC']],
      });
    });

    it('should calculate correct offset for pagination', async () => {
      // Arrange
      productRepository.findAndCountAll.mockResolvedValue(
        mockFindAndCountAllResult,
      );

      // Act
      await service.findAll(3, 20, '', 'createdAt', 'ASC', '');

      // Assert
      expect(productRepository.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 20,
        offset: 40, // (3-1) * 20
        order: [['createdAt', 'ASC']],
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(mockProduct);
      userService.findOneById.mockResolvedValue(mockUser as any);
      mailService.sendProductUpdatedEmail.mockResolvedValue(undefined);
      mockProduct.update.mockResolvedValue(mockProduct);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await service.updateProduct(
        'product-123',
        mockUpdateProductDto,
      );

      // Assert
      expect(productRepository.findByPk).toHaveBeenCalledWith('product-123');
      expect(mockProduct.update).toHaveBeenCalledWith(mockUpdateProductDto);
      expect(userService.findOneById).toHaveBeenCalledWith('user-123');
      expect(mailService.sendProductUpdatedEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser,
        mockProduct.name,
        mockProduct.price,
        mockProduct.stock,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Product Test Product updated successfully',
      );
      expect(result).toEqual(mockProduct);

      consoleSpy.mockRestore();
    });

    it('should throw NotFoundException when product is not found', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateProduct('non-existent-id', mockUpdateProductDto),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });

    it('should handle email sending failure gracefully', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(mockProduct);
      userService.findOneById.mockResolvedValue(mockUser as any);
      mailService.sendProductUpdatedEmail.mockRejectedValue(
        new Error('Email service down'),
      );
      mockProduct.update.mockResolvedValue(mockProduct);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await service.updateProduct(
        'product-123',
        mockUpdateProductDto,
      );

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send email update : Email service down',
      );
      expect(result).toEqual(mockProduct);

      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should skip email when user is not found', async () => {
      // Arrange
      const productWithoutUser = { ...mockProduct, userId: null };
      productRepository.findByPk.mockResolvedValue(productWithoutUser);
      mockProduct.update.mockResolvedValue(productWithoutUser);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.updateProduct('product-123', mockUpdateProductDto);

      // Assert
      expect(userService.findOneById).not.toHaveBeenCalled();
      expect(mailService.sendProductUpdatedEmail).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('restockProduct', () => {
    it('should restock product successfully', async () => {
      // Arrange
      const productToRestock = { ...mockProduct, stock: 5 };
      productRepository.findByPk.mockResolvedValue(productToRestock);
      userService.findOneById.mockResolvedValue(mockUser as any);
      mailService.sendProductRestockedEmail.mockResolvedValue(undefined);
      productToRestock.save.mockResolvedValue(productToRestock);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await service.restockProduct('product-123', 10);

      // Assert
      expect(productRepository.findByPk).toHaveBeenCalledWith('product-123');
      expect(productToRestock.stock).toBe(15); // 5 + 10
      expect(productToRestock.save).toHaveBeenCalled();
      expect(userService.findOneById).toHaveBeenCalledWith('user-123');
      expect(mailService.sendProductRestockedEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser,
        productToRestock.name,
        15,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Product Test Product restocked successfully. New stock: 15',
      );
      expect(result).toEqual(productToRestock);

      consoleSpy.mockRestore();
    });

    it('should throw NotFoundException when product is not found', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.restockProduct('non-existent-id', 10),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });

    it('should handle email sending failure gracefully during restock', async () => {
      // Arrange
      const productToRestock = { ...mockProduct, stock: 5 };
      productRepository.findByPk.mockResolvedValue(productToRestock);
      userService.findOneById.mockResolvedValue(mockUser as any);
      mailService.sendProductRestockedEmail.mockRejectedValue(
        new Error('Email service down'),
      );
      productToRestock.save.mockResolvedValue(productToRestock);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await service.restockProduct('product-123', 10);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send restock email: Email service down',
      );
      expect(result.stock).toBe(15);

      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should skip email when product has no userId', async () => {
      // Arrange
      const productWithoutUser = { ...mockProduct, userId: null, stock: 5 };
      productRepository.findByPk.mockResolvedValue(productWithoutUser);
      productWithoutUser.save.mockResolvedValue(productWithoutUser);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.restockProduct('product-123', 10);

      // Assert
      expect(userService.findOneById).not.toHaveBeenCalled();
      expect(mailService.sendProductRestockedEmail).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(mockProduct);
      mockProduct.destroy.mockResolvedValue(undefined);

      // Act
      const result = await service.deleteProduct('product-123');

      // Assert
      expect(productRepository.findByPk).toHaveBeenCalledWith('product-123');
      expect(mockProduct.destroy).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Product with ID product-123 has been successfully deleted',
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteProduct('non-existent-id')).rejects.toThrow(
        new NotFoundException('Product with ID non-existent-id not found'),
      );
    });
  });
});
