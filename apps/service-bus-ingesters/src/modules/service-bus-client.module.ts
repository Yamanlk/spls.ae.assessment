import { ServiceBusClientHooked } from '@app/clients';
import { DefaultAzureCredential } from '@azure/identity';
import { ServiceBusClient } from '@azure/service-bus';
import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SERVICE_BUS_CLIENT_PROVIDER: Provider<ServiceBusClient> = {
  provide: ServiceBusClient,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new ServiceBusClientHooked(
      `${configService.getOrThrow(
        'SERVICE_BUS_RESOURCE_NAME',
      )}.servicebus.windows.net`,
      new DefaultAzureCredential(),
    );
  },
};

@Global()
@Module({
  providers: [SERVICE_BUS_CLIENT_PROVIDER],
  exports: [SERVICE_BUS_CLIENT_PROVIDER],
})
export class ServiceBusClientModule {}
