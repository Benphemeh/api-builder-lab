import { Column, DataType } from 'sequelize-typescript';
import { BaseModel } from '../base-model';
import { ApiBuilderTable } from '../base-model/table-decorators';
import { IPRODUCT } from 'src/core/interfaces/products.interface';

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

  //   @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  categoryId: string;
}
