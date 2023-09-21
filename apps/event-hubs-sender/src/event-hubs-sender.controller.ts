import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { EventHubsSenderService } from './event-hubs-sender.service';

@Controller()
export class EventHubsSenderController {
  constructor(
    private readonly eventHubsSenderService: EventHubsSenderService,
  ) {}

  @Get('send')
  @ApiResponse({})
  send(): Promise<void> {
    return this.eventHubsSenderService.send();
  }
}
