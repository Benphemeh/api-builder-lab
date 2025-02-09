import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { modelInstances } from 'src/core/model-instances';
import { MailService } from 'src/core/mail/mail.service';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRATION },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ...modelInstances,
    MailService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
