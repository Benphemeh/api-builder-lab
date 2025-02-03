import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { REPOSITORY } from '../../core/constants';
import User from 'src/core/database/models/user.model';
import { CreateUserDTO } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REPOSITORY) private readonly userRepository: typeof User,
  ) {}

  async create(user: CreateUserDTO): Promise<User> {
    return await this.userRepository.create<User>({ ...user });
  }
  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { email } });
  }
  async findOneById(id: number): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { id } });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne<User>({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll<User>({});
  }
  async updateUser(id: string, user: User): Promise<User> {
    const [, [updatedUser]] = await this.userRepository.update(
      { ...user },
      { where: { id }, returning: true },
    );
    return updatedUser;
  }
  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne<User>({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await user.destroy();
  }
}
