import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { EventHubsSenderService } from './event-hubs-sender.service';

@Controller()
export class EventHubsSenderController {
  constructor(
    private readonly eventHubsSenderService: EventHubsSenderService,
  ) {}

  @Post('send')
  @ApiResponse({})
  @ApiBody({ schema: { type: 'object' } })
  send(@Body() body: any): Promise<void> {
    return this.eventHubsSenderService.send(body);
  }
}
