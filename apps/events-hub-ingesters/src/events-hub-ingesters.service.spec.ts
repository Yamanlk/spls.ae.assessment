import { EventHubConsumerClient } from '@azure/event-hubs';
import { Test, TestingModule } from '@nestjs/testing';
import { EnqueueService } from './enqueue-services/enqueue.service';
import { EventsHubIngestersService } from './events-hub-ingesters.service';

describe('EventsHubIngestersService', () => {
  let module: TestingModule;
  let eventsHubIngestersService: EventsHubIngestersService;
  let eventHubConsumerClient: EventHubConsumerClient;
  let enqueueService: EnqueueService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [EventsHubIngestersService],
    })
      .useMocker((token) => {
        if (token === EnqueueService) {
          return {
            enqueueMessages: jest.fn(async () => {}),
          };
        }

        if (token === EventHubConsumerClient) {
          return {
            subscribe: jest.fn(),
          } as Partial<EventHubConsumerClient>;
        }

        if (typeof token === 'string') {
          return {};
        }
      })
      .compile();

    eventHubConsumerClient = await module.resolve(EventHubConsumerClient);
    eventsHubIngestersService = await module.resolve(EventsHubIngestersService);
    enqueueService = await module.resolve(EnqueueService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should subscribe on module init', async () => {
    // given

    // when
    eventsHubIngestersService.onModuleInit();

    // then
    expect(eventHubConsumerClient.subscribe).toHaveBeenCalled();
  });

  it('should subscribe on module init', async () => {
    // given
    const spyOnSubscribe = jest.spyOn(eventHubConsumerClient, 'subscribe');
    const spyOnEnqueueMessages = jest.spyOn(enqueueService, 'enqueueMessages');
    const spyOnUpdateCheckpoint = jest.fn();

    // when
    eventsHubIngestersService.onModuleInit();
    await spyOnSubscribe.mock.calls[0][0]['processEvents']([{ body: {} }], {
      updateCheckpoint: spyOnUpdateCheckpoint,
    });

    // then
    expect(spyOnSubscribe).toHaveBeenCalled();
    expect(spyOnEnqueueMessages).toHaveBeenCalled();
    expect(spyOnUpdateCheckpoint).toHaveBeenCalled();
  });
});
