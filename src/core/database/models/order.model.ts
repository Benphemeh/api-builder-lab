import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  HasOne,
} from 'sequelize-typescript';
import User from './user.model';
import { BaseModel } from '../base-model';
import Delivery from './delivery.model';

@Table({
  tableName: 'orders',
})
export default class Order extends BaseModel {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  products: { productId: string; quantity: number }[];

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: 'total_amount',
  })
  totalAmount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
    field: 'status',
  })
  status: 'pending' | 'completed' | 'canceled';

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'delivery_address',
  })
  deliveryAddress: string;

  @HasOne(() => Delivery, { foreignKey: 'orderId' }) // Link to Delivery model
  delivery: Delivery;
  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deletedAt: Date;
}
