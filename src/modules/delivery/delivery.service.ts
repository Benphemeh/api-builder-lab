import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import Delivery from 'src/core/database/models/delivery.model';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { REPOSITORY } from 'src/core/constants';
import { UpdateDeliveryStatusDto } from './dto/update-delivery.dto';
import { MailService } from 'src/core/mail/mail.service';

@Injectable()
export class DeliveryService {
  constructor(
    @Inject(REPOSITORY.DELIVERY)
    private readonly deliveryRepository: typeof Delivery,
    private readonly mailService: MailService,
  ) {}

  async createDelivery(dto: CreateDeliveryDto): Promise<Delivery> {
    const delivery = await this.deliveryRepository.create({ ...dto });
    return delivery;
  }
  async updateDeliveryStatus(
    orderId: string,
    dto: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { orderId },
      include: [{ model: Delivery.associations.order.target }],
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery for order ${orderId} not found`);
    }

    const updatedDelivery = await delivery.update({ status: dto.status });

    const order = delivery.order;
    const user = await order?.user;

    // Send appropriate email based on status
    if (dto.status === 'in-transit') {
      await this.mailService.sendOrderReadyForDeliveryEmail(
        user.email,
        user.firstName,
        order.id,
        delivery.deliveryAddress,
        delivery.logisticsProvider,
      );
    } else if (dto.status === 'delivered') {
      await this.mailService.sendOrderDeliveredEmail(
        user.email,
        user.firstName,
        order.id,
        delivery.deliveryAddress,
        delivery.logisticsProvider,
      );
    }

    return updatedDelivery;
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
}
