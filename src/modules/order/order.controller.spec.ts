import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CacheService } from '../cache/cache.service';
import { JwtGuard } from '../guards/jwt-guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartToOrderDto } from '../cart/dto/card.dto';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let orderService: OrderService;
  let cacheService: CacheService;

  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  const mockOrder = {
    id: validUUID,
    userId: validUUID,
    products: [
      { productId: '11111111-1111-1111-1111-111111111111', quantity: 2 },
      { productId: '22222222-2222-2222-2222-222222222222', quantity: 1 },
    ],
    totalAmount: 150.0,
    deliveryAddress: '123 Test Street, Test City',
    status: 'pending',
    createdAt: '2025-07-08T13:46:30.507Z',
    updatedAt: '2025-07-08T13:46:30.507Z',
  };

  const mockOrderWithPayment = {
    ...mockOrder,
    payment: {
      reference: 'ref-123456',
      authorization_url: 'https://checkout.paystack.com/test',
      access_code: 'access-code-123',
    },
  };

  const mockUser = {
    id: validUUID,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockOrderService = {
    createOrder: jest.fn(),
    createOrderFromCart: jest.fn(),
    verifyOrderPayment: jest.fn(),
    applyCoupon: jest.fn(),
    getOrderById: jest.fn(),
    getAllOrders: jest.fn(),
    deleteOrder: jest.fn(),
  };

  const mockCacheService = {
    getOrSet: jest.fn(),
  };

  const mockJwtGuard = {
    canActivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    orderService = module.get<OrderService>(OrderService);
    cacheService = module.get<CacheService>(CacheService);

    jest.clearAllMocks();

    mockJwtGuard.canActivate.mockImplementation((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      if (authHeader === 'Bearer valid-token') {
        request.user = mockUser;
        return true;
      }
      return false;
    });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /order', () => {
    it('should create a new order successfully', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: validUUID,
        products: [
          { productId: '11111111-1111-1111-1111-111111111111', quantity: 2 },
          { productId: '22222222-2222-2222-2222-222222222222', quantity: 1 },
        ],
        deliveryAddress: '123 Test Street, Test City',
      };

      mockOrderService.createOrder.mockResolvedValue(mockOrderWithPayment);

      const response = await request(app.getHttpServer())
        .post('/order')
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toEqual(mockOrderWithPayment);
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(
        createOrderDto.userId,
        createOrderDto.products,
        createOrderDto.deliveryAddress,
      );
    });

    it('should handle invalid order data', async () => {
      const invalidOrderDto = {
        userId: '',
        products: [],
        deliveryAddress: '',
      };

      await request(app.getHttpServer())
        .post('/order')
        .send(invalidOrderDto)
        .expect(400);
    });
  });

  describe('POST /order/from-cart', () => {
    it('should create order from cart successfully', async () => {
      const cartToOrderDto: CartToOrderDto = {
        cartId: '33333333-3333-3333-3333-333333333333',
        deliveryAddress: '123 Test Street, Test City',
      };

      mockOrderService.createOrderFromCart.mockResolvedValue(
        mockOrderWithPayment,
      );

      const response = await request(app.getHttpServer())
        .post('/order/from-cart')
        .set('Authorization', 'Bearer valid-token')
        .send(cartToOrderDto)
        .expect(201);

      expect(response.body).toEqual(mockOrderWithPayment);
      expect(mockOrderService.createOrderFromCart).toHaveBeenCalledWith(
        mockUser.id,
        cartToOrderDto.deliveryAddress,
        cartToOrderDto.cartId,
      );
    });

    it('should require authentication', async () => {
      const cartToOrderDto: CartToOrderDto = {
        cartId: '33333333-3333-3333-3333-333333333333',
        deliveryAddress: '123 Test Street, Test City',
      };

      await request(app.getHttpServer())
        .post('/order/from-cart')
        .send(cartToOrderDto)
        .expect(403);
    });

    it('should handle cart not found', async () => {
      const cartToOrderDto: CartToOrderDto = {
        cartId: '33333333-3333-4333-8333-333333333333',
        deliveryAddress: '123 Test Street, Test City',
      };

      mockOrderService.createOrderFromCart.mockRejectedValue(
        new Error('Cart not found'),
      );

      await request(app.getHttpServer())
        .post('/order/from-cart')
        .set('Authorization', 'Bearer valid-token')
        .send(cartToOrderDto);
    });
  });

  describe('POST /order/verify/:reference', () => {
    it('should verify payment successfully', async () => {
      const reference = 'ref-123456';
      const mockVerificationResult = {
        message: 'Payment verified, order completed, and invoice sent',
        order: { ...mockOrder, status: 'completed' },
      };

      mockOrderService.verifyOrderPayment.mockResolvedValue(
        mockVerificationResult,
      );

      const response = await request(app.getHttpServer())
        .post(`/order/verify/${reference}`)
        .expect(201);

      expect(response.body).toEqual(mockVerificationResult);
      expect(mockOrderService.verifyOrderPayment).toHaveBeenCalledWith(
        reference,
      );
    });

    it('should handle invalid payment reference', async () => {
      const reference = 'invalid-ref';

      mockOrderService.verifyOrderPayment.mockRejectedValue(
        new Error('Invalid payment reference'),
      );

      await request(app.getHttpServer())
        .post(`/order/verify/${reference}`)
        .expect(500);
    });

    it('should handle abandoned payment', async () => {
      const reference = 'abandoned-ref';

      mockOrderService.verifyOrderPayment.mockRejectedValue(
        new Error('Payment was abandoned'),
      );

      await request(app.getHttpServer())
        .post(`/order/verify/${reference}`)
        .expect(500);
    });
  });

  describe('POST /order/:id/apply-coupon', () => {
    it('should apply coupon successfully', async () => {
      const orderId = 'order-123';
      const couponCode = 'SAVE10';
      const updatedOrder = {
        ...mockOrder,
        totalAmount: 135.0,
      };

      mockOrderService.applyCoupon.mockResolvedValue(updatedOrder);

      const response = await request(app.getHttpServer())
        .post(`/order/${orderId}/apply-coupon`)
        .send({ code: couponCode })
        .expect(201);

      expect(response.body).toEqual(updatedOrder);
      expect(mockOrderService.applyCoupon).toHaveBeenCalledWith(
        orderId,
        couponCode,
      );
    });

    it('should handle invalid coupon code', async () => {
      mockOrderService.applyCoupon.mockRejectedValue(
        new Error('Invalid or expired coupon'),
      );

      await request(app.getHttpServer())
        .post(`/order/order-123/apply-coupon`)
        .send({ code: 'INVALID' })
        .expect(500);
    });

    it('should handle order not found', async () => {
      mockOrderService.applyCoupon.mockRejectedValue(
        new Error('Order not found'),
      );

      await request(app.getHttpServer())
        .post(`/order/invalid-order/apply-coupon`)
        .send({ code: 'SAVE10' })
        .expect(500);
    });
  });

  describe('GET /order/:id', () => {
    it('should get order by id with caching', async () => {
      const orderId = 'order-123';
      const cacheKey = `orders:detail:${orderId}`;

      mockCacheService.getOrSet.mockResolvedValue(mockOrder);

      const response = await request(app.getHttpServer())
        .get(`/order/${orderId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual(mockOrder);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        cacheKey,
        expect.any(Function),
        10,
      );
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer()).get('/order/order-123').expect(403);
    });

    it('should handle order not found', async () => {
      mockCacheService.getOrSet.mockRejectedValue(new Error('Order not found'));

      await request(app.getHttpServer())
        .get('/order/invalid-order')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });
  });

  describe('GET /order', () => {
    it('should get all orders without filters', async () => {
      const mockOrders = [mockOrder];
      const cacheKey = 'orders:list:none:none:none:none';

      mockCacheService.getOrSet.mockResolvedValue(mockOrders);

      const response = await request(app.getHttpServer())
        .get('/order')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual(mockOrders);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        cacheKey,
        expect.any(Function),
        10,
      );
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer()).get('/order').expect(403);
    });
  });

  describe('DELETE /order/:id', () => {
    it('should delete order successfully', async () => {
      mockOrderService.deleteOrder.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/order/order-123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockOrderService.deleteOrder).toHaveBeenCalledWith('order-123');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer()).delete('/order/order-123').expect(403);
    });

    it('should handle order not found', async () => {
      mockOrderService.deleteOrder.mockRejectedValue(
        new Error('Order not found'),
      );

      await request(app.getHttpServer())
        .delete('/order/invalid-order')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should pass user context to authenticated endpoints', async () => {
      const cartToOrderDto: CartToOrderDto = {
        cartId: '33333333-3333-3333-3333-333333333333',
        deliveryAddress: '123 Test Street, Test City',
      };

      mockOrderService.createOrderFromCart.mockResolvedValue(
        mockOrderWithPayment,
      );

      await request(app.getHttpServer())
        .post('/order/from-cart')
        .set('Authorization', 'Bearer valid-token')
        .send(cartToOrderDto);

      expect(mockOrderService.createOrderFromCart).toHaveBeenCalledWith(
        mockUser.id,
        cartToOrderDto.deliveryAddress,
        cartToOrderDto.cartId,
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: validUUID,
        products: [
          { productId: '11111111-1111-1111-1111-111111111111', quantity: 2 },
        ],
        deliveryAddress: '123 Test Street, Test City',
      };

      mockOrderService.createOrder.mockRejectedValue(
        new Error('Database error'),
      );

      await request(app.getHttpServer())
        .post('/order')
        .send(createOrderDto)
        .expect(500);
    });

    it('should handle cache service errors', async () => {
      mockCacheService.getOrSet.mockRejectedValue(
        new Error('Cache service unavailable'),
      );

      await request(app.getHttpServer())
        .get('/order/order-123')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });
  });

  describe('Input Validation', () => {
    it('should handle malformed JSON in request body', async () => {
      await request(app.getHttpServer())
        .post('/order')
        .send('not-json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle missing required fields', async () => {
      const dto = { userId: validUUID };

      await request(app.getHttpServer()).post('/order').send(dto).expect(400);
    });
  });
});
