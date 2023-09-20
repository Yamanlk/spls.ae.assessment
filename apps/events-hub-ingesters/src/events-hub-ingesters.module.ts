import { Module } from '@nestjs/common';
import { EventsHubIngestersController } from './events-hub-ingesters.controller';
import { EventsHubIngestersService } from './events-hub-ingesters.service';

@Module({
  imports: [],
  controllers: [EventsHubIngestersController],
  providers: [EventsHubIngestersService],
})
export class EventsHubIngestersModule {}
