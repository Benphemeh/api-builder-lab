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
  tableName: 'payments',
})
export default class Payment extends BaseModel {
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
  })
  reference: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: 'pending' | 'success' | 'failed';

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount: number;
}
