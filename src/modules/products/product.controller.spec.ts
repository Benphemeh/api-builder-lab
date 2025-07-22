import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CacheService } from '../cache/cache.service';
import { JwtGuard } from '../guards/jwt-guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Reflector } from '@nestjs/core';

describe('ProductController', () => {
  let controller: ProductController;

  const mockProductService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    updateProduct: jest.fn(),
    restockProduct: jest.fn(),
    deleteProduct: jest.fn(),
    getFilteredProducts: jest.fn(),
  };

  const mockCacheService = {
    getOrSet: jest.fn((key, callback) => callback()),
  };

  const mockJwtGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: Reflector, useValue: {} },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = {
      name: 'Piggy',
      price: 100,
      stock: 10,
      description: 'Healthy pig',
      category: 'Livestock',
      size: 'Large',
      breed: 'Yorkshire',
      type: 'Domestic',
    };
    const req = { user: { id: 'user-id' } } as any;
    const file = { filename: 'pig.jpg' } as Express.Multer.File;

    const expected = { ...dto, id: '1' };

    mockProductService.create.mockResolvedValue(expected);

    const result = await controller.createProduct(dto, req, file);

    expect(result).toEqual(expected);
    expect(mockProductService.create).toHaveBeenCalledWith(dto, req, file);
  });

  it('should return a product by id with caching', async () => {
    const product = { id: '1', name: 'Piggy' };
    mockProductService.findOne.mockResolvedValue(product);

    const result = await controller.findOneProduct('1');

    expect(result).toEqual(product);
    expect(mockCacheService.getOrSet).toHaveBeenCalled();
    expect(mockProductService.findOne).toHaveBeenCalledWith('1');
  });

  it('should return all products with caching', async () => {
    const result = [{ id: '1', name: 'Piggy' }];
    mockProductService.findAll.mockResolvedValue(result);

    const response = await controller.getAllProducts(
      1,
      10,
      '',
      'createdAt',
      'ASC',
      '',
      undefined,
      undefined,
      undefined,
    );

    expect(response).toEqual(result);
    expect(mockCacheService.getOrSet).toHaveBeenCalled();
    expect(mockProductService.findAll).toHaveBeenCalledWith(
      1,
      10,
      '',
      'createdAt',
      'ASC',
      '',
      undefined,
      undefined,
      undefined,
    );
  });

  it('should return filtered products', async () => {
    const filtered = [{ id: '1', name: 'Filtered Pig' }];
    mockProductService.getFilteredProducts.mockResolvedValue(filtered);

    const result = await controller.getFilteredProducts(
      'category-id',
      50,
      150,
      'Yorkshire',
      4,
    );

    expect(result).toEqual(filtered);
    expect(mockProductService.getFilteredProducts).toHaveBeenCalledWith({
      categoryId: 'category-id',
      minPrice: 50,
      maxPrice: 150,
      brand: 'Yorkshire',
      minRating: 4,
    });
  });

  it('should update a product', async () => {
    const dto: UpdateProductDto = { price: 120, stock: 5 };
    const updatedProduct = { id: '1', ...dto };

    mockProductService.updateProduct.mockResolvedValue(updatedProduct);

    const result = await controller.updateProduct('1', dto);

    expect(result).toEqual(updatedProduct);
    expect(mockProductService.updateProduct).toHaveBeenCalledWith('1', dto);
  });

  it('should restock a product', async () => {
    const restockedProduct = { id: '1', stock: 20 };
    mockProductService.restockProduct.mockResolvedValue(restockedProduct);

    const result = await controller.restockProduct('1', 10);

    expect(result).toEqual(restockedProduct);
    expect(mockProductService.restockProduct).toHaveBeenCalledWith('1', 10);
  });

  it('should delete a product', async () => {
    const result = { deleted: true };
    mockProductService.deleteProduct.mockResolvedValue(result);

    const response = await controller.deleteProduct('1');

    expect(response).toEqual(result);
    expect(mockProductService.deleteProduct).toHaveBeenCalledWith('1');
  });
});
