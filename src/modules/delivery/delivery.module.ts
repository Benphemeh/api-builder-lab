import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { deliveryProviders } from './delivery.providers';
import { DatabaseModule } from 'src/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DeliveryController],
  providers: [...deliveryProviders, DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
