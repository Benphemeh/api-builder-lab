import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
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
  };

  const mockJwtGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
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

    mockProductService.create.mockResolvedValue({ ...dto, id: '1' });

    expect(await controller.createProduct(dto, req, file)).toEqual({
      ...dto,
      id: '1',
    });
    expect(mockProductService.create).toHaveBeenCalledWith(dto, req, file);
  });

  it('should return one product by id', async () => {
    const result = { id: '1', name: 'Piggy' };
    mockProductService.findOne.mockResolvedValue(result);
    expect(await controller.findOneProduct('1')).toEqual(result);
    expect(mockProductService.findOne).toHaveBeenCalledWith('1');
  });

  it('should return all products', async () => {
    const result = [{ id: '1', name: 'Piggy' }];
    mockProductService.findAll.mockResolvedValue(result);

    expect(
      await controller.getAllProducts(
        1,
        10,
        '',
        'createdAt',
        'ASC',
        '',
        undefined,
        undefined,
        undefined,
      ),
    ).toEqual(result);
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

  it('should update a product', async () => {
    const dto: UpdateProductDto = { price: 120, stock: 5 };
    const result = { id: '1', ...dto };
    mockProductService.updateProduct.mockResolvedValue(result);

    expect(await controller.updateProduct('1', dto)).toEqual(result);
    expect(mockProductService.updateProduct).toHaveBeenCalledWith('1', dto);
  });

  it('should restock a product', async () => {
    const result = { id: '1', stock: 20 };
    mockProductService.restockProduct.mockResolvedValue(result);

    expect(await controller.restockProduct('1', 10)).toEqual(result);
    expect(mockProductService.restockProduct).toHaveBeenCalledWith('1', 10);
  });

  it('should delete a product', async () => {
    const result = { deleted: true };
    mockProductService.deleteProduct.mockResolvedValue(result);

    expect(await controller.deleteProduct('1')).toEqual(result);
    expect(mockProductService.deleteProduct).toHaveBeenCalledWith('1');
  });
});
