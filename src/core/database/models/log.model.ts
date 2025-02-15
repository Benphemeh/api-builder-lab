import { Column, DataType } from 'sequelize-typescript';
import { BaseModel } from '../base-model';
import { ApiBuilderTable } from '../base-model/table-decorators';

@ApiBuilderTable({ tableName: 'logs' })
export default class Log extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  level: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  message: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  meta: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  timestamp: string;
}
