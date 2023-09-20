import { Controller, Get } from '@nestjs/common';
import { EventsHubIngestersService } from './events-hub-ingesters.service';

@Controller()
export class EventsHubIngestersController {
  constructor(private readonly eventsHubIngestersService: EventsHubIngestersService) {}

  @Get()
  getHello(): string {
    return this.eventsHubIngestersService.getHello();
  }
}
