import { EventHubConsumerClientHooked } from '@app/clients';
import { ServiceBusSenderModule } from '@app/clients/service-bus-sender/service-bus-sender.module';
import { MessageType } from '@app/dto/message.enum';
import { EventHubConsumerClient } from '@azure/event-hubs';
import { BlobCheckpointStore } from '@azure/eventhubs-checkpointstore-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { ServiceBusClient } from '@azure/service-bus';
import { ContainerClient } from '@azure/storage-blob';
import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { EnqueueService } from './enqueue-services/enqueue.service';
import { EventsHubIngestersService } from './events-hub-ingesters.service';
import { ServiceBusClientModule } from './modules/service-bus-client.module';

const EVENT_HUB_CONSUMER_CLIENT_PROVIDER: Provider<EventHubConsumerClient> = {
  provide: EventHubConsumerClient,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const credential = new DefaultAzureCredential();

    return new EventHubConsumerClientHooked(
      configService.get('CONSUMER_GROUP'),
      `${configService.getOrThrow(
        'EVENT_HUBS_RESOURCE_NAME',
      )}.servicebus.windows.net`,
      configService.getOrThrow('EVENT_HUBS_NAME'),
      credential,
      new BlobCheckpointStore(
        new ContainerClient(
          `https://${configService.get(
            'STORAGE_ACCOUNT_NAME',
          )}.blob.core.windows.net/${configService.get(
            'STORAGE_CONTAINER_NAME',
          )}`,
          credential,
        ),
      ),
    );
  },
};

@Module({
  imports: [
    ServiceBusClientModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        CONSUMER_GROUP: Joi.string().required(),
        EVENT_HUBS_RESOURCE_NAME: Joi.string().required(),
        EVENT_HUBS_NAME: Joi.string().required(),
        STORAGE_ACCOUNT_NAME: Joi.string().required(),
        STORAGE_CONTAINER_NAME: Joi.string().required(),
        SERVICE_BUS_RESOURCE_NAME: Joi.string().required(),
      }),
      validationOptions: { convert: true } as Joi.ValidationOptions,
    }),

    // register sender A for queue type A
    ServiceBusSenderModule.registerAsync({
      global: true,
      name: MessageType.TypeA,
      inject: [ServiceBusClient, ConfigService],
      checkQueue: true,
      useFactory: (client: ServiceBusClient, configService: ConfigService) => {
        return client.createSender(configService.get('MESSAGE_TYPE_A_QUEUE'));
      },
    }),
    // register sender B for queue type B
    ServiceBusSenderModule.registerAsync({
      global: true,
      name: MessageType.TypeB,
      inject: [ServiceBusClient, ConfigService],
      checkQueue: true,
      useFactory: (client: ServiceBusClient, configService: ConfigService) => {
        return client.createSender(configService.get('MESSAGE_TYPE_B_QUEUE'));
      },
    }),
    // register sender C for queue type C
    ServiceBusSenderModule.registerAsync({
      global: true,
      name: MessageType.TypeC,
      inject: [ServiceBusClient, ConfigService],
      checkQueue: true,
      useFactory: (client: ServiceBusClient, configService: ConfigService) => {
        return client.createSender(configService.get('MESSAGE_TYPE_C_QUEUE'));
      },
    }),
    // register sender for validation errors
    ServiceBusSenderModule.registerAsync({
      global: true,
      name: 'error',
      inject: [ServiceBusClient, ConfigService],
      checkQueue: true,
      useFactory: (client: ServiceBusClient, configService: ConfigService) => {
        return client.createSender(
          configService.get('MESSAGE_VALIDATION_ERROR_QUEUE'),
        );
      },
    }),
  ],
  providers: [
    EventsHubIngestersService,
    EVENT_HUB_CONSUMER_CLIENT_PROVIDER,
    EnqueueService,
  ],
})
export class EventsHubIngestersModule {}
