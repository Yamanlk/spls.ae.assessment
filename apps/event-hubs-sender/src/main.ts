import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EventHubsSenderModule } from './event-hubs-sender.module';

async function bootstrap() {
  const app = await NestFactory.create(EventHubsSenderModule);

  const config = new DocumentBuilder()
    .setTitle('slps.ae')
    .setDescription('slps.ae assessment')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // enable closing connections before shutting down the application.
  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
