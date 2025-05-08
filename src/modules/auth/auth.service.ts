import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { REPOSITORY } from 'src/core/constants';
import User from 'src/core/database/models/user.model';
import { USER_ROLE } from 'src/core/enums';
import { MailService } from 'src/core/mail/mail.service';
import {
  sendUserConfirmation,
  userOnBoardEmail,
} from 'src/core/mail/templates';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(REPOSITORY.USER) private readonly userRepository: typeof User,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
          gender: 'male',
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
    try {
      const token = await this.generateToken(user);

      console.log('login successful');
      return { user, token };
    } catch (error) {
      console.error('Error during login:', error.message);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  public async create(user) {
    const pass = await this.hashPassword(user.password);

    const newUser = await this.userService.create({ ...user, password: pass });

    const { ...result } = newUser['dataValues'];

    const token = await this.generateToken(result);

    // Send confirmation email
    await this.sendUserConfirmation(result);

    //send UserOnBoard email
    await this.sendUserOnBoardEmail(user.firstName, user.email);

    return { user: result, token };
  }
  private async generateToken(user) {
    try {
      const secret = process.env.JWT_SECRET;
      console.log(
        'Using JWT secret:',
        secret ? 'Secret is defined' : 'Secret is undefined',
      );

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return this.jwtService.sign(payload, { secret });
    } catch (error) {
      console.error('Error generating token:', error.message);
      throw error;
    }
  }

  private async hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  private async comparePassword(enteredPassword, dbPassword) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }

  private async sendUserConfirmation(user) {
    try {
      const msg = sendUserConfirmation(user.username);
      await this.mailService.sendUserConfirmation({
        email: user.email,
        subject: msg.subject,
        content: msg.msg,
      });
      console.log(`Confirmation email sent to ${user.email}`);
    } catch (error) {
      console.error(
        `Failed to send confirmation email to ${user.email}:`,
        error,
      );
    }
  }
  private async sendUserOnBoardEmail(firstName: string, email: string) {
    try {
      userOnBoardEmail({ firstName });
      await this.mailService.sendUserOnBoard(email, {
        firstName,
        email,
      } as User);
      console.log(`Onboarding email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send onboarding email to ${email}:`, error);
    }
  }
}
