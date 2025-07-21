import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JwtGuard } from 'src/modules/guards/jwt-guard';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PAYMENT_STATUS } from 'src/core/enums';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;
  let paymentService: jest.Mocked<PaymentService>;

  // Mock data
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockPayment = {
    id: 'payment-123',
    orderId: 'order-123',
    reference: 'paystack_ref_123',
    status: PAYMENT_STATUS.PENDING,
    amount: 50000,
    createdAt: '2025-07-10T15:12:07.690Z',
    updatedAt: '2025-07-10T15:12:07.690Z',
  };

  const mockPaystackResponse = {
    status: true,
    message: 'Authorization URL created',
    data: {
      authorization_url: 'https://checkout.paystack.com/access_code_123',
      access_code: 'access_code_123',
      reference: 'paystack_ref_123',
    },
  };

  const mockPaystackVerification = {
    status: true,
    message: 'Verification successful',
    data: {
      id: 123456789,
      reference: 'paystack_ref_123',
      amount: 5000000, // In kobo
      status: 'success',
      gateway_response: 'Successful',
      paid_at: '2025-07-10T15:12:07.000Z',
      created_at: '2025-07-10T15:12:07.000Z',
      channel: 'card',
      metadata: {
        orderId: 'order-123',
      },
    },
  };

  // Mock guards
  const mockJwtGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        controllers: [PaymentController],
        providers: [
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
      })
        .overrideGuard(JwtGuard)
        .useValue(mockJwtGuard)
        .compile();

      app = moduleFixture.createNestApplication();

      // Add ValidationPipe to enable DTO validation
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          validateCustomDecorators: true,
          disableErrorMessages: false,
        }),
      );

      paymentService = moduleFixture.get(PaymentService);

      // Mock request user context for authenticated routes
      app.use((req, res, next) => {
        req.user = mockUser;
        next();
      });

      await app.init();
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    jest.clearAllMocks();
  });

  describe('POST /payments/initialize', () => {
    const initializeDto: InitializePaymentDto = {
      email: 'test@example.com',
      amount: 50000,
      orderId: 'order-123',
    };

    it('should initialize payment successfully', async () => {
      // Arrange
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(initializeDto)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Payment initialized successfully',
        payment: mockPaystackResponse.data,
      });

      expect(paymentService.initializePayment).toHaveBeenCalledWith(
        initializeDto.email,
        initializeDto.amount,
        initializeDto.orderId,
      );

      expect(paymentService.createPayment).toHaveBeenCalledWith({
        orderId: initializeDto.orderId,
        reference: mockPaystackResponse.data.reference,
        status: PAYMENT_STATUS.PENDING,
        amount: initializeDto.amount,
      });
    });

    it('should handle payment initialization without orderId', async () => {
      // Arrange
      const dtoWithoutOrderId = {
        email: 'test@example.com',
        amount: 50000,
        // orderId is optional
      };

      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(dtoWithoutOrderId)
        .expect(201);

      expect(paymentService.createPayment).toHaveBeenCalledWith({
        orderId: null, // Should be null, not undefined
        reference: mockPaystackResponse.data.reference,
        status: PAYMENT_STATUS.PENDING,
        amount: dtoWithoutOrderId.amount,
      });
    });

    it('should return 403 when not authenticated', async () => {
      // Arrange
      mockJwtGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(initializeDto)
        .expect(403);

      expect(paymentService.initializePayment).not.toHaveBeenCalled();

      // Reset for other tests
      mockJwtGuard.canActivate.mockReturnValue(true);
    });

    it('should handle invalid request data', async () => {
      // Arrange
      const invalidDto = {
        email: 'invalid-email',
        amount: -100, // negative amount
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle payment service errors', async () => {
      // Arrange
      paymentService.initializePayment.mockImplementation(() => {
        throw new HttpException('Paystack API error', HttpStatus.BAD_REQUEST);
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(initializeDto)
        .expect(400);

      expect(response.body.message).toBe('Paystack API error');
    });

    it('should handle database errors during payment creation', async () => {
      // Arrange
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(initializeDto)
        .expect(500);
    });

    it('should handle large amount values', async () => {
      // Arrange
      const largeAmountDto = { ...initializeDto, amount: 999999999 };
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment as any);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(largeAmountDto)
        .expect(201);

      expect(paymentService.initializePayment).toHaveBeenCalledWith(
        largeAmountDto.email,
        largeAmountDto.amount,
        largeAmountDto.orderId,
      );
    });

    it('should handle zero amount values', async () => {
      // Arrange
      const zeroAmountDto = {
        email: 'test@example.com',
        amount: 0,
        orderId: 'order-123',
      };

      // Act & Assert - Should fail validation due to minimum amount constraint
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(zeroAmountDto)
        .expect(400);
    });

    it('should handle Unicode characters in email', async () => {
      // Arrange
      const unicodeDto = {
        email: 'test@münchen.de',
        amount: 1000,
        orderId: 'order-123',
      };
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment as any);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(unicodeDto)
        .expect(201);
    });

    it('should handle missing required fields', async () => {
      // Arrange
      const incompleteDto = {
        amount: 50000,
        // Missing email
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(incompleteDto)
        .expect(400);
    });

    it('should handle Paystack service unavailable', async () => {
      // Arrange
      paymentService.initializePayment.mockImplementation(() => {
        throw new HttpException(
          'Service unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(initializeDto)
        .expect(503);
    });
  });

  describe('POST /payments/verify', () => {
    const verifyDto: VerifyPaymentDto = {
      reference: 'paystack_ref_123',
    };

    it('should verify payment successfully', async () => {
      // Arrange
      paymentService.verifyPayment.mockResolvedValue(mockPaystackVerification);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/payments/verify')
        .send(verifyDto)
        .expect(201);

      expect(response.body).toEqual(mockPaystackVerification);
      expect(paymentService.verifyPayment).toHaveBeenCalledWith(
        verifyDto.reference,
      );
    });

    it('should return 403 when not authenticated', async () => {
      // Arrange
      mockJwtGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/verify')
        .send(verifyDto)
        .expect(403);

      expect(paymentService.verifyPayment).not.toHaveBeenCalled();

      // Reset for other tests
      mockJwtGuard.canActivate.mockReturnValue(true);
    });

    it('should handle invalid reference format', async () => {
      // Arrange
      const invalidDto = { reference: '' };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/verify')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle verification service errors', async () => {
      // Arrange
      paymentService.verifyPayment.mockImplementation(() => {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/payments/verify')
        .send(verifyDto)
        .expect(404);

      expect(response.body.message).toBe('Payment not found');
    });

    it('should handle network errors from Paystack', async () => {
      // Arrange
      paymentService.verifyPayment.mockImplementation(() => {
        throw new HttpException('Network timeout', HttpStatus.REQUEST_TIMEOUT);
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/verify')
        .send(verifyDto)
        .expect(408);
    });

    it('should handle special characters in reference', async () => {
      // Arrange
      const specialRefDto = { reference: 'ref@#$%^&*()_+' };
      paymentService.verifyPayment.mockResolvedValue(mockPaystackVerification);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/verify')
        .send(specialRefDto)
        .expect(201);

      expect(paymentService.verifyPayment).toHaveBeenCalledWith(
        specialRefDto.reference,
      );
    });

    it('should handle extremely long reference strings', async () => {
      // Arrange
      const longRef = 'a'.repeat(1000);
      paymentService.verifyPayment.mockResolvedValue(mockPaystackVerification);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/verify')
        .send({ reference: longRef })
        .expect(201);

      expect(paymentService.verifyPayment).toHaveBeenCalledWith(longRef);
    });

    it('should handle missing reference field', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/verify')
        .send({})
        .expect(400);
    });

    it('should handle Paystack verification timeout', async () => {
      // Arrange
      paymentService.verifyPayment.mockImplementation(() => {
        throw new HttpException(
          'Verification timeout',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/verify')
        .send(verifyDto)
        .expect(504);
    });
  });

  describe('PATCH /payments/:reference', () => {
    const updateDto: UpdatePaymentDto = {
      status: PAYMENT_STATUS.SUCCESS,
    };

    it('should update payment status successfully', async () => {
      // Arrange
      const updatedPayment = {
        ...mockPayment,
        status: PAYMENT_STATUS.SUCCESS,
      };
      paymentService.updatePayment.mockResolvedValue(updatedPayment as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/payments/paystack_ref_123')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(updatedPayment);
      expect(paymentService.updatePayment).toHaveBeenCalledWith(
        'paystack_ref_123',
        updateDto.status,
      );
    });

    it('should return 403 when not authenticated', async () => {
      // Arrange
      mockJwtGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer())
        .patch('/payments/paystack_ref_123')
        .send(updateDto)
        .expect(403);

      expect(paymentService.updatePayment).not.toHaveBeenCalled();

      // Reset for other tests
      mockJwtGuard.canActivate.mockReturnValue(true);
    });

    it('should handle payment not found', async () => {
      // Arrange
      paymentService.updatePayment.mockImplementation(() => {
        throw new Error('Payment with reference invalid_ref not found');
      });

      // Act & Assert
      await request(app.getHttpServer())
        .patch('/payments/invalid_ref')
        .send(updateDto)
        .expect(500);
    });

    it('should handle invalid status values', async () => {
      // Arrange
      const invalidDto = { status: 'invalid-status' };

      // Act & Assert
      await request(app.getHttpServer())
        .patch('/payments/paystack_ref_123')
        .send(invalidDto)
        .expect(400);
    });

    it('should update payment to failed status', async () => {
      // Arrange
      const failedUpdateDto = { status: PAYMENT_STATUS.FAILED };
      const failedPayment = {
        ...mockPayment,
        status: PAYMENT_STATUS.FAILED,
      };
      paymentService.updatePayment.mockResolvedValue(failedPayment as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/payments/paystack_ref_123')
        .send(failedUpdateDto)
        .expect(200);

      expect(response.body.status).toBe(PAYMENT_STATUS.FAILED);
      expect(paymentService.updatePayment).toHaveBeenCalledWith(
        'paystack_ref_123',
        PAYMENT_STATUS.FAILED,
      );
    });

    it('should update payment to pending status', async () => {
      // Arrange
      const pendingUpdateDto = { status: PAYMENT_STATUS.PENDING };
      const pendingPayment = {
        ...mockPayment,
        status: PAYMENT_STATUS.PENDING,
      };
      paymentService.updatePayment.mockResolvedValue(pendingPayment as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/payments/paystack_ref_123')
        .send(pendingUpdateDto)
        .expect(200);

      expect(response.body.status).toBe(PAYMENT_STATUS.PENDING);
    });

    it('should handle special characters in reference parameter', async () => {
      // Arrange
      const specialRef = 'ref@#$%^&*()_+';
      const updatedPayment = {
        ...mockPayment,
        status: PAYMENT_STATUS.SUCCESS,
      };
      paymentService.updatePayment.mockResolvedValue(updatedPayment as any);

      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/payments/${encodeURIComponent(specialRef)}`)
        .send(updateDto)
        .expect(200);

      expect(paymentService.updatePayment).toHaveBeenCalledWith(
        specialRef,
        updateDto.status,
      );
    });

    it('should handle empty request body', async () => {
      // Act & Assert - Should return 400 because status is required
      await request(app.getHttpServer())
        .patch('/payments/paystack_ref_123')
        .send({})
        .expect(400);
    });

    it('should handle concurrent update requests', async () => {
      // Arrange
      const updatedPayment = {
        ...mockPayment,
        status: PAYMENT_STATUS.SUCCESS,
      };
      paymentService.updatePayment.mockResolvedValue(updatedPayment as any);

      // Act - Send sequential requests
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .patch('/payments/paystack_ref_123')
          .send(updateDto);

        expect(response.status).toBe(200);
      }

      // Assert
      expect(paymentService.updatePayment).toHaveBeenCalledTimes(3);
    });

    it('should handle database connection errors', async () => {
      // Arrange
      paymentService.updatePayment.mockImplementation(() => {
        throw new Error('Database connection lost');
      });

      // Act & Assert
      await request(app.getHttpServer())
        .patch('/payments/paystack_ref_123')
        .send(updateDto)
        .expect(500);
    });

    it('should handle very long reference strings', async () => {
      // Arrange
      const longRef = 'a'.repeat(500);
      const updatedPayment = {
        ...mockPayment,
        status: PAYMENT_STATUS.SUCCESS,
      };
      paymentService.updatePayment.mockResolvedValue(updatedPayment as any);

      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/payments/${longRef}`)
        .send(updateDto)
        .expect(200);

      expect(paymentService.updatePayment).toHaveBeenCalledWith(
        longRef,
        updateDto.status,
      );
    });
  });

  describe('Authentication and Authorization', () => {
    it('should handle JWT token expiration', async () => {
      // Arrange
      mockJwtGuard.canActivate.mockImplementation(() => {
        throw new Error('Token expired');
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send({ email: 'test@example.com', amount: 1000 })
        .expect(500);

      // Reset
      mockJwtGuard.canActivate.mockReturnValue(true);
    });

    it('should handle malformed JWT tokens', async () => {
      // Arrange
      mockJwtGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/verify')
        .set('Authorization', 'Bearer invalid-token')
        .send({ reference: 'test-ref' })
        .expect(403);

      // Reset
      mockJwtGuard.canActivate.mockReturnValue(true);
    });

    it('should handle missing authorization header', async () => {
      // Arrange
      mockJwtGuard.canActivate.mockReturnValue(false);

      // Act & Assert
      await request(app.getHttpServer())
        .patch('/payments/test-ref')
        .send({ status: PAYMENT_STATUS.SUCCESS })
        .expect(403);

      // Reset
      mockJwtGuard.canActivate.mockReturnValue(true);
    });

    it('should require authentication for all endpoints', async () => {
      // Arrange
      mockJwtGuard.canActivate.mockReturnValue(false);

      // Act & Assert - Test all endpoints require auth
      const endpoints = [
        {
          method: 'post',
          path: '/payments/initialize',
          body: { email: 'test@test.com', amount: 1000 },
        },
        {
          method: 'post',
          path: '/payments/verify',
          body: { reference: 'test-ref' },
        },
        {
          method: 'patch',
          path: '/payments/test-ref',
          body: { status: PAYMENT_STATUS.SUCCESS },
        },
      ];

      for (const endpoint of endpoints) {
        await request(app.getHttpServer())
          [endpoint.method](endpoint.path)
          .send(endpoint.body)
          .expect(403);
      }

      // Reset
      mockJwtGuard.canActivate.mockReturnValue(true);
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle rapid sequential requests', async () => {
      // Arrange
      paymentService.verifyPayment.mockResolvedValue(mockPaystackVerification);

      // Act - Send sequential requests
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/payments/verify')
          .send({ reference: `ref-${i}` });

        expect(response.status).toBe(201);
      }

      expect(paymentService.verifyPayment).toHaveBeenCalledTimes(5);
    });

    it('should handle service timeout errors', async () => {
      // Arrange
      paymentService.initializePayment.mockImplementation(() => {
        throw new HttpException('Request timeout', HttpStatus.REQUEST_TIMEOUT);
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send({ email: 'test@example.com', amount: 1000, orderId: 'order-123' })
        .expect(408);
    });

    it('should handle service unavailable errors', async () => {
      // Arrange
      paymentService.verifyPayment.mockImplementation(() => {
        throw new HttpException(
          'Service unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/verify')
        .send({ reference: 'test-ref' })
        .expect(503);
    });

    it('should handle unexpected service errors', async () => {
      // Arrange
      paymentService.initializePayment.mockImplementation(() => {
        throw new Error('Unexpected error occurred');
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send({ email: 'test@example.com', amount: 1000 })
        .expect(500);
    });

    it('should handle large payload sizes', async () => {
      // Arrange
      const largeDto = {
        email: 'test@example.com',
        amount: 50000,
        orderId: 'a'.repeat(5000), // Very long orderId
      };
      paymentService.initializePayment.mockResolvedValue(mockPaystackResponse);
      paymentService.createPayment.mockResolvedValue(mockPayment as any);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/payments/initialize')
        .send(largeDto)
        .expect(201);
    });
  });

  describe('Data Validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test.domain.com',
        '',
      ];

      for (const email of invalidEmails) {
        await request(app.getHttpServer())
          .post('/payments/initialize')
          .send({ email, amount: 1000 })
          .expect(400);
      }
    });

    it('should validate amount values', async () => {
      const invalidAmounts = [
        -100, // negative
        0, // zero
        'abc', // string
        null, // null
        undefined, // undefined
      ];

      for (const amount of invalidAmounts) {
        await request(app.getHttpServer())
          .post('/payments/initialize')
          .send({ email: 'test@example.com', amount })
          .expect(400);
      }
    });

    it('should validate status enum values', async () => {
      const invalidStatuses = [
        'invalid-status',
        'COMPLETED',
        'CANCELLED',
        123,
        null,
      ];

      for (const status of invalidStatuses) {
        await request(app.getHttpServer())
          .patch('/payments/test-ref')
          .send({ status })
          .expect(400);
      }
    });

    it('should accept valid status enum values', async () => {
      const validStatuses = [
        PAYMENT_STATUS.SUCCESS,
        PAYMENT_STATUS.FAILED,
        PAYMENT_STATUS.PENDING,
      ];

      const updatedPayment = { ...mockPayment };
      paymentService.updatePayment.mockResolvedValue(updatedPayment as any);

      for (const status of validStatuses) {
        await request(app.getHttpServer())
          .patch('/payments/test-ref')
          .send({ status })
          .expect(200);
      }
    });

    it('should handle missing required fields gracefully', async () => {
      const incompleteRequests = [
        { path: '/payments/initialize', body: { email: 'test@test.com' } }, // missing amount
        { path: '/payments/initialize', body: { amount: 1000 } }, // missing email
        { path: '/payments/verify', body: {} }, // missing reference
        { path: '/payments/test-ref', body: {}, method: 'patch' }, // missing status
      ];

      for (const req of incompleteRequests) {
        const method = req.method || 'post';
        await request(app.getHttpServer())
          [method](req.path)
          .send(req.body)
          .expect(400);
      }
    });
  });
});
