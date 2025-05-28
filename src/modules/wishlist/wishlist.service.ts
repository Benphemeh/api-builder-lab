import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Wishlist from 'src/core/database/models/wishlist.model';
import Product from 'src/core/database/models/product.model';
import { Repository } from 'sequelize-typescript';
import { REPOSITORY } from 'src/core/constants';

@Injectable()
export class WishlistService {
  constructor(
    @Inject(REPOSITORY.WISHLIST)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    const existingItem = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    if (existingItem) {
      throw new Error('Product is already in the wishlist');
    }
    return this.wishlistRepository.create({ userId, productId });
  }

  async getWishlist(userId: string): Promise<Product[]> {
    const wishlist = await this.wishlistRepository.findAll({
      where: { userId },
      include: [Product],
    });
    return wishlist.map((item) => item.get('product') as Product);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const item = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    if (!item) {
      throw new NotFoundException('Product not found in wishlist');
    }
    await item.destroy();
  }
}
