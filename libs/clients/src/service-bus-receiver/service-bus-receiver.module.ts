import { ServiceBusReceiver } from '@azure/service-bus';
import { DynamicModule, FactoryProvider, Logger, Module } from '@nestjs/common';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  InjectServiceBusReceiver,
  getServiceBusReceiverInjectionToken,
} from './service-bus-receiver.decorator';

@Module({})
export class ServiceBusReceiverModule {
  private static readonly logger = new Logger(ServiceBusReceiverModule.name);

  /**
   * @description registers a {@link ServiceBusReceiver} for the given name,
   * you can inject the receiver by using {@link InjectServiceBusReceiver('default')}
   * @example
   * constructor(
   *    @InjectServiceBusReceiver('default')
   *    private readonly serviceBusReceiver: ServiceBusReceiver,
   * ) {}
   * @param options
   * @returns
   */

  public static registerAsync(
    options: Omit<FactoryProvider<ServiceBusReceiver>, 'provide'> & {
      global: boolean;
      name: string;
      /**
       * @description checks if queue exists before bootstrapping the module
       */
      checkQueue?: boolean;
    },
  ): DynamicModule {
    return {
      module: ServiceBusReceiverModule,
      global: options.global,
      providers: [
        {
          provide: getServiceBusReceiverInjectionToken(options.name),
          ...options,
          useFactory: options.checkQueue
            ? async (...args) => {
                const receiver = await options.useFactory(...args);

                // create abort controller to abort batch request once succeeded;
                const abortController = new AbortController();

                // try to peek a message without deleting it from the queue, if it fails then
                // it will throw error and hault the process execution
                this.logger.debug(`checking queue '${receiver.entityPath}'`);
                await receiver.peekMessages(1, {
                  abortSignal: abortController.signal,
                });

                // if it succeeds then abort the batch
                this.logger.debug(
                  `queue '${receiver.entityPath}' exists with correct access`,
                );
                abortController.abort();

                return receiver;
              }
            : options.useFactory,
        },
      ],
      exports: [getServiceBusReceiverInjectionToken(options.name)],
    };
  }
}
