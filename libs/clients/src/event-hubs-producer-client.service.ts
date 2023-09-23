import { EventHubProducerClient } from '@azure/event-hubs';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

/**
 * @description don't use directly, instead inject and use {@link EventHubProducerClient},
 * This instnace provides support for life cycle hooks, and closed the amqp connection on module destroy
 *
 * @example
 * const EVENT_HUB_PRODUCER_CLIENT_PROVIDER: Provider<EventHubProducerClient> = {
 *   provide: EventHubProducerClient,
 *   inject: [ConfigService],
 *   useFactory: (configService: ConfigService) => {
 *     return new EventHubProducerClientHooked(
 *       `${configService.getOrThrow(
 *         'EVENT_HUBS_RESOURCE_NAME',
 *       )}.servicebus.windows.net`,
 *       configService.getOrThrow('EVENT_HUBS_NAME'),
 *       new DefaultAzureCredential(),
 *     );
 *   },
 * }
 */
@Injectable()
export class EventHubProducerClientHooked
  extends EventHubProducerClient
  implements OnModuleDestroy
{
  private readonly logger = new Logger(EventHubProducerClientHooked.name);

  async onModuleDestroy() {
    this.logger.debug('closing amqp connection');
    await this.close();
    this.logger.debug('closed amqp connection');
  }
}
