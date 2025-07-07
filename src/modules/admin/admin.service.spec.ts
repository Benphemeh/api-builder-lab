import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../products/product.service';
import { UsersService } from '../users/users.service';
import { DeliveryService } from '../delivery/delivery.service';
import { REPOSITORY } from 'src/core/constants';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { CreateCouponDto } from './dto/coupon.dto';
import { ORDER_STATUS } from 'src/core/enums';

describe('AdminService', () => {
  let service: AdminService;
  let orderServiceMock: any;
  let productServiceMock: any;
  let usersServiceMock: any;
  let deliveryServiceMock: any;
  let productRepositoryMock: any;
  let couponRepositoryMock: any;

  beforeEach(async () => {
    // Mock dependencies
    orderServiceMock = {
      getAllOrders: jest.fn(),
      getOrderById: jest.fn(),
      updateOrder: jest.fn(),
      deleteOrder: jest.fn(),
    };

    productServiceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      deleteProduct: jest.fn(),
    };

    usersServiceMock = {
      findOne: jest.fn(),
    };

    deliveryServiceMock = {
      getDeliveryByOrderId: jest.fn(),
      createDelivery: jest.fn(),
      updateDeliveryStatus: jest.fn(),
    };

    productRepositoryMock = {
      create: jest.fn(),
      findByPk: jest.fn(),
    };

    couponRepositoryMock = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: OrderService, useValue: orderServiceMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: DeliveryService, useValue: deliveryServiceMock },
        { provide: REPOSITORY.PRODUCT, useValue: productRepositoryMock },
        { provide: REPOSITORY.COUPON, useValue: couponRepositoryMock },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const orders = [{ id: 1 }, { id: 2 }];
      orderServiceMock.getAllOrders.mockResolvedValue(orders);

      const filters = { search: '', fromDate: '', toDate: '' };
      const result = await service.getAllOrders(filters);

      expect(result).toEqual(orders);
      expect(orderServiceMock.getAllOrders).toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should return an order by ID', async () => {
      const order = { id: 1 };
      orderServiceMock.getOrderById.mockResolvedValue(order);

      const result = await service.getOrderById('1');

      expect(result).toEqual(order);
      expect(orderServiceMock.getOrderById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if order is not found', async () => {
      orderServiceMock.getOrderById.mockResolvedValue(null);

      await expect(service.getOrderById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the status of an order', async () => {
      const updatedOrder = { id: 1, status: ORDER_STATUS.DELIVERED };
      orderServiceMock.updateOrder.mockResolvedValue(updatedOrder);

      const result = await service.updateOrderStatus(
        '1',
        ORDER_STATUS.DELIVERED,
      );

      expect(result).toEqual(updatedOrder);
      expect(orderServiceMock.updateOrder).toHaveBeenCalledWith('1', {
        status: ORDER_STATUS.DELIVERED,
      });
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      const order = { id: 1 };
      orderServiceMock.getOrderById.mockResolvedValue(order);
      orderServiceMock.deleteOrder.mockResolvedValue(undefined);

      const result = await service.deleteOrder('1');

      expect(result).toEqual({
        message: `Order with id 1 deleted successfully`,
      });
      expect(orderServiceMock.deleteOrder).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if order is not found', async () => {
      orderServiceMock.getOrderById.mockResolvedValue(null);

      await expect(service.deleteOrder('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const products = [{ id: 1 }, { id: 2 }];
      productServiceMock.findAll.mockResolvedValue({
        data: products,
        total: 2,
      });

      const result = await service.getAllProducts(
        1,
        10,
        '',
        'createdAt',
        'ASC',
        '',
      );

      expect(result).toEqual({ data: products, total: 2 });
      expect(productServiceMock.findAll).toHaveBeenCalledWith(
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
      productServiceMock.findOne.mockResolvedValue(product);

      const result = await service.getProductById('1');

      expect(result).toEqual(product);
      expect(productServiceMock.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if product is not found', async () => {
      productServiceMock.findOne.mockResolvedValue(null);

      await expect(service.getProductById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product 1',
        description: 'Test product',
        price: 100,
        stock: 10,
        userId: '1',
        category: 'test',
        size: 'medium',
        breed: 'test',
        type: 'test',
      };
      const product = { id: 1, ...createProductDto };
      productRepositoryMock.create.mockResolvedValue(product);

      const req = { user: { id: '1' } };

      const result = await service.create(createProductDto, req as any);

      expect(result).toEqual(product);
      expect(productRepositoryMock.create).toHaveBeenCalledWith({
        ...createProductDto,
        userId: '1',
      });
    });

    it('should throw BadRequestException if user ID is missing', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product 1',
        description: 'Test product',
        price: 100,
        stock: 10,
        category: 'test',
        size: 'medium',
        breed: 'test',
        type: 'test',
      };
      const req = { user: null };

      await expect(
        service.create(createProductDto, req as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      productServiceMock.deleteProduct.mockResolvedValue(undefined);

      const result = await service.deleteProduct('1');

      expect(result).toBeUndefined();
      expect(productServiceMock.deleteProduct).toHaveBeenCalledWith('1');
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
      couponRepositoryMock.create.mockResolvedValue(coupon);

      const result = await service.createCoupon(createCouponDto);

      expect(result).toEqual(coupon);
      expect(couponRepositoryMock.create).toHaveBeenCalledWith(createCouponDto);
    });
  });

  describe('getCouponByCode', () => {
    it('should return a coupon by code', async () => {
      const coupon = { id: 1, code: 'DISCOUNT10' };
      couponRepositoryMock.findOne.mockResolvedValue(coupon);

      const result = await service.getCouponByCode('DISCOUNT10');

      expect(result).toEqual(coupon);
      expect(couponRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { code: 'DISCOUNT10' },
      });
    });

    it('should throw NotFoundException if coupon is not found', async () => {
      couponRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.getCouponByCode('DISCOUNT10')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
