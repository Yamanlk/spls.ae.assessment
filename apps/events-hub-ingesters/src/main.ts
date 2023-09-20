import { NestFactory } from '@nestjs/core';
import { EventsHubIngestersModule } from './events-hub-ingesters.module';

async function bootstrap() {
  const app = await NestFactory.create(EventsHubIngestersModule);
  await app.listen(3000);
}
bootstrap();
