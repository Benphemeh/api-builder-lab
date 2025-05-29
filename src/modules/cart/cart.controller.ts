import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtGuard } from '../guards/jwt-guard';
import { AddToCartDto, UpdateCartItemDto } from './dto/card.dto';


@Controller('cart')
@UseGuards(JwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Req() req, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user.id;
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Get()
  async getCart(@Req() req) {
    const userId = req.user.id;
    return this.cartService.getCart(userId);
  }

  @Patch('item/:cartItemId')
  async updateCartItem(
    @Req() req,
    @Param('cartItemId') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = req.user.id;
    return this.cartService.updateCartItem(
      userId,
      cartItemId,
      updateCartItemDto,
    );
  }

  @Delete('item/:cartItemId')
  async removeFromCart(@Req() req, @Param('cartItemId') cartItemId: string) {
    const userId = req.user.id;
    return this.cartService.removeFromCart(userId, cartItemId);
  }

  @Delete('clear')
  async clearCart(@Req() req) {
    const userId = req.user.id;
    return this.cartService.clearCart(userId);
  }
}
