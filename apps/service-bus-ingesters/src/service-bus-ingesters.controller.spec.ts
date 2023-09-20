import { Test, TestingModule } from '@nestjs/testing';
import { ServiceBusIngestersController } from './service-bus-ingesters.controller';
import { ServiceBusIngestersService } from './service-bus-ingesters.service';

describe('ServiceBusIngestersController', () => {
  let serviceBusIngestersController: ServiceBusIngestersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ServiceBusIngestersController],
      providers: [ServiceBusIngestersService],
    }).compile();

    serviceBusIngestersController = app.get<ServiceBusIngestersController>(ServiceBusIngestersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(serviceBusIngestersController.getHello()).toBe('Hello World!');
    });
  });
});
