import { Column, ForeignKey, Table } from 'sequelize-typescript';
import User from './user.model';
import Product from './product.model';
import { BaseModel } from '../base-model';

@Table
export default class Wishlist extends BaseModel {
  @ForeignKey(() => User)
  @Column
  userId: string;

  @ForeignKey(() => Product)
  @Column
  productId: string;
}
