import { EventHubProducerClient } from '@azure/event-hubs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventHubsSenderService {
  constructor(
    private readonly eventHubProducerClient: EventHubProducerClient,
  ) {}

  async send(body: any) {
    const batch = await this.eventHubProducerClient.createBatch();
    batch.tryAdd({ body });

    await this.eventHubProducerClient.sendBatch(batch);
  }
}
