import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { REPOSITORY } from 'src/core/constants';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockCartRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
};
const mockCart = {
  id: 'cart-1',
  userId: 'user-1',
  status: 'active',
  cartItems: [],
  totalAmount: 0,
  totalItems: 0,
  update: jest.fn(),
} as any;

const mockCartItemRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
  update: jest.fn(),
};

const mockProductRepository = {
  findByPk: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn((cb) => cb({})),
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: REPOSITORY.CART, useValue: mockCartRepository },
        { provide: REPOSITORY.CART_ITEM, useValue: mockCartItemRepository },
        { provide: REPOSITORY.PRODUCT, useValue: mockProductRepository },
        { provide: 'SEQUELIZE', useValue: mockSequelize },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getOrCreateActiveCart', () => {
    it('should return an existing cart', async () => {
      const mockCart = { id: '1' };
      mockCartRepository.findOne.mockResolvedValue(mockCart);

      const result = await service.getOrCreateActiveCart('user-1');
      expect(result).toBe(mockCart);
    });

    it('should create a new cart if none exists', async () => {
      mockCartRepository.findOne.mockResolvedValue(null);
      mockCartRepository.create.mockResolvedValue({ id: '1' });
      mockCartRepository.findByPk.mockResolvedValue({ id: '1' });

      const result = await service.getOrCreateActiveCart('user-1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('addToCart', () => {
    const product = { id: 'p1', stock: 10, price: 100 };
    const cart = { id: 'cart1' };

    it('should throw if product does not exist', async () => {
      mockProductRepository.findByPk.mockResolvedValue(null);
      await expect(
        service.addToCart('user-1', { productId: 'p1', quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if quantity exceeds stock', async () => {
      mockProductRepository.findByPk.mockResolvedValue({
        ...product,
        stock: 0,
      });
      await expect(
        service.addToCart('user-1', { productId: 'p1', quantity: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should add new item to cart', async () => {
      mockProductRepository.findByPk.mockResolvedValue(product);
      jest.spyOn(service, 'getOrCreateActiveCart').mockResolvedValue(mockCart);

      mockCartItemRepository.findOne.mockResolvedValue(null);
      mockCartItemRepository.create.mockResolvedValue({});
      mockCartRepository.findByPk.mockResolvedValue(cart);

      const result = await service.addToCart('user-1', {
        productId: 'p1',
        quantity: 1,
      });

      expect(result).toEqual(cart);
    });
  });

  describe('updateCartItem', () => {
    it('should throw if cart item is not found', async () => {
      mockCartItemRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateCartItem('user-1', 'item-1', { quantity: 2 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if stock is insufficient', async () => {
      mockCartItemRepository.findOne.mockResolvedValue({
        product: { stock: 1 },
      });
      await expect(
        service.updateCartItem('user-1', 'item-1', { quantity: 2 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFromCart', () => {
    it('should throw if cart item is not found', async () => {
      mockCartItemRepository.findOne.mockResolvedValue(null);
      await expect(service.removeFromCart('user-1', 'item-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove item and return updated cart', async () => {
      const cartItem = { cartId: 'cart1', destroy: jest.fn() };
      mockCartItemRepository.findOne.mockResolvedValue(cartItem);
      mockCartRepository.findByPk.mockResolvedValue({ id: 'cart1' });

      const result = await service.removeFromCart('user-1', 'item-1');
      expect(result).toEqual({ id: 'cart1' });
    });
  });

  describe('clearCart', () => {
    it('should return early if cart does not exist', async () => {
      mockCartRepository.findOne.mockResolvedValue(null);
      const result = await service.clearCart('user-1');
      expect(result).toEqual({
        message: 'Cart is already empty',
        itemsRemoved: 0,
      });
    });

    it('should clear cart items and update status', async () => {
      const updateMock = jest.fn();
      const cart = { id: 'cart1', cartItems: [{}], update: updateMock };
      mockCartRepository.findOne.mockResolvedValue(cart);
      const destroyMock = jest.fn();
      mockCartItemRepository.destroy.mockImplementation(destroyMock);

      const result = await service.clearCart('user-1');
      expect(updateMock).toHaveBeenCalledWith(
        { status: 'cleared' },
        expect.anything(),
      );
      expect(result.message).toMatch(/cleared successfully/);
    });
  });

  describe('convertCartToOrder', () => {
    it('should throw if cart is empty or not found', async () => {
      mockCartRepository.findOne.mockResolvedValue(null);
      await expect(service.convertCartToOrder('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if stock is insufficient', async () => {
      const cart = {
        cartItems: [
          {
            product: { stock: 0, name: 'Product A' },
            quantity: 1,
          },
        ],
      };
      mockCartRepository.findOne.mockResolvedValue(cart);
      await expect(service.convertCartToOrder('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return order data and update cart', async () => {
      const updateMock = jest.fn();
      const cart = {
        cartItems: [{ product: { stock: 5 }, productId: 'p1', quantity: 2 }],
        update: updateMock,
        totalAmount: 200,
      };
      mockCartRepository.findOne.mockResolvedValue(cart);

      const result = await service.convertCartToOrder('user-1');
      expect(updateMock).toHaveBeenCalledWith(
        { status: 'converted' },
        expect.anything(),
      );
      expect(result.totalAmount).toBe(200);
    });
  });
});
