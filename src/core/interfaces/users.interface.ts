import { USER_ROLE } from '../enums';

export interface IUSER {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: USER_ROLE;
  isDefaultPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
