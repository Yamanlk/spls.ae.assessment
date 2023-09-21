import { EventHubProducerClient } from '@azure/event-hubs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventHubsSenderService {
  constructor(
    private readonly eventHubProducerClient: EventHubProducerClient,
  ) {}

  async send() {
    const batch = await this.eventHubProducerClient.createBatch();
    batch.tryAdd({ body: 'passwordless First event' });

    await this.eventHubProducerClient.sendBatch(batch);
  }
}
