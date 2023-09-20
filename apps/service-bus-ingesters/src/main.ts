import { NestFactory } from '@nestjs/core';
import { ServiceBusIngestersModule } from './service-bus-ingesters.module';

async function bootstrap() {
  const app = await NestFactory.create(ServiceBusIngestersModule);
  await app.listen(3000);
}
bootstrap();
