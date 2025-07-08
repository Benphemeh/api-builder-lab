import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtGuard } from '../guards/jwt-guard';

describe('CartController (e2e)', () => {
  let app: INestApplication;
  let cartService: Partial<Record<keyof CartService, jest.Mock>>;

  const mockUser = { id: 'user-1' };

  const mockGuard = {
    canActivate: (context) => {
      const req = context.switchToHttp().getRequest();
      req.user = mockUser;
      return true;
    },
  };

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    status: 'active',
    cartItems: [],
    totalAmount: 0,
    totalItems: 0,
  };

  beforeEach(async () => {
    cartService = {
      addToCart: jest.fn().mockResolvedValue(mockCart),
      getCart: jest.fn().mockResolvedValue(mockCart),
      updateCartItem: jest.fn().mockResolvedValue(mockCart),
      removeFromCart: jest.fn().mockResolvedValue(mockCart),
      clearCart: jest.fn().mockResolvedValue({
        message: 'Cart cleared successfully',
        itemsRemoved: 3,
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: cartService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /cart', () => {
    it('should add item to cart', async () => {
      const dto = { productId: 'product-1', quantity: 2 };

      const res = await request(app.getHttpServer())
        .post('/cart')
        .send(dto)
        .expect(201);

      expect(cartService.addToCart).toHaveBeenCalledWith(mockUser.id, dto);
      expect(res.body).toEqual(mockCart);
    });
  });

  describe('GET /cart', () => {
    it('should return user cart', async () => {
      const res = await request(app.getHttpServer()).get('/cart').expect(200);

      expect(cartService.getCart).toHaveBeenCalledWith(mockUser.id);
      expect(res.body).toEqual(mockCart);
    });
  });

  describe('PATCH /cart/item/:cartItemId', () => {
    it('should update a cart item', async () => {
      const dto = { quantity: 5 };
      const cartItemId = 'item-123';

      const res = await request(app.getHttpServer())
        .patch(`/cart/item/${cartItemId}`)
        .send(dto)
        .expect(200);

      expect(cartService.updateCartItem).toHaveBeenCalledWith(
        mockUser.id,
        cartItemId,
        dto,
      );
      expect(res.body).toEqual(mockCart);
    });
  });

  describe('DELETE /cart/item/:cartItemId', () => {
    it('should remove an item from cart', async () => {
      const cartItemId = 'item-456';

      const res = await request(app.getHttpServer())
        .delete(`/cart/item/${cartItemId}`)
        .expect(200);

      expect(cartService.removeFromCart).toHaveBeenCalledWith(
        mockUser.id,
        cartItemId,
      );
      expect(res.body).toEqual(mockCart);
    });
  });

  describe('DELETE /cart/clear', () => {
    it('should clear the user cart', async () => {
      const res = await request(app.getHttpServer())
        .delete('/cart/clear')
        .expect(200);

      expect(cartService.clearCart).toHaveBeenCalledWith(mockUser.id);
      expect(res.body).toEqual({
        success: true,
        message: 'Cart cleared successfully',
        data: { itemsRemoved: 3 },
      });
    });
  });
});
