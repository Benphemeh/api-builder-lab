import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../guards/jwt.strategy';
import { modelInstances } from 'src/core/model-instances';
import { MailService } from 'src/core/mail/mail.service';
import { MailModule } from 'src/core/mail/mail.module';
import { LocalStrategy } from '../guards/local.strategy';

@Module({
  imports: [
    MailModule,
    PassportModule,
    forwardRef(() => UsersModule),
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
    JwtService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
