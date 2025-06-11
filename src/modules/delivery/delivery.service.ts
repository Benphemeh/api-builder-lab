import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import Delivery from 'src/core/database/models/delivery.model';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { REPOSITORY } from 'src/core/constants';
import { UpdateDeliveryStatusDto } from './dto/update-delivery.dto';
import { MailService } from 'src/core/mail/mail.service';
import { Order, User } from 'src/core/database';

@Injectable()
export class DeliveryService {
  constructor(
    @Inject(REPOSITORY.DELIVERY)
    private readonly deliveryRepository: typeof Delivery,
    @Inject(REPOSITORY.ORDER)
    private readonly orderRepository: typeof Order,
    @Inject(REPOSITORY.USER)
    private readonly userRepository: typeof User,
    private readonly mailService: MailService,
  ) {}

  async createDelivery(dto: CreateDeliveryDto): Promise<Delivery> {
    const delivery = await this.deliveryRepository.create({ ...dto });
    return delivery;
  }
  async updateDeliveryStatus(orderId: string, dto: UpdateDeliveryStatusDto) {
    const delivery = await this.deliveryRepository.findOne({
      where: { orderId },
    });
    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    // Update status
    delivery.status = dto.status;
    await delivery.save();

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: order.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Send email based on status
    await this.mailService.sendOrderDeliveredEmail(
      user.email,
      user.firstName,
      order.id,
      delivery.deliveryAddress,
      delivery.logisticsProvider,
    );

    return delivery;
  }

  async getDeliveryByOrderId(orderId: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { orderId },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery for order ${orderId} not found`);
    }

    return delivery;
  }

  async getAllDeliveries(filters: {
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Delivery[]> {
    const where: any = {};

    if (filters.search) {
      where.deliveryAddress = { $like: `%${filters.search}%` }; // Search by delivery address
    }

    if (filters.status) {
      where.status = filters.status; // Filter by status
    }

    if (filters.fromDate && filters.toDate) {
      where.createdAt = {
        $between: [new Date(filters.fromDate), new Date(filters.toDate)],
      };
    }

    return this.deliveryRepository.findAll({ where });
  }
}
