import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript';
import { BaseModel } from '../base-model';
import { ApiBuilderTable } from '../base-model/table-decorators';
import { IPRODUCT } from 'src/core/interfaces/products.interface';
import User from './user.model';
import Review from './review.model';

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
  type: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'image_url',
  })
  imageUrl: string;
  @HasMany(() => Review)
  reviews: Review[];
}
