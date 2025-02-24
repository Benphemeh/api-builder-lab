import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/core/database/database.module';
import { ApiLoggerController } from './api-logger.controller';
import { ApiLoggerService } from './api-logger.service';
import { modelInstances } from 'src/core/model-instances';

@Module({
  imports: [DatabaseModule],
  controllers: [ApiLoggerController],
  providers: [ApiLoggerService, ...modelInstances],
  exports: [ApiLoggerService],
})
export class ApiLoggerModule {}
