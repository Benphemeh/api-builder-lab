import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { adminProviders } from './admin.provider';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWTKEY, // same as token signing
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AdminController],
  providers: [...adminProviders],
})
export class AdminModule {}
