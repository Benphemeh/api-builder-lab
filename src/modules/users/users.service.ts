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
      attributes: ['id', 'firstName', 'lastName', 'email', 'password'],
    });
  }
  async findOneById(id: string): Promise<User> {
    console.log(`findOneById called with ID: "${id}", type: ${typeof id}`);

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
      console.error(`Error finding user with ID ${id}:`, error.message);
      throw error;
    }
  }

  // async findOneById(id: string): Promise<User> {
  //   return await this.userRepository.findOne<User>({ where: { id } });
  // }
  async getUserById(id: string): Promise<User> {
    console.log(`Fetching user with ID: ${id}`); // Debugging
    return this.findOneById(id);
  }
  // async getUserById(id: string): Promise<User> {
  //   const user = await this.userRepository.findOne<User>({ where: { id } });
  //   if (!user) {
  //     throw new NotFoundException(`User with id ${id} not found`);
  //   }
  //   return user;
  // }
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll<User>({});
  }

  async validateAdmin(email: string, password: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      return null;
    }

    // Check if user is an admin
    if (user.role !== 'admin') {
      return null;
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Better way to remove password from returned user object
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
      role: user.isAdmin ? 'admin' : 'user',
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
