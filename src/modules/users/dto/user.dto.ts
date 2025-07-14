import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender, USER_ROLE } from 'src/core/enums';

export class CreateUserDTO {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty()
  @IsEnum(Gender, {
    message: `Gender must be one of: ${Object.values(Gender).join(', ')}`,
  })
  gender: Gender;

  // @IsNotEmpty()
  // @IsEnum(['male', 'female'])
  // gender: string;

  @IsOptional()
  @IsEnum(USER_ROLE, {
    message: `Role must be one of: ${Object.values(USER_ROLE).join(', ')}`,
  })
  role?: USER_ROLE = USER_ROLE.AUTHOR;
}
