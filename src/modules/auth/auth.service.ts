import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { REPOSITORY } from 'src/core/constants';
import User from 'src/core/database/models/user.model';
import { USER_ROLE } from 'src/core/enums';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REPOSITORY.USER) private readonly userRepository: typeof User,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const admin = await this.userRepository
      .findOne({ where: { email: process.env.SUPER_ADMIN_EMAIL as string } })
      .then((user) => {
        console.log('admin exist');
        return user;
      })

      .catch((error) => {
        console.log('admin not found', error);
      });
    if (!admin) {
      this.userRepository
        .create({
          firstName: process.env.SUPER_ADMIN_FIRST_NAME,
          lastName: process.env.SUPER_ADMIN_LAST_NAME,
          email: process.env.SUPER_ADMIN_EMAIL,
          password: await bcrypt.hash(
            process.env.SUPER_ADMIN_PASSWORD as string,
            10,
          ),
          role: USER_ROLE.SUPER_ADMIN,
          isDefaultPassword: false,
        })
        .then(() => {
          console.log('admin created');
        })
        .catch((err) => console.log('could not create admin', err));
    }
  }

  async validateUser(username: string, pass: string) {
    const user = await this.userService.findOneByEmail(username);
    if (!user) {
      return null;
    }
    const match = await this.comparePassword(pass, user.password);
    if (!match) {
      return null;
    }
    const { ...result } = user['dataValues'];
    return result;
  }

  public async login(user) {
    const token = await this.generateToken(user);
    return { user, token };
  }

  public async create(user) {
    const pass = await this.hashPassword(user.password);

    const newUser = await this.userService.create({ ...user, password: pass });

    const { ...result } = newUser['dataValues'];

    const token = await this.generateToken(result);
    return { user: result, token };
  }

  private async generateToken(user) {
    const token = await this.jwtService.signAsync(user);
    return token;
  }

  private async hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  private async comparePassword(enteredPassword, dbPassword) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }
}
