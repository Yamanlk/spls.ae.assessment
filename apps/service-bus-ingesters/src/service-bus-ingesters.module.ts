import { Module } from '@nestjs/common';
import { ServiceBusIngestersController } from './service-bus-ingesters.controller';
import { ServiceBusIngestersService } from './service-bus-ingesters.service';

@Module({
  imports: [],
  controllers: [ServiceBusIngestersController],
  providers: [ServiceBusIngestersService],
})
export class ServiceBusIngestersModule {}
