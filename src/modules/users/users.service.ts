import {
  Injectable,
  Inject,
  NotFoundException,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { REPOSITORY } from '../../core/constants';
import * as bcrypt from 'bcrypt';
import User from 'src/core/database/models/user.model';
import { CreateUserDTO } from './dto/user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REPOSITORY.USER) private readonly userRepository: typeof User,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async create(user: CreateUserDTO): Promise<User> {
    return await this.userRepository.create<User>({ ...user });
  }
  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne<User>({
      where: { email },
      attributes: ['id', 'firstName', 'lastName', 'email', 'password', 'role'],
    });
  }
  async findOneById(id: string): Promise<User> {
    if (!id) {
      console.warn('Undefined or empty ID detected');
      throw new BadRequestException('User ID is required');
    }

    try {
      const user = await this.userRepository.findOne<User>({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne<User>({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
  async getAllUsers(
    page = 1,
    limit = 10,
    search = '',
    role?: string,
    status?: string,
  ): Promise<{ data: User[]; total: number }> {
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const { rows, count } = await this.userRepository.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    return { data: rows, total: count };
  }

  async validateAdmin(email: string, password: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      return null;
    }

    // check if user is an admin
    if (user.role !== 'admin') {
      return null;
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    const userObject = user.toJSON ? user.toJSON() : { ...user.dataValues };
    delete userObject.password;

    return userObject;
  }

  private async comparePassword(
    enteredPassword: string,
    dbPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(enteredPassword, dbPassword);
  }

  async generateToken(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async updateUserProfile(
    id: string,
    data: Partial<UpdateUserDTO>,
  ): Promise<User> {
    const user = await this.findOneById(id);
    await user.update(data);
    return user;
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
