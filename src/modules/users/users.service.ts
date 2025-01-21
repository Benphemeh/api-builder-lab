import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORY } from '../../core/constants';
import User from 'src/core/database/models/user.model';
import { CreateUserDTO } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REPOSITORY) private readonly userRepository: typeof User,
  ) {}

  async create(user: CreateUserDTO): Promise<User> {
    return await this.userRepository.create<User>(user);
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { email } });
  }

  async findOneById(id: number): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { id } });
  }
}
