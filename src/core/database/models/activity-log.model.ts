import { Column, DataType } from 'sequelize-typescript';
import { BaseModel } from '../base-model';
import { ApiBuilderTable } from '../base-model/table-decorators';

@ApiBuilderTable({ tableName: 'activity_log' })
export default class ActivityModel extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  url: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  method: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  body: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  headers: string;

  @Column({
    type: DataType.DATE,
    unique: true,
    allowNull: true,
  })
  timestamp: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  user: string;
}
