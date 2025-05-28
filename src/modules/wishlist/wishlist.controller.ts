import { Controller, Post, Get, Delete, Param, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':productId')
  async addToWishlist(@Req() req, @Param('productId') productId: string) {
    const userId = req.user.id; // Assuming user is authenticated
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Get()
  async getWishlist(@Req() req) {
    const userId = req.user.id; // Assuming user is authenticated
    return this.wishlistService.getWishlist(userId);
  }

  @Delete(':productId')
  async removeFromWishlist(@Req() req, @Param('productId') productId: string) {
    const userId = req.user.id; // Assuming user is authenticated
    return this.wishlistService.removeFromWishlist(userId, productId);
  }
}
