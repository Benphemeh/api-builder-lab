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

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body('userId') userId: string,
    @Body('products') products: { productId: string; quantity: number }[],
    @Body('deliveryAddress') deliveryAddress: string, // Accept deliveryAddress from the request body
  ) {
    return this.orderService.createOrder(userId, products, deliveryAddress);
  }
  // @Post()
  // @UseGuards(JwtGuard)
  // async createOrder(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
  //   const user = req.user;
  //   return this.orderService.createOrder(user.id, createOrderDto.products);
  // }
  @Post('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.orderService.verifyOrderPayment(reference);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Get()
  @UseGuards(JwtGuard)
  async getAllOrders(@Req() req: any) {
    const user = req.user;
    return this.orderService.getAllOrders(user.id);
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
