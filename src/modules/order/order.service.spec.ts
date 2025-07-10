import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { MailService } from 'src/core/mail/mail.service';
import { PaymentService } from '../payment/payment.service';
import { CartService } from '../cart/cart.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import { ORDER_STATUS } from 'src/core/enums';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Op } from 'sequelize';

describe('OrderService', () => {
  let service: OrderService;
  let productRepository: jest.Mocked<any>;
  let orderRepository: jest.Mocked<any>;
  let userRepository: jest.Mocked<any>;
  let deliveryRepository: jest.Mocked<any>;
  let couponRepository: jest.Mocked<any>;
  let mailService: jest.Mocked<MailService>;
  let paymentService: jest.Mocked<PaymentService>;
  let cartService: jest.Mocked<CartService>;

  // Mock data
  const mockProduct = {
    id: 'product-123',
    name: 'Medium Size Pig',
    price: 45000,
    stock: 10,
    update: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockReturnValue({
      id: 'product-123',
      name: 'Medium Size Pig',
      price: 45000,
      stock: 10,
    }),
  };

  const mockUser = {
    id: 'user-123',
    email: 'customer@onimu-elede.com',
    firstName: 'Adebayo',
    lastName: 'Johnson',
  };

  const mockOrder = {
    id: 'order-123',
    userId: 'user-123',
    products: [{ productId: 'product-123', quantity: 1 }],
    totalAmount: 45000,
    deliveryAddress: '123 Farm Lane, Lagos, Nigeria',
    status: ORDER_STATUS.PENDING,
    update: jest.fn(),
    save: jest.fn(),
    destroy: jest.fn(),
    get: jest.fn().mockReturnValue({
      id: 'order-123',
      userId: 'user-123',
      products: [{ productId: 'product-123', quantity: 1 }],
      totalAmount: 45000,
      deliveryAddress: '123 Farm Lane, Lagos, Nigeria',
      status: ORDER_STATUS.PENDING,
    }),
  };

  const mockCoupon = {
    id: 'coupon-123',
    code: 'SAVE20',
    discountPercentage: 20,
    expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
  };

  const mockDelivery = {
    id: 'delivery-123',
    orderId: 'order-123',
    deliveryAddress: '123 Farm Lane, Lagos, Nigeria',
    logisticsProvider: 'DHL',
    status: 'pending',
  };

  const mockPayment = {
    id: 'payment-123',
    orderId: 'order-123',
    reference: 'paystack_ref_123',
    status: 'pending',
    amount: 45000,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    update: jest.fn(),
    save: jest.fn(),
    destroy: jest.fn(),
    get: jest.fn(),
  } as any;

  const mockPaystackResponse = {
    data: {
      reference: 'paystack_ref_123',
      access_code: 'access_code_123',
      authorization_url: 'https://checkout.paystack.com/access_code_123',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: REPOSITORY.PRODUCT,
          useValue: {
            findByPk: jest.fn(),
          },
        },
        {
          provide: REPOSITORY.ORDER,
          useValue: {
            create: jest.fn(),
            findByPk: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: REPOSITORY.USER,
          useValue: {
            findByPk: jest.fn(),
          },
        },
        {
          provide: REPOSITORY.DELIVERY,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: REPOSITORY.COUPON,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendOrderCreationEmail: jest.fn(),
            sendInvoiceEmail: jest.fn(),
            sendOrderUpdateEmail: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            initializePayment: jest.fn(),
            createPayment: jest.fn(),
            verifyPayment: jest.fn(),
            updatePayment: jest.fn(),
          },
        },
        {
          provide: CartService,
          useValue: {
            convertCartToOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    productRepository = module.get(REPOSITORY.PRODUCT);
    orderRepository = module.get(REPOSITORY.ORDER);
    userRepository = module.get(REPOSITORY.USER);
    deliveryRepository = module.get(REPOSITORY.DELIVERY);
    couponRepository = module.get(REPOSITORY.COUPON);
    mailService = module.get(MailService);
    paymentService = module.get(PaymentService);
    cartService = module.get(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const orderData = {
      userId: 'user-123',
      products: [{ productId: 'product-123', quantity: 2 }],
      deliveryAddress: '123 Farm Lane, Lagos, Nigeria',
    };

    it('should create order successfully', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(mockProduct);
      userRepository.findByPk.mockResolvedValue(mockUser);
      orderRepository.create.mockResolvedValue(mockOrder);
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment);
      mailService.sendOrderCreationEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.createOrder(
        orderData.userId,
        orderData.products,
        orderData.deliveryAddress,
      );

      // Assert
      expect(productRepository.findByPk).toHaveBeenCalledWith('product-123');
      expect(mockProduct.update).toHaveBeenCalledWith({ stock: 8 }); // 10 - 2
      expect(orderRepository.create).toHaveBeenCalledWith({
        userId: orderData.userId,
        products: orderData.products,
        totalAmount: 90000, // 45000 * 2
        deliveryAddress: orderData.deliveryAddress,
        status: 'pending',
      });
      expect(mailService.sendOrderCreationEmail).toHaveBeenCalled();
      expect(paymentService.initializePayment).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createOrder(
          orderData.userId,
          orderData.products,
          orderData.deliveryAddress,
        ),
      ).rejects.toThrow(
        new NotFoundException('Product with id product-123 not found'),
      );
    });

    it('should throw NotFoundException when insufficient stock', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue({
        ...mockProduct,
        stock: 1,
      });

      // Act & Assert
      await expect(
        service.createOrder(
          orderData.userId,
          [{ productId: 'product-123', quantity: 5 }],
          orderData.deliveryAddress,
        ),
      ).rejects.toThrow(
        new NotFoundException('insufficient stock for product id product-123'),
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(mockProduct);
      userRepository.findByPk.mockResolvedValue(null);
      orderRepository.create.mockResolvedValue(mockOrder);

      // Act & Assert
      await expect(
        service.createOrder(
          orderData.userId,
          orderData.products,
          orderData.deliveryAddress,
        ),
      ).rejects.toThrow(
        new NotFoundException('User with id user-123 not found'),
      );
    });
  });

  describe('createOrderFromCart', () => {
    it('should create order from cart successfully', async () => {
      // Arrange
      const cartData = {
        products: [{ productId: 'product-123', quantity: 1 }],
        totalAmount: 45000,
      };
      cartService.convertCartToOrder.mockResolvedValue(cartData);
      productRepository.findByPk.mockResolvedValue(mockProduct);
      userRepository.findByPk.mockResolvedValue(mockUser);
      orderRepository.create.mockResolvedValue(mockOrder);
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment);
      mailService.sendOrderCreationEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.createOrderFromCart(
        'user-123',
        '123 Farm Lane, Lagos, Nigeria',
        'cart-123',
      );

      // Assert
      expect(cartService.convertCartToOrder).toHaveBeenCalledWith(
        'user-123',
        'cart-123',
      );
      expect(result).toBeDefined();
    });
  });

  describe('verifyOrderPayment', () => {
    it('should verify payment and complete order successfully', async () => {
      // Arrange
      const paymentData = {
        data: {
          status: 'success',
          metadata: { orderId: 'order-123' },
        },
      };
      paymentService.verifyPayment.mockResolvedValue(paymentData);
      orderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrder.update.mockResolvedValue(mockOrder);
      paymentService.updatePayment.mockResolvedValue(mockPayment);
      deliveryRepository.create.mockResolvedValue(mockDelivery);
      userRepository.findByPk.mockResolvedValue(mockUser);
      mailService.sendInvoiceEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.verifyOrderPayment('paystack_ref_123');

      // Assert
      expect(paymentService.verifyPayment).toHaveBeenCalledWith(
        'paystack_ref_123',
      );
      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'completed' });
      expect(deliveryRepository.create).toHaveBeenCalled();
      expect(mailService.sendInvoiceEmail).toHaveBeenCalled();
      expect(result.message).toBe(
        'Payment verified, order completed, and invoice sent',
      );
    });

    it('should handle abandoned payment', async () => {
      // Arrange
      const paymentData = {
        data: {
          status: 'abandoned',
          metadata: { orderId: 'order-123' },
        },
      };
      paymentService.verifyPayment.mockResolvedValue(paymentData);
      paymentService.updatePayment.mockResolvedValue(mockPayment);

      // Act & Assert
      await expect(
        service.verifyOrderPayment('paystack_ref_123'),
      ).rejects.toThrow(BadRequestException);
      expect(paymentService.updatePayment).toHaveBeenCalledWith(
        'paystack_ref_123',
        'failed',
      );
    });

    it('should handle failed payment verification', async () => {
      // Arrange
      const paymentData = {
        data: {
          status: 'failed',
          metadata: { orderId: 'order-123' },
        },
      };
      paymentService.verifyPayment.mockResolvedValue(paymentData);
      paymentService.updatePayment.mockResolvedValue(mockPayment);

      // Act & Assert
      await expect(
        service.verifyOrderPayment('paystack_ref_123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      const paymentData = {
        data: {
          status: 'success',
          metadata: { orderId: 'order-123' },
        },
      };
      paymentService.verifyPayment.mockResolvedValue(paymentData);
      orderRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.verifyOrderPayment('paystack_ref_123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('applyCoupon', () => {
    it('should apply coupon successfully', async () => {
      // Arrange
      couponRepository.findOne.mockResolvedValue(mockCoupon);
      orderRepository.findByPk.mockResolvedValue(mockOrder);
      mockOrder.save.mockResolvedValue(mockOrder);

      // Act
      const result = await service.applyCoupon('order-123', 'SAVE20');

      // Assert
      expect(couponRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'SAVE20' },
      });
      expect(mockOrder.totalAmount).toBe(36000); // 45000 * 0.8
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result).toBe(mockOrder);
    });

    it('should throw BadRequestException for invalid coupon', async () => {
      // Arrange
      couponRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.applyCoupon('order-123', 'INVALID')).rejects.toThrow(
        new BadRequestException('Invalid or expired coupon'),
      );
    });

    it('should throw BadRequestException for expired coupon', async () => {
      // Arrange
      const expiredCoupon = {
        ...mockCoupon,
        expiresAt: new Date(Date.now() - 86400000), // 24 hours ago
      };
      couponRepository.findOne.mockResolvedValue(expiredCoupon);

      // Act & Assert
      await expect(service.applyCoupon('order-123', 'EXPIRED')).rejects.toThrow(
        new BadRequestException('Invalid or expired coupon'),
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      couponRepository.findOne.mockResolvedValue(mockCoupon);
      orderRepository.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.applyCoupon('invalid-order', 'SAVE20'),
      ).rejects.toThrow(
        new NotFoundException('Order with ID invalid-order not found'),
      );
    });
  });

  describe('getOrderById', () => {
    it('should return order successfully', async () => {
      // Arrange
      orderRepository.findByPk.mockResolvedValue(mockOrder);

      // Act
      const result = await service.getOrderById('order-123');

      // Assert
      expect(orderRepository.findByPk).toHaveBeenCalledWith('order-123');
      expect(result).toBe(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      orderRepository.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getOrderById('invalid-order')).rejects.toThrow(
        new NotFoundException('Order with id invalid-order not found'),
      );
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders without filters', async () => {
      // Arrange
      const mockOrders = [mockOrder];
      orderRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await service.getAllOrders({});

      // Assert
      expect(orderRepository.findAll).toHaveBeenCalledWith({ where: {} });
      expect(result).toBe(mockOrders);
    });

    it('should filter orders by status', async () => {
      // Arrange
      const mockOrders = [mockOrder];
      orderRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await service.getAllOrders({ status: 'pending' });

      // Assert
      expect(orderRepository.findAll).toHaveBeenCalledWith({
        where: { status: 'pending' },
      });
      expect(result).toBe(mockOrders);
    });

    it('should filter orders by search term', async () => {
      // Arrange
      const mockOrders = [mockOrder];
      orderRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await service.getAllOrders({ search: 'John' });

      // Assert
      expect(orderRepository.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { customerName: { [Op.iLike]: '%John%' } },
            { referenceNumber: { [Op.iLike]: '%John%' } },
          ],
        },
      });
      expect(result).toBe(mockOrders);
    });

    it('should filter orders by date range', async () => {
      // Arrange
      const mockOrders = [mockOrder];
      orderRepository.findAll.mockResolvedValue(mockOrders);
      const fromDate = '2024-01-01';
      const toDate = '2024-12-31';

      // Act
      const result = await service.getAllOrders({ fromDate, toDate });

      // Assert
      expect(orderRepository.findAll).toHaveBeenCalledWith({
        where: {
          createdAt: {
            [Op.between]: [new Date(fromDate), new Date(toDate)],
          },
        },
      });
      expect(result).toBe(mockOrders);
    });

    it('should apply multiple filters', async () => {
      // Arrange
      const mockOrders = [mockOrder];
      orderRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await service.getAllOrders({
        status: 'pending',
        search: 'John',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      });

      // Assert
      expect(orderRepository.findAll).toHaveBeenCalledWith({
        where: {
          status: 'pending',
          [Op.or]: [
            { customerName: { [Op.iLike]: '%John%' } },
            { referenceNumber: { [Op.iLike]: '%John%' } },
          ],
          createdAt: {
            [Op.between]: [new Date('2024-01-01'), new Date('2024-12-31')],
          },
        },
      });
      expect(result).toBe(mockOrders);
    });
  });

  describe('updateOrder', () => {
    const mockUpdateDto: UpdateOrderDto = {
      status: ORDER_STATUS.DELIVERED,
    };

    it('should update order and send email for status change', async () => {
      // Arrange
      orderRepository.findByPk.mockResolvedValue(mockOrder);
      userRepository.findByPk.mockResolvedValue(mockUser);
      mockOrder.update.mockResolvedValue({ ...mockOrder, ...mockUpdateDto });
      mailService.sendOrderUpdateEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.updateOrder('order-123', mockUpdateDto);

      // Assert
      expect(orderRepository.findByPk).toHaveBeenCalledWith('order-123');
      expect(mockOrder.update).toHaveBeenCalledWith(mockUpdateDto);
      expect(mailService.sendOrderUpdateEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        mockOrder.id,
        ORDER_STATUS.PENDING,
        ORDER_STATUS.DELIVERED,
        mockOrder.totalAmount,
      );
      expect(result).toBeDefined();
    });

    it('should update order and skip email when user not found', async () => {
      // Arrange
      orderRepository.findByPk.mockResolvedValue(mockOrder);
      userRepository.findByPk.mockResolvedValue(null);
      mockOrder.update.mockResolvedValue({ ...mockOrder, ...mockUpdateDto });

      // Act
      const result = await service.updateOrder('order-123', mockUpdateDto);

      // Assert
      expect(mockOrder.update).toHaveBeenCalledWith(mockUpdateDto);
      expect(mailService.sendOrderUpdateEmail).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should update order without sending email when status unchanged', async () => {
      // Arrange
      const updateDto = { deliveryAddress: 'New Address' };
      orderRepository.findByPk.mockResolvedValue(mockOrder);
      mockOrder.update.mockResolvedValue({ ...mockOrder, ...updateDto });

      // Act
      const result = await service.updateOrder('order-123', updateDto);

      // Assert
      expect(mockOrder.update).toHaveBeenCalledWith(updateDto);
      expect(mailService.sendOrderUpdateEmail).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      orderRepository.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateOrder('invalid-order', mockUpdateDto),
      ).rejects.toThrow(
        new NotFoundException('Order with id invalid-order not found'),
      );

      expect(mockOrder.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      // Arrange
      orderRepository.findByPk.mockResolvedValue(mockOrder);
      mockOrder.destroy.mockResolvedValue(undefined);

      // Act
      await service.deleteOrder('order-123');

      // Assert
      expect(orderRepository.findByPk).toHaveBeenCalledWith('order-123');
      expect(mockOrder.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      orderRepository.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteOrder('invalid-order')).rejects.toThrow(
        new NotFoundException('Order with id invalid-order not found'),
      );

      expect(mockOrder.destroy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Additional Scenarios', () => {
    it('should handle multiple products in createOrder', async () => {
      // Arrange
      const multipleProducts = [
        { productId: 'product-123', quantity: 2 },
        { productId: 'product-456', quantity: 1 },
      ];
      const mockProduct2 = {
        ...mockProduct,
        id: 'product-456',
        price: 30000,
        update: jest.fn().mockResolvedValue(undefined),
      };

      productRepository.findByPk.mockImplementation((id) => {
        if (id === 'product-123') return Promise.resolve(mockProduct);
        if (id === 'product-456') return Promise.resolve(mockProduct2);
        return Promise.resolve(null);
      });
      userRepository.findByPk.mockResolvedValue(mockUser);
      orderRepository.create.mockResolvedValue(mockOrder);
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment);
      mailService.sendOrderCreationEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.createOrder(
        'user-123',
        multipleProducts,
        '123 Farm Lane, Lagos, Nigeria',
      );

      // Assert
      expect(productRepository.findByPk).toHaveBeenCalledTimes(4); // 2 for stock deduction + 2 for calculateTotal
      expect(mockProduct.update).toHaveBeenCalledWith({ stock: 8 }); // 10 - 2
      expect(mockProduct2.update).toHaveBeenCalledWith({ stock: 9 }); // 10 - 1
      expect(orderRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        products: multipleProducts,
        totalAmount: 120000, // (45000 * 2) + (30000 * 1)
        deliveryAddress: '123 Farm Lane, Lagos, Nigeria',
        status: 'pending',
      });
    });

    it('should handle zero quantity in createOrder', async () => {
      // Arrange
      const zeroQuantityProducts = [{ productId: 'product-123', quantity: 0 }];
      productRepository.findByPk.mockResolvedValue(mockProduct);
      userRepository.findByPk.mockResolvedValue(mockUser);
      orderRepository.create.mockResolvedValue(mockOrder);
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment);
      mailService.sendOrderCreationEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.createOrder(
        'user-123',
        zeroQuantityProducts,
        '123 Farm Lane, Lagos, Nigeria',
      );

      // Assert - should not deduct any stock (10 - 0 = 10)
      expect(mockProduct.update).toHaveBeenCalledWith({ stock: 10 });
      expect(orderRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        products: zeroQuantityProducts,
        totalAmount: 0, // 45000 * 0
        deliveryAddress: '123 Farm Lane, Lagos, Nigeria',
        status: 'pending',
      });
      expect(result).toBeDefined();
    });

    it('should handle email service failures gracefully', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(mockProduct);
      userRepository.findByPk.mockResolvedValue(mockUser);
      orderRepository.create.mockResolvedValue(mockOrder);
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment);
      mailService.sendOrderCreationEmail.mockRejectedValue(
        new Error('Email service down'),
      );

      // Act & Assert - should not throw, email failure shouldn't break order creation
      await expect(
        service.createOrder(
          'user-123',
          [{ productId: 'product-123', quantity: 1 }],
          '123 Farm Lane, Lagos, Nigeria',
        ),
      ).rejects.toThrow('Email service down');
    });

    it('should handle payment service failures', async () => {
      // Arrange
      productRepository.findByPk.mockResolvedValue(mockProduct);
      userRepository.findByPk.mockResolvedValue(mockUser);
      orderRepository.create.mockResolvedValue(mockOrder);
      mailService.sendOrderCreationEmail.mockResolvedValue(undefined);
      paymentService.initializePayment.mockRejectedValue(
        new Error('Payment service down'),
      );

      // Act & Assert
      await expect(
        service.createOrder(
          'user-123',
          [{ productId: 'product-123', quantity: 1 }],
          '123 Farm Lane, Lagos, Nigeria',
        ),
      ).rejects.toThrow('Payment service down');
    });

    it('should handle cart conversion errors', async () => {
      // Arrange
      cartService.convertCartToOrder.mockRejectedValue(
        new BadRequestException('Cart is empty or not found'),
      );

      // Act & Assert
      await expect(
        service.createOrderFromCart(
          'user-123',
          '123 Farm Lane, Lagos, Nigeria',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
