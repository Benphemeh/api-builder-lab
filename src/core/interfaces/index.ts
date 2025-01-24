import { Request } from 'express';
export { IUSER } from './users.interface';

export interface AuthUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}
