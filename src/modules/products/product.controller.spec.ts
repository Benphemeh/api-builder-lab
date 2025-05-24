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

// Remove the extra line '.compile();' from the beforeEach block, and remove this function entirely
// import { ProductService } from './product.service';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
// import { BadRequestException, NotFoundException } from '@nestjs/common';

// jest.mock('./product.service');

// describe('ProductController', () => {
//   let controller: ProductController;
//   let productService: jest.Mocked<ProductService>;

//   const mockCreateProductDto: CreateProductDto = {
//     name: 'Test Product',
//     price: 100,
//     stock: 10,
//     category: 'electronics',
//     description: 'Test description',
//     size: 'medium',
//     breed: 'none',
//     type: 'product',
//   };

//   const mockUpdateProductDto: UpdateProductDto = {
//     price: 150,
//     stock: 15,
//   };

//   const mockProduct = {
//     id: 'product-123',
//     name: 'Test Product',
//     price: 100,
//     stock: 10,
//     category: 'electronics',
//     description: 'Test description',
//     size: 'medium',
//     breed: 'none',
//     type: 'product',
//     userId: 'user-123',
//     imageUrl: 'http://example.com/image.jpg',
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [ProductController],
//       providers: [
//         {
//           provide: ProductService,
//           useValue: {
//             create: jest.fn(),
//             findOne: jest.fn(),
//             findAll: jest.fn(),
//             updateProduct: jest.fn(),
//             restockProduct: jest.fn(),
//             deleteProduct: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<ProductController>(ProductController);
//     productService = module.get(ProductService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('createProduct', () => {
//     it('should create a product successfully', async () => {
//       const mockRequest = { user: { id: 'user-123' } } as any;
//       const mockFile = { path: '/tmp/test-file.jpg' } as Express.Multer.File;

//       productService.create.mockResolvedValue(mockProduct);

//       const result = await controller.createProduct(
//         mockCreateProductDto,
//         mockRequest,
//         mockFile,
//       );

//       expect(productService.create).toHaveBeenCalledWith(
//         mockCreateProductDto,
//         mockRequest,
//         mockFile,
//       );
//       expect(result).toEqual(mockProduct);
//     });

//     it('should throw BadRequestException if user is not found in request', async () => {
//       const mockRequest = {} as any;

//       productService.create.mockRejectedValue(
//         new BadRequestException('User not found'),
//       );

//       await expect(
//         controller.createProduct(mockCreateProductDto, mockRequest),
//       ).rejects.toThrow(BadRequestException);
//     });
//   });

//   describe('findOneProduct', () => {
//     it('should return a product when found', async () => {
//       productService.findOne.mockResolvedValue(mockProduct);

//       const result = await controller.findOneProduct('product-123');

//       expect(productService.findOne).toHaveBeenCalledWith('product-123');
//       expect(result).toEqual(mockProduct);
//     });

//     it('should throw NotFoundException when product is not found', async () => {
//       productService.findOne.mockRejectedValue(
//         new NotFoundException('Product not found'),
//       );

//       await expect(
//         controller.findOneProduct('non-existent-id'),
//       ).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('getAllProducts', () => {
//     it('should return paginated products', async () => {
//       const mockProducts = [mockProduct];
//       const mockResult = { data: mockProducts, total: 1 };

//       productService.findAll.mockResolvedValue(mockResult);

//       const result = await controller.getAllProducts(
//         1,
//         10,
//         '',
//         'createdAt',
//         'ASC',
//         '',
//       );

//       expect(productService.findAll).toHaveBeenCalledWith(
//         1,
//         10,
//         '',
//         'createdAt',
//         'ASC',
//         '',
//         undefined,
//         undefined,
//         undefined,
//       );
//       expect(result).toEqual(mockResult);
//     });
//   });

//   describe('updateProduct', () => {
//     it('should update a product successfully', async () => {
//       productService.updateProduct.mockResolvedValue(mockProduct);

//       const result = await controller.updateProduct(
//         'product-123',
//         mockUpdateProductDto,
//       );

//       expect(productService.updateProduct).toHaveBeenCalledWith(
//         'product-123',
//         mockUpdateProductDto,
//       );
//       expect(result).toEqual(mockProduct);
//     });

//     it('should throw NotFoundException when product is not found', async () => {
//       productService.updateProduct.mockRejectedValue(
//         new NotFoundException('Product not found'),
//       );

//       await expect(
//         controller.updateProduct('non-existent-id', mockUpdateProductDto),
//       ).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('restockProduct', () => {
//     it('should restock a product successfully', async () => {
//       productService.restockProduct.mockResolvedValue(mockProduct);

//       const result = await controller.restockProduct('product-123', 10);

//       expect(productService.restockProduct).toHaveBeenCalledWith(
//         'product-123',
//         10,
//       );
//       expect(result).toEqual(mockProduct);
//     });

//     it('should throw NotFoundException when product is not found', async () => {
//       productService.restockProduct.mockRejectedValue(
//         new NotFoundException('Product not found'),
//       );

//       await expect(
//         controller.restockProduct('non-existent-id', 10),
//       ).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('deleteProduct', () => {
//     it('should delete a product successfully', async () => {
//       const mockResult = {
//         message: 'Product with ID product-123 has been successfully deleted',
//       };

//       productService.deleteProduct.mockResolvedValue(mockResult);

//       const result = await controller.deleteProduct('product-123');

//       expect(productService.deleteProduct).toHaveBeenCalledWith('product-123');
//       expect(result).toEqual(mockResult);
//     });

//     it('should throw NotFoundException when product is not found', async () => {
//       productService.deleteProduct.mockRejectedValue(
//         new NotFoundException('Product not found'),
//       );

//       await expect(controller.deleteProduct('non-existent-id')).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });
// });
