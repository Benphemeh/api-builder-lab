import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import Delivery from 'src/core/database/models/delivery.model';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { REPOSITORY } from 'src/core/constants';
import { UpdateDeliveryStatusDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(
    @Inject(REPOSITORY.DELIVERY)
    private readonly deliveryRepository: typeof Delivery,
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
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery for order ${orderId} not found`);
    }

    return delivery.update({ status: dto.status });
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
