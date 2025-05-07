import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';
import { USER_ROLE } from 'src/core/enums';

export class AdminDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(USER_ROLE, { message: 'Role must be one of the valid user roles' })
  role: USER_ROLE;
}
