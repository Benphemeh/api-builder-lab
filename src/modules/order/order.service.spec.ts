import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { REPOSITORY } from 'src/core/constants';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MailService } from 'src/core/mail/mail.service';
import { PaymentService } from '../payment/payment.service';
import Order from 'src/core/database/models/order.model';
import Product from 'src/core/database/models/product.model';
import User from 'src/core/database/models/user.model';
import Delivery from 'src/core/database/models/delivery.model';
import Coupon from 'src/core/database/models/coupon.model';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepository: jest.Mocked<typeof Order>;
  let mockProductRepository: jest.Mocked<typeof Product>;
  let mockUserRepository: jest.Mocked<typeof User>;
  let mockDeliveryRepository: jest.Mocked<typeof Delivery>;
  let mockCouponRepository: jest.Mocked<typeof Coupon>;
  let mockMailService: jest.Mocked<MailService>;
  let mockPaymentService: jest.Mocked<PaymentService>;

  beforeEach(async () => {
    mockOrderRepository = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
    } as any;

    mockProductRepository = {
      findByPk: jest.fn(),
    } as any;

    mockUserRepository = {
      findByPk: jest.fn(),
    } as any;

    mockDeliveryRepository = {
      create: jest.fn(),
    } as any;

    mockCouponRepository = {
      findOne: jest.fn(),
    } as any;

    mockMailService = {
      sendOrderCreationEmail: jest.fn(),
      sendInvoiceEmail: jest.fn(),
      sendOrderUpdateEmail: jest.fn(),
    } as any;

    mockPaymentService = {
      initializePayment: jest.fn(),
      createPayment: jest.fn(),
      verifyPayment: jest.fn(),
      updatePayment: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: REPOSITORY.ORDER, useValue: mockOrderRepository },
        { provide: REPOSITORY.PRODUCT, useValue: mockProductRepository },
        { provide: REPOSITORY.USER, useValue: mockUserRepository },
        { provide: REPOSITORY.DELIVERY, useValue: mockDeliveryRepository },
        { provide: REPOSITORY.COUPON, useValue: mockCouponRepository },
        { provide: MailService, useValue: mockMailService },
        { provide: PaymentService, useValue: mockPaymentService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order and initialize payment', async () => {
      const userId = 'user123';
      const products = [{ productId: 'prod1', quantity: 2 }];
      const deliveryAddress = '123 Test St';
      const totalAmount = 200;

      const mockProduct = {
        id: 'prod1',
        price: 100,
        stock: 5,
        update: jest.fn(),
      };
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
      };
      const mockOrder = {
        id: 'order123',
        get: jest.fn().mockReturnValue({ id: 'order123' }),
      };
      const mockPayment = { data: { reference: 'payment123' } };

      jest.spyOn(service, 'calculateTotal').mockResolvedValue(totalAmount);
      mockProductRepository.findByPk.mockResolvedValue(mockProduct);
      mockUserRepository.findByPk.mockResolvedValue(mockUser);
      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockPaymentService.initializePayment.mockResolvedValue(mockPayment);

      const result = await service.createOrder(
        userId,
        products,
        deliveryAddress,
      );

      expect(service.calculateTotal).toHaveBeenCalledWith(products);
      expect(mockProductRepository.findByPk).toHaveBeenCalledWith('prod1');
      expect(mockProduct.update).toHaveBeenCalledWith({ stock: 3 });
      expect(mockOrderRepository.create).toHaveBeenCalledWith({
        userId,
        products,
        totalAmount,
        deliveryAddress,
        status: 'pending',
      });
      expect(mockMailService.sendOrderCreationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        mockOrder.id,
        totalAmount,
      );
      expect(mockPaymentService.initializePayment).toHaveBeenCalledWith(
        mockUser.email,
        totalAmount,
        mockOrder.id,
      );
      expect(mockPaymentService.createPayment).toHaveBeenCalledWith({
        orderId: mockOrder.id,
        reference: mockPayment.data.reference,
        status: 'pending',
        amount: totalAmount,
      });
      expect(result).toEqual({ ...mockOrder.get(), payment: mockPayment.data });
    });

    it('should throw NotFoundException if a product is not found', async () => {
      const userId = 'user123';
      const products = [{ productId: 'prod1', quantity: 2 }];
      const deliveryAddress = '123 Test St';

      mockProductRepository.findByPk.mockResolvedValue(null);

      await expect(
        service.createOrder(userId, products, deliveryAddress),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product stock is insufficient', async () => {
      const userId = 'user123';
      const products = [{ productId: 'prod1', quantity: 10 }];
      const deliveryAddress = '123 Test St';

      const mockProduct = { id: 'prod1', stock: 5 };
      mockProductRepository.findByPk.mockResolvedValue(mockProduct);

      await expect(
        service.createOrder(userId, products, deliveryAddress),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyOrderPayment', () => {
    it('should verify payment and update order status', async () => {
      const reference = 'payment123';
      const mockPayment = {
        data: { status: 'success', metadata: { orderId: 'order123' } },
      };
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        update: jest.fn(),
        totalAmount: 200,
      };
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
      };

      mockPaymentService.verifyPayment.mockResolvedValue(mockPayment);
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockUserRepository.findByPk.mockResolvedValue(mockUser);

      const result = await service.verifyOrderPayment(reference);

      expect(mockPaymentService.verifyPayment).toHaveBeenCalledWith(reference);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPayment.data.metadata.orderId },
      });
      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'completed' });
      expect(mockPaymentService.updatePayment).toHaveBeenCalledWith(
        reference,
        'success',
      );
      expect(mockMailService.sendInvoiceEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        mockOrder.id,
        mockOrder.totalAmount,
        undefined,
      );
      expect(result).toEqual({
        message: 'Payment verified, order completed, and invoice sent',
        order: mockOrder,
      });
    });

    it('should throw NotFoundException if order is not found', async () => {
      const reference = 'payment123';
      const mockPayment = {
        data: { status: 'success', metadata: { orderId: 'order123' } },
      };

      mockPaymentService.verifyPayment.mockResolvedValue(mockPayment);
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyOrderPayment(reference)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle abandoned payment status', async () => {
      const reference = 'payment123';
      const mockPayment = { data: { status: 'abandoned' } };

      mockPaymentService.verifyPayment.mockResolvedValue(mockPayment);

      await expect(service.verifyOrderPayment(reference)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPaymentService.updatePayment).toHaveBeenCalledWith(
        reference,
        'failed',
      );
    });
  });

  describe('applyCoupon', () => {
    it('should apply a valid coupon to an order', async () => {
      const orderId = 'order123';
      const code = 'DISCOUNT10';
      const mockCoupon = {
        code,
        discountPercentage: 10,
        expiresAt: new Date(Date.now() + 10000),
      };
      const mockOrder = { id: orderId, totalAmount: 100, save: jest.fn() };

      mockCouponRepository.findOne.mockResolvedValue(mockCoupon);
      mockOrderRepository.findByPk.mockResolvedValue(mockOrder);

      const result = await service.applyCoupon(orderId, code);

      expect(mockCouponRepository.findOne).toHaveBeenCalledWith({
        where: { code },
      });
      expect(mockOrderRepository.findByPk).toHaveBeenCalledWith(orderId);
      expect(mockOrder.totalAmount).toBe(90);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException for invalid or expired coupon', async () => {
      const orderId = 'order123';
      const code = 'INVALID';

      mockCouponRepository.findOne.mockResolvedValue(null);

      await expect(service.applyCoupon(orderId, code)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
