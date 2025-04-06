import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './user.model';
import { BaseModel } from '../base-model';

@Table({
  tableName: 'orders',
})
export default class Order extends BaseModel {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
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
  })
  totalAmount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
  })
  status: 'pending' | 'completed' | 'canceled';
}
