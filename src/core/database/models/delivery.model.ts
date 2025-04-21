import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Order from './order.model';
import { BaseModel } from '../base-model';

@Table({
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
    defaultValue: 'pending', // pending, in-transit, delivered
    field: 'status',
  })
  status: 'pending' | 'in-transit' | 'delivered';

  //   @CreatedAt
  //   @Column({
  //     type: DataType.DATE,
  //     allowNull: false,
  //   })
  //   createdAt: Date;

  //   @UpdatedAt
  //   @Column({
  //     type: DataType.DATE,
  //     allowNull: false,
  //   })
  //   updatedAt: Date;

  //   @DeletedAt
  //   @Column({
  //     type: DataType.DATE,
  //     allowNull: true,
  //   })
  //   deletedAt: Date;
}
