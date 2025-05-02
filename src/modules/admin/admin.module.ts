import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { adminProviders } from './admin.provider';

@Module({
  controllers: [AdminController],
  providers: [...adminProviders],
})
export class AdminModule {}
