import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import Cart from 'src/core/database/models/cart.model';
import CartItem from 'src/core/database/models/cart-item.model';
import Product from 'src/core/database/models/product.model';
import { Sequelize } from 'sequelize-typescript';
import { AddToCartDto, UpdateCartItemDto } from './dto/card.dto';

@Injectable()
export class CartService {
  constructor(
    @Inject(REPOSITORY.CART)
    private readonly cartRepository: typeof Cart,
    @Inject(REPOSITORY.CART_ITEM)
    private readonly cartItemRepository: typeof CartItem,
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: typeof Product,
    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
  ) {}

  async getOrCreateActiveCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId, status: 'active' },
      include: [
        {
          model: CartItem,
          include: [Product],
        },
      ],
    });

    if (!cart) {
      cart = await this.cartRepository.create({ userId, status: 'active' });
      // Reload with associations
      cart = await this.cartRepository.findByPk(cart.id, {
        include: [
          {
            model: CartItem,
            include: [Product],
          },
        ],
      });
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    return await this.sequelize.transaction(async (t) => {
      // Check if product exists and has sufficient stock
      const product = await this.productRepository.findByPk(productId, {
        transaction: t,
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      if (product.stock < quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
        );
      }

      // Get or create active cart
      const cart = await this.getOrCreateActiveCart(userId);

      // Check if item already exists in cart
      const existingCartItem = await this.cartItemRepository.findOne({
        where: { cartId: cart.id, productId },
        transaction: t,
      });

      if (existingCartItem) {
        // Update quantity if item exists
        const newQuantity = existingCartItem.quantity + quantity;

        if (product.stock < newQuantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${product.stock}, Total requested: ${newQuantity}`,
          );
        }

        await existingCartItem.update(
          { quantity: newQuantity },
          { transaction: t },
        );
      } else {
        // Create new cart item
        await this.cartItemRepository.create(
          {
            cartId: cart.id,
            productId,
            quantity,
            priceAtTime: product.price,
          },
          { transaction: t },
        );
      }

      // Return updated cart with all items
      return await this.cartRepository.findByPk(cart.id, {
        include: [
          {
            model: CartItem,
            include: [Product],
          },
        ],
        transaction: t,
      });
    });
  }

  async getCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateActiveCart(userId);
    return cart;
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const { quantity } = updateCartItemDto;

    return await this.sequelize.transaction(async (t) => {
      const cartItem = await this.cartItemRepository.findOne({
        where: { id: cartItemId },
        include: [
          {
            model: Cart,
            where: { userId, status: 'active' },
          },
          Product,
        ],
        transaction: t,
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      // Check stock availability
      if (cartItem.product.stock < quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${cartItem.product.stock}, Requested: ${quantity}`,
        );
      }

      await cartItem.update({ quantity }, { transaction: t });

      // Return updated cart
      return await this.cartRepository.findByPk(cartItem.cartId, {
        include: [
          {
            model: CartItem,
            include: [Product],
          },
        ],
        transaction: t,
      });
    });
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<Cart> {
    return await this.sequelize.transaction(async (t) => {
      const cartItem = await this.cartItemRepository.findOne({
        where: { id: cartItemId },
        include: [
          {
            model: Cart,
            where: { userId, status: 'active' },
          },
        ],
        transaction: t,
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      const cartId = cartItem.cartId;
      await cartItem.destroy({ transaction: t });

      // Return updated cart
      return await this.cartRepository.findByPk(cartId, {
        include: [
          {
            model: CartItem,
            include: [Product],
          },
        ],
        transaction: t,
      });
    });
  }

  async clearCart(userId: string): Promise<void> {
    return await this.sequelize.transaction(async (t) => {
      const cart = await this.cartRepository.findOne({
        where: { userId, status: 'active' },
        transaction: t,
      });

      if (cart) {
        await this.cartItemRepository.destroy({
          where: { cartId: cart.id },
          transaction: t,
        });
      }
    });
  }

  async convertCartToOrder(
    userId: string,
    cartId?: string,
  ): Promise<{
    products: { productId: string; quantity: number }[];
    totalAmount: number;
  }> {
    return await this.sequelize.transaction(async (t) => {
      let cart: Cart;

      if (cartId) {
        cart = await this.cartRepository.findOne({
          where: { id: cartId, userId, status: 'active' },
          include: [
            {
              model: CartItem,
              include: [Product],
            },
          ],
          transaction: t,
        });
      } else {
        cart = await this.cartRepository.findOne({
          where: { userId, status: 'active' },
          include: [
            {
              model: CartItem,
              include: [Product],
            },
          ],
          transaction: t,
        });
      }

      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        throw new BadRequestException('Cart is empty or not found');
      }

      // Validate stock availability for all items
      for (const cartItem of cart.cartItems) {
        if (cartItem.product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${cartItem.product.name}. Available: ${cartItem.product.stock}, Required: ${cartItem.quantity}`,
          );
        }
      }

      // Convert cart items to order format
      const products = cart.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const totalAmount = cart.totalAmount;

      // Mark cart as converted
      await cart.update({ status: 'converted' }, { transaction: t });

      return { products, totalAmount };
    });
  }
}
