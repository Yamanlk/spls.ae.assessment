import { ServiceBusReceiverModule, ServiceBusSenderModule } from '@app/clients';
import { MessageType } from '@app/dto';
import { ServiceBusClient } from '@azure/service-bus';
import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client/service-bus-ingesters';
import * as Joi from 'joi';
import { ServiceBusClientModule } from './modules/service-bus-client.module';
import { ServiceBusIngestersService } from './service-bus-ingesters.service';

const PRISMA_PROVIDER: Provider<PrismaClient> = {
  provide: PrismaClient,
  useFactory: () => {
    const prisma = new PrismaClient();

    // connect on module init instead of a cold start
    prisma['onModuleInit'] = async () => {
      await prisma.$connect();
    };
    return prisma;
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        SERVICE_BUS_RESOURCE_NAME: Joi.string().required(),
        MESSAGE_TYPE_A_QUEUE: Joi.string().required(),
        MESSAGE_TYPE_B_QUEUE: Joi.string().required(),
        MESSAGE_TYPE_C_QUEUE: Joi.string().required(),
        MESSAGE_VALIDATION_ERROR_QUEUE: Joi.string().required(),
      }),
      validationOptions: { convert: true } as Joi.ValidationOptions,
    }),
    ServiceBusClientModule,

    // register receiver A for queue type A
    ServiceBusReceiverModule.registerAsync({
      global: true,
      name: MessageType.TypeA,
      inject: [ServiceBusClient, ConfigService],
      checkQueue: true,
      useFactory: (client: ServiceBusClient, configService: ConfigService) => {
        return client.createReceiver(
          configService.get('MESSAGE_TYPE_A_QUEUE'),
          { receiveMode: 'peekLock' },
        );
      },
    }),
    // register receiver B for queue type B
    ServiceBusReceiverModule.registerAsync({
      global: true,
      name: MessageType.TypeB,
      inject: [ServiceBusClient, ConfigService],
      checkQueue: true,
      useFactory: (client: ServiceBusClient, configService: ConfigService) => {
        return client.createReceiver(
          configService.get('MESSAGE_TYPE_B_QUEUE'),
          { receiveMode: 'peekLock' },
        );
      },
    }),
    // register receiver C for queue type C
    ServiceBusReceiverModule.registerAsync({
      global: true,
      name: MessageType.TypeC,
      inject: [ServiceBusClient, ConfigService],
      checkQueue: true,
      useFactory: (client: ServiceBusClient, configService: ConfigService) => {
        return client.createReceiver(
          configService.get('MESSAGE_TYPE_C_QUEUE'),
          {
            receiveMode: 'peekLock',
          },
        );
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
  providers: [ServiceBusIngestersService, PRISMA_PROVIDER],
})
export class ServiceBusIngestersModule {}
