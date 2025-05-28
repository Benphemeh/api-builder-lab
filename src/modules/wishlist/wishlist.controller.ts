import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtGuard } from '../guards/jwt-guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':productId')
  @UseGuards(JwtGuard)
  async addToWishlist(@Req() req, @Param('productId') productId: string) {
    const userId = req.user.id;
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Get()
  @UseGuards(JwtGuard)
  async getWishlist(@Req() req) {
    const userId = req.user.id;
    return this.wishlistService.getWishlist(userId);
  }

  @Delete(':productId')
  @UseGuards(JwtGuard)
  async removeFromWishlist(@Req() req, @Param('productId') productId: string) {
    const userId = req.user.id;
    return this.wishlistService.removeFromWishlist(userId, productId);
  }
}
