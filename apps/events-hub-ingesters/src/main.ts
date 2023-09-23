import { NestFactory } from '@nestjs/core';
import { EventsHubIngestersModule } from './events-hub-ingesters.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    EventsHubIngestersModule,
    {},
  );
  app.enableShutdownHooks();
}
bootstrap();
