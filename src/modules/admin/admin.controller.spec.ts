import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ProductService } from '../products/product.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { CreateCouponDto } from './dto/coupon.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ORDER_STATUS } from 'src/core/enums';

describe('AdminController', () => {
  let controller: AdminController;
  let adminServiceMock: any;
  let productServiceMock: any;

  beforeEach(async () => {
    // Mock dependencies
    adminServiceMock = {
      getAllOrders: jest.fn(),
      getOrderById: jest.fn(),
      updateOrderStatus: jest.fn(),
      deleteOrder: jest.fn(),
      create: jest.fn(),
      getAllProducts: jest.fn(),
      getProductById: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      bulkUploadProducts: jest.fn(),
      createDelivery: jest.fn(),
      getDeliveryByOrderId: jest.fn(),
      updateDeliveryStatus: jest.fn(),
      createCoupon: jest.fn(),
      getCouponByCode: jest.fn(),
      getAllCoupons: jest.fn(),
      deleteCoupon: jest.fn(),
    };

    productServiceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ProductService, useValue: productServiceMock },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const orders = [{ id: 1 }, { id: 2 }];
      adminServiceMock.getAllOrders.mockResolvedValue(orders);

      const result = await controller.getAllOrders();

      expect(result).toEqual(orders);
      expect(adminServiceMock.getAllOrders).toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should return an order by ID', async () => {
      const order = { id: 1 };
      adminServiceMock.getOrderById.mockResolvedValue(order);

      const result = await controller.getOrderById('1');

      expect(result).toEqual(order);
      expect(adminServiceMock.getOrderById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if order is not found', async () => {
      adminServiceMock.getOrderById.mockResolvedValue(null);

      await expect(controller.getOrderById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the status of an order', async () => {
      const updateOrderStatusDto: UpdateOrderStatusDto = {
        status: ORDER_STATUS.DELIVERED,
      };
      const updatedOrder = {
        id: 1,
        status: ORDER_STATUS.DELIVERED,
      };
      adminServiceMock.updateOrderStatus.mockResolvedValue(updatedOrder);

      const result = await controller.updateOrderStatus(
        '1',
        updateOrderStatusDto,
      );

      expect(result).toEqual(updatedOrder);
      expect(adminServiceMock.updateOrderStatus).toHaveBeenCalledWith(
        '1',
        ORDER_STATUS.DELIVERED.toLowerCase(),
      );
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      const response = { message: 'Order deleted successfully' };
      adminServiceMock.deleteOrder.mockResolvedValue(response);

      const result = await controller.deleteOrder('1');

      expect(result).toEqual(response);
      expect(adminServiceMock.deleteOrder).toHaveBeenCalledWith('1');
    });
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product 1',
        price: 100,
        stock: 10,
        description: 'Test product description',
        category: 'Test category',
        size: 'medium',
        breed: 'Test breed',
        type: 'Test type',
      };
      const req = { user: { id: '1', role: 'admin' } };
      const product = { id: 1, ...createProductDto };
      adminServiceMock.create.mockResolvedValue(product);

      const result = await controller.createProduct(createProductDto, req);

      expect(result).toEqual(product);
      expect(adminServiceMock.create).toHaveBeenCalledWith(
        createProductDto,
        req,
      );
    });

    it('should throw BadRequestException if user is not found', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product 1',
        price: 100,
        stock: 10,
        description: 'Test description',
        category: 'Test category',
        size: 'medium',
        breed: 'Test breed',
        type: 'Test type',
      };
      const req = { user: null };

      await expect(
        controller.createProduct(createProductDto, req),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const products = [{ id: 1 }, { id: 2 }];
      adminServiceMock.getAllProducts.mockResolvedValue({
        data: products,
        total: 2,
      });

      const result = await controller.getAllProducts(
        1,
        10,
        '',
        'createdAt',
        'ASC',
        '',
      );

      expect(result).toEqual({ data: products, total: 2 });
      expect(adminServiceMock.getAllProducts).toHaveBeenCalledWith(
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
  });

  describe('getProductById', () => {
    it('should return a product by ID', async () => {
      const product = { id: 1 };
      adminServiceMock.getProductById.mockResolvedValue(product);

      const result = await controller.getProductById('1');

      expect(result).toEqual(product);
      expect(adminServiceMock.getProductById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if product is not found', async () => {
      adminServiceMock.getProductById.mockResolvedValue(null);

      await expect(controller.getProductById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createCoupon', () => {
    it('should create a coupon', async () => {
      const createCouponDto: CreateCouponDto = {
        code: 'DISCOUNT10',
        discountPercentage: 10,
        expiresAt: '2025-12-31',
      };
      const coupon = { id: 1, ...createCouponDto };
      adminServiceMock.createCoupon.mockResolvedValue(coupon);

      const result = await controller.createCoupon(createCouponDto);

      expect(result).toEqual(coupon);
      expect(adminServiceMock.createCoupon).toHaveBeenCalledWith(
        createCouponDto,
      );
    });
  });

  describe('getCouponByCode', () => {
    it('should throw NotFoundException if coupon is not found', async () => {
      adminServiceMock.getCouponByCode.mockResolvedValue(null);

      await expect(controller.getCouponByCode('DISCOUNT10')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
