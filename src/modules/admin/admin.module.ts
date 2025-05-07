import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { adminProviders } from './admin.provider';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRATION },
    }),
  ],
  controllers: [AdminController],
  providers: [...adminProviders],
})
export class AdminModule {}
