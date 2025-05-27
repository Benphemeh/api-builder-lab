import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { MailService } from 'src/core/mail/mail.service';
import { PaymentService } from '../payment/payment.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import { ORDER_STATUS } from 'src/core/enums';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let productRepository: jest.Mocked<any>;
  let orderRepository: jest.Mocked<any>;
  let userRepository: jest.Mocked<any>;
  let deliveryRepository: jest.Mocked<any>;
  let couponRepository: jest.Mocked<any>;
  let mailService: jest.Mocked<MailService>;
  let paymentService: jest.Mocked<PaymentService>;

  const mockProduct = {
    id: 'product-123',
    name: 'Medium Size Pig',
    price: 45000,
    stock: 10,
    update: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'customer@onimu-elede.com',
    firstName: 'Adebayo',
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
  };

  const mockPayment = {
    id: 'payment-123',
    orderId: 'order-123',
    reference: 'paystack_ref_123',
    status: 'pending',
    amount: 45000,
    createdAt: new Date(),
    updatedAt: new Date(),
    $add: jest.fn(),
    $set: jest.fn(),
    $get: jest.fn(),
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

    // Mock the createPayment method here
    paymentService.createPayment.mockResolvedValue(mockPayment as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
});
