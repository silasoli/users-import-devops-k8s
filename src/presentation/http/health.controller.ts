import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../../infrastructure/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  getLiveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  async getReadiness() {
    return this.healthService.getReadiness();
  }
}
