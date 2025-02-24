import { Controller, Get } from '@nestjs/common';
import { ApiLoggerService } from './api-logger.service';

@Controller('logs')
export class ApiLoggerController {
  constructor(private logService: ApiLoggerService) {}

  @Get()
  async fetcAllLogs() {
    return await this.logService.fetchLogs();
  }

  @Get('activity')
  async fetchActivityLogs() {
    return await this.logService.fetchActivityLogs();
  }
}
