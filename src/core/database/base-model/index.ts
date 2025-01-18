import {
  BeforeCreate,
  BeforeUpdate,
  BeforeValidate,
  Column,
  CreatedAt,
  DataType,
  Model,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

export class BaseModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  updatedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deletedAt: Date;

  @BeforeValidate
  @BeforeUpdate
  static setUpdatedAt(instance: BaseModel) {
    instance.dataValues.updatedAt = new Date().getTime();
  }

  @BeforeCreate
  @BeforeValidate
  static setId(instance: BaseModel) {
    if (!instance.dataValues.id || instance.dataValues.id === null)
      instance.dataValues.id = uuidv4();
  }
}
