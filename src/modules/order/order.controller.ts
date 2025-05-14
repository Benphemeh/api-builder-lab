import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { JwtGuard } from '../guards/jwt-guard';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from 'src/core/database';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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

  @Get(':id')
  @UseGuards(JwtGuard)
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Get()
  @UseGuards(JwtGuard)
  async getAllOrders() {
    return this.orderService.getAllOrders(); // Fetch all orders
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, updateOrderDto);
  }
  @Delete(':id')
  @UseGuards(JwtGuard)
  async deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }
}
