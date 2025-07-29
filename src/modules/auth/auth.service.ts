import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Op } from 'sequelize';
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

    // send confirmation email
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
  async requestEmailVerification(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isEmailVerified) return { message: 'Email already verified' };

    const token = crypto.randomBytes(6).toString('hex');
    user.emailVerificationToken = token;
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await this.mailService.sendEmailVerification(
      user.email,
      user.firstName,
      verificationUrl,
      token,
    );

    return { message: 'Verification email sent' };
  }
  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    await this.mailService.sendEmailVerified(user.email, user.firstName);

    return { message: 'Email verified ' };
  }
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const token = crypto.randomBytes(6).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.mailService.sendPasswordReset(
      user.email,
      user.firstName,
      resetUrl,
      token,
    );

    return { message: 'Password reset email sent' };
  }
  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');

    user.password = await this.hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: 'Password has been reset successfully' };
  }
}
