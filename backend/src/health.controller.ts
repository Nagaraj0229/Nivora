import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get() check() {
    const database = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    return { status: database === 'connected' ? 'ok' : 'degraded', service: 'nivora-api', database, timestamp: new Date().toISOString() };
  }
}
