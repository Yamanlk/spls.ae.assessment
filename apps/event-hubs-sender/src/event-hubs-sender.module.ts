import { EventHubProducerClientHooked } from '@app/clients';
import { EventHubProducerClient } from '@azure/event-hubs';
import { DefaultAzureCredential } from '@azure/identity';
import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { EventHubsSenderController } from './event-hubs-sender.controller';
import { EventHubsSenderService } from './event-hubs-sender.service';

const EVENT_HUB_PRODUCER_CLIENT_PROVIDER: Provider<EventHubProducerClient> = {
  provide: EventHubProducerClient,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new EventHubProducerClientHooked(
      `${configService.getOrThrow(
        'EVENT_HUBS_RESOURCE_NAME',
      )}.servicebus.windows.net`,
      configService.getOrThrow('EVENT_HUBS_NAME'),
      new DefaultAzureCredential(),
    );
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        EVENT_HUBS_RESOURCE_NAME: Joi.string().required(),
        EVENT_HUBS_NAME: Joi.string().required(),
      }),
      validationOptions: { convert: true } as Joi.ValidationOptions,
    }),
  ],
  controllers: [EventHubsSenderController],
  providers: [EventHubsSenderService, EVENT_HUB_PRODUCER_CLIENT_PROVIDER],
})
export class EventHubsSenderModule {}
