import { Controller, Get } from '@nestjs/common';
import { ServiceBusIngestersService } from './service-bus-ingesters.service';

@Controller()
export class ServiceBusIngestersController {
  constructor(private readonly serviceBusIngestersService: ServiceBusIngestersService) {}

  @Get()
  getHello(): string {
    return this.serviceBusIngestersService.getHello();
  }
}
