import { Column, DataType } from 'sequelize-typescript';
import { BaseModel } from '../base-model';
import { Gender, USER_ROLE } from 'src/core/enums';
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
    type: DataType.ENUM(...Object.values(Gender)),
    allowNull: false,
  })
  gender: string;
  @Column({
    type: DataType.ENUM(...Object.values(USER_ROLE)),
    defaultValue: USER_ROLE.AUTHOR,
  })
  role: USER_ROLE;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isEmailVerified: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  emailVerificationToken: string;

  @Column({ type: DataType.STRING, allowNull: true })
  resetPasswordToken: string;

  @Column({ type: DataType.DATE, allowNull: true })
  resetPasswordExpires: Date;
}
