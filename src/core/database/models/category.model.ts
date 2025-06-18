import { Column, DataType, HasMany } from 'sequelize-typescript';
import Product from './product.model';
import { ApiBuilderTable } from '../base-model/table-decorators';
import { BaseModel } from '../base-model';

@ApiBuilderTable({
  tableName: 'categories',
})
export default class Category extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @HasMany(() => Product)
  products: Product[];
}
