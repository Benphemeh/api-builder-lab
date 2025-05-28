import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import Order from './order.model';
import { BaseModel } from '../base-model';
import { DELIVERY_STATUS } from 'src/core/enums';
import { ApiBuilderTable } from '../base-model/table-decorators';

@ApiBuilderTable({
  tableName: 'deliveries',
})
export default class Delivery extends BaseModel {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'order_id',
  })
  orderId: string;

  @BelongsTo(() => Order)
  order: Order;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'delivery_address',
  })
  deliveryAddress: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'logistics_provider',
  })
  logisticsProvider: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: DELIVERY_STATUS.IN_TRANSIT,
    field: 'status',
  })
  status: DELIVERY_STATUS;
}
