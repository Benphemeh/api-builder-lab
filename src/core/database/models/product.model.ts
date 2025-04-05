import { BelongsTo, Column, DataType, ForeignKey } from 'sequelize-typescript';
import { BaseModel } from '../base-model';
import { ApiBuilderTable } from '../base-model/table-decorators';
import { IPRODUCT } from 'src/core/interfaces/products.interface';
import User from './user.model';

@ApiBuilderTable({
  tableName: 'products',
})
export default class Product extends BaseModel implements IPRODUCT {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  stock: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  author: User;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  categoryId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  size: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  breed: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string; // e.g., "pork", "fumigation"
}
