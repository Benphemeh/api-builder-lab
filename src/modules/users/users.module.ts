import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { usersProviders } from './users.providers';
import { MailModule } from 'src/core/mail/mail.module';

@Module({
  imports: [
    MailModule,
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mySecretKeyHere',
      signOptions: { expiresIn: process.env.TOKEN_EXPIRATION || '48h' },
    }),
  ],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, ...usersProviders],
  exports: [UsersService],
})
export class UsersModule {}
