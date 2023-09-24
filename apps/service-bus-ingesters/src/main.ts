import { NestFactory } from '@nestjs/core';
import { ServiceBusIngestersModule } from './service-bus-ingesters.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    ServiceBusIngestersModule,
  );
  app.enableShutdownHooks();
}
bootstrap();
