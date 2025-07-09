import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PaymentService } from './payment.service';
import { MailService } from 'src/core/mail/mail.service';
import { REPOSITORY } from 'src/core/constants';
import { PAYMENT_STATUS, ORDER_STATUS } from 'src/core/enums';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaymentService', () => {
  let service: PaymentService;
  let mockPaymentRepository: any;
  let mockOrderRepository: any;
  let mockMailService: any;

  const mockPayment = {
    id: 'payment-123',
    orderId: 'order-123',
    reference: 'ref-123',
    status: 'pending', // Use string literal instead of enum
    amount: 1000,
    update: jest.fn(),
    save: jest.fn(),
  };

  const mockOrder = {
    id: 'order-123',
    userId: 'user-123',
    totalAmount: 1000,
    status: 'pending', // Use string literal instead of enum
    deliveryAddress: '123 Test St',
    products: [{ productId: 'prod-1', quantity: 2 }],
    user: {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
    update: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock repositories
    mockPaymentRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };

    mockOrderRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };

    // Mock mail service
    mockMailService = {
      sendOrderPaymentEmail: jest.fn(),
      sendUserConfirmation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: REPOSITORY.PAYMENT,
          useValue: mockPaymentRepository,
        },
        {
          provide: REPOSITORY.ORDER,
          useValue: mockOrderRepository,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);

    // Set up environment variables
    process.env.PAYSTACK_SECRET_KEY = 'test-secret-key';
  });

  describe('initializePayment', () => {
    const mockPaystackResponse = {
      data: {
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: 'https://checkout.paystack.com/test-url',
          access_code: 'test-access-code',
          reference: 'test-reference',
        },
      },
    };

    it('should successfully initialize payment', async () => {
      mockedAxios.post.mockResolvedValue(mockPaystackResponse);

      const result = await service.initializePayment(
        'test@example.com',
        1000,
        'order-123',
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        {
          email: 'test@example.com',
          amount: 100000, // 1000 * 100
          metadata: { orderId: 'order-123' },
        },
        {
          headers: {
            Authorization: 'Bearer test-secret-key',
          },
        },
      );

      expect(result).toEqual(mockPaystackResponse.data);
    });

    it('should throw HttpException when Paystack API returns error', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Invalid email address',
          },
        },
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(
        service.initializePayment('invalid-email', 1000, 'order-123'),
      ).rejects.toThrow(
        new HttpException('Invalid email address', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw HttpException with default message when no specific error message', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(
        service.initializePayment('test@example.com', 1000, 'order-123'),
      ).rejects.toThrow(
        new HttpException(
          'Payment initialization failed',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle zero amount', async () => {
      mockedAxios.post.mockResolvedValue(mockPaystackResponse);

      await service.initializePayment('test@example.com', 0, 'order-123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        {
          email: 'test@example.com',
          amount: 0,
          metadata: { orderId: 'order-123' },
        },
        {
          headers: {
            Authorization: 'Bearer test-secret-key',
          },
        },
      );
    });

    it('should handle very large amounts', async () => {
      mockedAxios.post.mockResolvedValue(mockPaystackResponse);

      await service.initializePayment('test@example.com', 999999, 'order-123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        {
          email: 'test@example.com',
          amount: 99999900,
          metadata: { orderId: 'order-123' },
        },
        {
          headers: {
            Authorization: 'Bearer test-secret-key',
          },
        },
      );
    });
  });

  describe('verifyPayment', () => {
    const mockVerificationResponse = {
      data: {
        status: true,
        message: 'Verification successful',
        data: {
          reference: 'test-reference',
          amount: 100000,
          status: 'success',
          paid_at: '2023-01-01T00:00:00.000Z',
        },
      },
    };

    it('should successfully verify payment', async () => {
      mockedAxios.get.mockResolvedValue(mockVerificationResponse);

      const result = await service.verifyPayment('test-reference');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/verify/test-reference',
        {
          headers: {
            Authorization: 'Bearer test-secret-key',
          },
        },
      );

      expect(result).toEqual(mockVerificationResponse.data);
    });

    it('should throw HttpException when verification fails', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Transaction not found',
          },
        },
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(service.verifyPayment('invalid-reference')).rejects.toThrow(
        new HttpException('Transaction not found', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw HttpException with default message when no specific error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(service.verifyPayment('test-reference')).rejects.toThrow(
        new HttpException(
          'Payment verification failed',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle empty reference', async () => {
      mockedAxios.get.mockResolvedValue(mockVerificationResponse);

      await service.verifyPayment('');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/verify/',
        {
          headers: {
            Authorization: 'Bearer test-secret-key',
          },
        },
      );
    });
  });

  describe('createPayment', () => {
    it('should successfully create payment', async () => {
      const paymentData = {
        orderId: 'order-123',
        reference: 'ref-123',
        status: 'pending' as const,
        amount: 1000,
      };

      mockPaymentRepository.create.mockResolvedValue(mockPayment);

      const result = await service.createPayment(paymentData);

      expect(mockPaymentRepository.create).toHaveBeenCalledWith(paymentData);
      expect(result).toEqual(mockPayment);
    });

    it('should handle database errors during creation', async () => {
      const paymentData = {
        orderId: 'order-123',
        reference: 'ref-123',
        status: 'pending' as const,
        amount: 1000,
      };

      mockPaymentRepository.create.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.createPayment(paymentData)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should create payment with success status', async () => {
      const paymentData = {
        orderId: 'order-123',
        reference: 'ref-123',
        status: 'success' as const,
        amount: 1000,
      };

      mockPaymentRepository.create.mockResolvedValue({
        ...mockPayment,
        status: 'success',
      });

      const result = await service.createPayment(paymentData);

      expect(mockPaymentRepository.create).toHaveBeenCalledWith(paymentData);
      expect(result.status).toBe('success');
    });

    it('should create payment with failed status', async () => {
      const paymentData = {
        orderId: 'order-123',
        reference: 'ref-123',
        status: 'failed' as const,
        amount: 1000,
      };

      mockPaymentRepository.create.mockResolvedValue({
        ...mockPayment,
        status: 'failed',
      });

      const result = await service.createPayment(paymentData);

      expect(mockPaymentRepository.create).toHaveBeenCalledWith(paymentData);
      expect(result.status).toBe('failed');
    });
  });

  describe('updatePayment', () => {
    beforeEach(() => {
      mockPayment.update.mockResolvedValue(mockPayment);
      mockOrder.update.mockResolvedValue(mockOrder);
    });

    it('should successfully update payment to success and trigger email', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(mockOrder);

      const result = await service.updatePayment('ref-123', 'success');

      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({
        where: { reference: 'ref-123' },
      });
      expect(mockPayment.update).toHaveBeenCalledWith({ status: 'success' });
      expect(mockOrderRepository.findByPk).toHaveBeenCalledWith('order-123', {
        include: ['user'],
      });
      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'success' });
      expect(mockMailService.sendOrderPaymentEmail).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        'order-123',
        1000,
        'ref-123',
      );
      expect(result).toEqual(mockPayment);
    });

    it('should successfully update payment to failed without sending email', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.updatePayment('ref-123', 'failed');

      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({
        where: { reference: 'ref-123' },
      });
      expect(mockPayment.update).toHaveBeenCalledWith({ status: 'failed' });
      expect(mockOrderRepository.findByPk).not.toHaveBeenCalled();
      expect(mockMailService.sendOrderPaymentEmail).not.toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should throw error when payment not found', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePayment('invalid-ref', 'success'),
      ).rejects.toThrow('Payment with reference invalid-ref not found');

      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({
        where: { reference: 'invalid-ref' },
      });
      expect(mockPayment.update).not.toHaveBeenCalled();
    });

    it('should handle case where order is not found during success update', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(null);

      const result = await service.updatePayment('ref-123', 'success');

      expect(mockPayment.update).toHaveBeenCalledWith({ status: 'success' });
      expect(mockOrderRepository.findByPk).toHaveBeenCalledWith('order-123', {
        include: ['user'],
      });
      expect(mockMailService.sendOrderPaymentEmail).not.toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should handle case where user firstName is null', async () => {
      const orderWithoutFirstName = {
        ...mockOrder,
        user: { ...mockOrder.user, firstName: null },
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(orderWithoutFirstName);

      await service.updatePayment('ref-123', 'success');

      expect(mockMailService.sendOrderPaymentEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Customer',
        'order-123',
        1000,
        'ref-123',
      );
    });

    it('should handle database errors during payment update', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockPayment.update.mockRejectedValue(new Error('Database update failed'));

      await expect(service.updatePayment('ref-123', 'success')).rejects.toThrow(
        'Database update failed',
      );
    });

    it('should handle email service errors', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(mockOrder);
      mockMailService.sendOrderPaymentEmail.mockRejectedValue(
        new Error('Email service failed'),
      );

      await expect(service.updatePayment('ref-123', 'success')).rejects.toThrow(
        'Email service failed',
      );
    });
  });

  describe('handleWebhook', () => {
    const mockWebhookData = {
      event: 'charge.success',
      data: {
        reference: 'ref-123',
        status: 'success',
        amount: 100000, // Amount in kobo
      },
    };

    beforeEach(() => {
      mockPayment.update.mockResolvedValue(mockPayment);
      mockOrder.update.mockResolvedValue(mockOrder);
    });

    it('should successfully handle charge.success webhook', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(mockOrder);

      await service.handleWebhook(mockWebhookData);

      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({
        where: { reference: 'ref-123' },
      });
      expect(mockPayment.update).toHaveBeenCalledWith({ status: 'success' });
      expect(mockOrderRepository.findByPk).toHaveBeenCalledWith('order-123', {
        include: ['user'],
      });
      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'success' });
      expect(mockMailService.sendOrderPaymentEmail).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        'order-123',
        1000, // Amount converted from kobo to naira
        'ref-123',
      );
    });

    it('should throw HttpException when payment not found', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(service.handleWebhook(mockWebhookData)).rejects.toThrow(
        new HttpException(
          'Payment with reference ref-123 not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw HttpException when order not found', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(null);

      await expect(service.handleWebhook(mockWebhookData)).rejects.toThrow(
        new HttpException(
          'Order with id order-123 not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should ignore unhandled event types', async () => {
      const unhandledEvent = {
        event: 'charge.failed',
        data: {
          reference: 'ref-123',
          status: 'failed',
          amount: 100000,
        },
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.handleWebhook(unhandledEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Unhandled event type: charge.failed',
      );
      expect(mockPaymentRepository.findOne).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle webhook with zero amount', async () => {
      const zeroAmountWebhook = {
        event: 'charge.success',
        data: {
          reference: 'ref-123',
          status: 'success',
          amount: 0,
        },
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(mockOrder);

      await service.handleWebhook(zeroAmountWebhook);

      expect(mockMailService.sendOrderPaymentEmail).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        'order-123',
        0,
        'ref-123',
      );
    });

    it('should handle webhook with missing data fields', async () => {
      const incompleteWebhook = {
        event: 'charge.success',
        data: {
          reference: 'ref-123',
          // Missing status and amount
        },
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(mockOrder);

      await service.handleWebhook(incompleteWebhook);

      expect(mockPayment.update).toHaveBeenCalledWith({ status: undefined });
      expect(mockMailService.sendOrderPaymentEmail).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        'order-123',
        NaN, // undefined amount / 100
        'ref-123',
      );
    });

    it('should handle webhook with null/undefined body', async () => {
      await expect(service.handleWebhook(null)).rejects.toThrow();
      await expect(service.handleWebhook(undefined)).rejects.toThrow();
    });

    it('should handle webhook with missing event field', async () => {
      const malformedWebhook = {
        data: {
          reference: 'ref-123',
          status: 'success',
          amount: 100000,
        },
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.handleWebhook(malformedWebhook);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Unhandled event type: undefined',
      );
      expect(mockPaymentRepository.findOne).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle database errors during webhook processing', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockPayment.update.mockRejectedValue(new Error('Database error'));

      await expect(service.handleWebhook(mockWebhookData)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle email service errors during webhook processing', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(mockOrder);
      mockMailService.sendOrderPaymentEmail.mockRejectedValue(
        new Error('Email service error'),
      );

      await expect(service.handleWebhook(mockWebhookData)).rejects.toThrow(
        'Email service error',
      );
    });

    it('should handle webhook with very large amount', async () => {
      const largeAmountWebhook = {
        event: 'charge.success',
        data: {
          reference: 'ref-123',
          status: 'success',
          amount: 999999999999, // Very large amount in kobo
        },
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(mockOrder);

      await service.handleWebhook(largeAmountWebhook);

      expect(mockMailService.sendOrderPaymentEmail).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        'order-123',
        9999999999.99, // Converted from kobo to naira
        'ref-123',
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing environment variables', async () => {
      delete process.env.PAYSTACK_SECRET_KEY;

      mockedAxios.post.mockResolvedValue({ data: {} });

      await service.initializePayment('test@example.com', 1000, 'order-123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        expect.any(Object),
        {
          headers: {
            Authorization: 'Bearer undefined',
          },
        },
      );
    });

    it('should handle concurrent payment updates', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockOrderRepository.findByPk.mockResolvedValue(mockOrder);

      const promises = [
        service.updatePayment('ref-123', 'success'),
        service.updatePayment('ref-123', 'failed'),
      ];

      await Promise.all(promises);

      expect(mockPaymentRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockPayment.update).toHaveBeenCalledTimes(2);
    });

    it('should handle malformed webhook payloads', async () => {
      const malformedPayloads = [
        { event: 'charge.success' }, // Missing data
        { data: { reference: 'ref-123' } }, // Missing event
        'invalid-json', // Invalid type
        { event: 'charge.success', data: null }, // Null data
      ];

      for (const payload of malformedPayloads) {
        try {
          await service.handleWebhook(payload);
        } catch (error) {
          // Expected for some malformed payloads
        }
      }
    });
  });
});
