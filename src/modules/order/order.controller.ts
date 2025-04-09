import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { JwtGuard } from '../guards/jwt-guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createOrder(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    const user = req.user;
    return this.orderService.createOrder(user.id, createOrderDto.products);
  }
}
