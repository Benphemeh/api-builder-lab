import { Column, DataType } from 'sequelize-typescript';
import { BaseModel } from '../base-model';
import { USER_ROLE } from 'src/core/enums';
import { IUSER } from 'src/core/interfaces/users.interface';
import { ApiBuilderTable } from '../base-model/table-decorators';

@ApiBuilderTable({
  tableName: 'users',
})
export default class User extends BaseModel implements IUSER {
  isDefaultPassword: boolean;
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;
  @Column({
    type: DataType.ENUM,
    values: ['male', 'female'],
    allowNull: false,
  })
  gender: string;
  @Column({
    type: DataType.ENUM(...Object.values(USER_ROLE)),
    defaultValue: USER_ROLE.AUTHOR,
  })
  role: USER_ROLE;
}
