import { Test, TestingModule } from '@nestjs/testing';
import { EventsHubIngestersController } from './events-hub-ingesters.controller';
import { EventsHubIngestersService } from './events-hub-ingesters.service';

describe('EventsHubIngestersController', () => {
  let eventsHubIngestersController: EventsHubIngestersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventsHubIngestersController],
      providers: [EventsHubIngestersService],
    }).compile();

    eventsHubIngestersController = app.get<EventsHubIngestersController>(EventsHubIngestersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(eventsHubIngestersController.getHello()).toBe('Hello World!');
    });
  });
});
