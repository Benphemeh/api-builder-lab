import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { modelInstances } from 'src/core/model-instances';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ...modelInstances],
  exports: [UsersService],
})
export class UsersModule {}
