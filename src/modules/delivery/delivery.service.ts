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

    // Fetch the order to get the userId
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Fetch the user
    const user = await this.userRepository.findOne({
      where: { id: order.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Now you can safely use user.email
    await this.mailService.sendOrderDeliveredEmail(
      user.email,
      user.firstName,
      delivery.status,
      delivery.deliveryAddress,
      delivery.logisticsProvider,
    );

    return delivery;
  }
  // async updateDeliveryStatus(
  //   orderId: string,
  //   dto: UpdateDeliveryStatusDto,
  // ): Promise<Delivery> {
  //   const delivery = await this.deliveryRepository.findOne({
  //     where: { orderId },
  //     include: [{ model: Delivery.associations.order.target }],
  //   });

  //   if (!delivery) {
  //     throw new NotFoundException(`Delivery for order ${orderId} not found`);
  //   }

  //   const updatedDelivery = await delivery.update({ status: dto.status });

  //   const order = delivery.order;
  //   const user = await order?.user;

  //   // Send appropriate email based on status
  //   if (dto.status === 'in-transit') {
  //     await this.mailService.sendOrderReadyForDeliveryEmail(
  //       user.email,
  //       user.firstName,
  //       order.id,
  //       delivery.deliveryAddress,
  //       delivery.logisticsProvider,
  //     );
  //   } else if (dto.status === 'delivered') {
  //     await this.mailService.sendOrderDeliveredEmail(
  //       user.email,
  //       user.firstName,
  //       order.id,
  //       delivery.deliveryAddress,
  //       delivery.logisticsProvider,
  //     );
  //   }

  //   return updatedDelivery;
  // }

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
