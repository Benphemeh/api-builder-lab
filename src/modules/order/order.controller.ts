import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { JwtGuard } from '../guards/jwt-guard';
import { CartToOrderDto } from '../cart/dto/card.dto';
import { CacheService } from '../cache/cache.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const { userId, products, deliveryAddress } = createOrderDto;
    return this.orderService.createOrder(userId, products, deliveryAddress);
  }

  @Post('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.orderService.verifyOrderPayment(reference);
  }
  @Post(':id/apply-coupon')
  async applyCoupon(@Param('id') orderId: string, @Body('code') code: string) {
    return this.orderService.applyCoupon(orderId, code);
  }
  @Post('from-cart')
  @UseGuards(JwtGuard)
  async createOrderFromCart(
    @Req() req,
    @Body() cartToOrderDto: CartToOrderDto,
  ) {
    const userId = req.user.id;
    const { cartId, deliveryAddress } = cartToOrderDto;
    return this.orderService.createOrderFromCart(
      userId,
      deliveryAddress,
      cartId,
    );
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getOrderById(@Param('id') id: string) {
    const cacheKey = `orders:detail:${id}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () => this.orderService.getOrderById(id),
      10,
    );
  }

  @Get()
  @UseGuards(JwtGuard)
  async getAllOrders(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const cacheKey = `orders:list:${search || 'none'}:${status || 'none'}:${fromDate || 'none'}:${toDate || 'none'}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () =>
        this.orderService.getAllOrders({ search, status, fromDate, toDate }),
      60,
    );
  }

  // @Patch(':id')
  // @UseGuards(JwtGuard)
  // async updateOrder(
  //   @Param('id') id: string,
  //   @Body() updateOrderDto: UpdateOrderDto,
  // ) {
  //   return this.orderService.updateOrder(id, updateOrderDto);
  // }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }
}
