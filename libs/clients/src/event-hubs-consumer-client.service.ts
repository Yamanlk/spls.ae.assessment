import { EventHubConsumerClient } from '@azure/event-hubs';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

/**
 * @description don't use directly, instead inject and use {@link EventHubConsumerClient},
 * This instnace provides support for life cycle hooks, and closed the amqp connection on module destroy
 *
 * @example
 * const EVENT_HUB_CONSUMER_CLIENT_PROVIDER: Provider<EventHubConsumerClient> = {
 *   provide: EventHubConsumerClient,
 *   inject: [ConfigService],
 *   useFactory: (configService: ConfigService) => {
 *     const credential = new DefaultAzureCredential();
 *     return new EventHubConsumerClientHooked(
 *       configService.get('CONSUMER_GROUP'),
 *       `${configService.getOrThrow(
 *         'EVENT_HUBS_RESOURCE_NAME',
 *       )}.servicebus.windows.net`,
 *      configService.getOrThrow('EVENT_HUBS_NAME'),
 *      credential,
 *      new BlobCheckpointStore(
 *        new ContainerClient(
 *          `https://${configService.get(
 *            'STORAGE_ACCOUNT_NAME',
 *          )}.blob.core.windows.net/${configService.get(
 *            'STORAGE_CONTAINER_NAME',
 *          )}`,
 *          credential,
 *        ),
 *      ),
 *    );
 *  },
 * };
 */
@Injectable()
export class EventHubConsumerClientHooked
  extends EventHubConsumerClient
  implements OnModuleDestroy
{
  private readonly logger = new Logger(EventHubConsumerClientHooked.name);

  async onModuleDestroy() {
    this.logger.debug('closing amqp connection');
    await this.close();
    this.logger.debug('closed amqp connection');
  }
}
