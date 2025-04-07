import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtGuard } from '../guards/jwt-guard';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createOrder(
    @Req() req: Request,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const user = (req as any).user;
    return this.orderService.createOrder(user.id, createOrderDto.products);
  }
}
