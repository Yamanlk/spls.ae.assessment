import { ServiceBusSender } from '@azure/service-bus';
import { DynamicModule, FactoryProvider, Logger, Module } from '@nestjs/common';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  InjectServiceBusSender,
  getServiceBusSenderInjectionToken,
} from './service-bus-sender.decorator';

@Module({})
export class ServiceBusSenderModule {
  private static readonly logger = new Logger(ServiceBusSenderModule.name);

  /**
   * @description registers a {@link ServiceBusSender} for the given name,
   * you can inject the sender by using {@link InjectServiceBusSender('default')}
   * @example
   * constructor(
   *    @InjectServiceBusSender('default')
   *    private readonly serviceBusSender: ServiceBusSender,
   * ) {}
   * @param options
   * @returns
   */

  public static registerAsync(
    options: Omit<FactoryProvider<ServiceBusSender>, 'provide'> & {
      global: boolean;
      name: string;
      /**
       * @description checks if queue exists before bootstrapping the module
       */
      checkQueue?: boolean;
    },
  ): DynamicModule {
    return {
      module: ServiceBusSenderModule,
      global: options.global,
      providers: [
        {
          provide: getServiceBusSenderInjectionToken(options.name),
          ...options,
          useFactory: options.checkQueue
            ? async (...args) => {
                const sender = await options.useFactory(...args);

                // create abort controller to abort batch request once succeeded;
                const abortController = new AbortController();

                // try to create a message batch, if it fails then
                // it will throw error and hault the process execution
                this.logger.debug(`checking queue '${sender.entityPath}'`);
                await sender.createMessageBatch({
                  abortSignal: abortController.signal,
                });

                // if it succeeds then abort the batch
                this.logger.debug(
                  `queue '${sender.entityPath}' exists with correct access`,
                );
                abortController.abort();

                return sender;
              }
            : options.useFactory,
        },
      ],
      exports: [getServiceBusSenderInjectionToken(options.name)],
    };
  }
}
