import { ServiceBusClient } from '@azure/service-bus';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

/**
 * @description don't use directly, instead inject and use {@link ServiceBusClient},
 * This instnace provides support for life cycle hooks, and closed the amqp connection on module destroy
 *
 * @example
 */
@Injectable()
export class ServiceBusClientHooked
  extends ServiceBusClient
  implements OnModuleDestroy
{
  private readonly logger = new Logger(ServiceBusClientHooked.name);

  async onModuleDestroy() {
    this.logger.debug('closing amqp connection');
    await this.close();
    this.logger.debug('closed amqp connection');
  }
}
