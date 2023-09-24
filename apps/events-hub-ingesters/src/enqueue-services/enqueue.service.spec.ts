import { getServiceBusSenderInjectionToken } from '@app/clients';
import { EventHubsEvent, MessageType } from '@app/dto';
import { ServiceBusSender } from '@azure/service-bus';
import { Test, TestingModule } from '@nestjs/testing';
import { EnqueueService } from './enqueue.service';

const MOCK_SERVICE_BUS_SENDER_FACTORY: () => Partial<ServiceBusSender> =
  () => ({
    createMessageBatch: jest.fn(async () => ({
      tryAddMessage: jest.fn(() => true),
      count: 0,
      maxSizeInBytes: 0,
      sizeInBytes: 0,
    })),
    sendMessages: jest.fn(),
  });

describe('EnqueueService', () => {
  let module: TestingModule;
  let enqueueService: EnqueueService;
  let messageASender: ServiceBusSender;
  let messageBSender: ServiceBusSender;
  let messageCSender: ServiceBusSender;
  let errorSender: ServiceBusSender;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [EnqueueService],
    })
      .useMocker((token) => {
        if (token === getServiceBusSenderInjectionToken(MessageType.TypeA)) {
          return MOCK_SERVICE_BUS_SENDER_FACTORY();
        }
        if (token === getServiceBusSenderInjectionToken(MessageType.TypeB)) {
          return MOCK_SERVICE_BUS_SENDER_FACTORY();
        }
        if (token === getServiceBusSenderInjectionToken(MessageType.TypeC)) {
          return MOCK_SERVICE_BUS_SENDER_FACTORY();
        }
        if (token === getServiceBusSenderInjectionToken('error')) {
          return MOCK_SERVICE_BUS_SENDER_FACTORY();
        }
      })
      .compile();

    enqueueService = await module.resolve(EnqueueService);
    messageASender = await module.resolve(
      getServiceBusSenderInjectionToken(MessageType.TypeA),
    );
    messageBSender = await module.resolve(
      getServiceBusSenderInjectionToken(MessageType.TypeB),
    );
    messageCSender = await module.resolve(
      getServiceBusSenderInjectionToken(MessageType.TypeC),
    );
    errorSender = await module.resolve(
      getServiceBusSenderInjectionToken('error'),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should queue type a message', async () => {
    // given
    const events: EventHubsEvent[] = [{ type: MessageType.TypeA }];

    // when
    await enqueueService.enqueueMessages(events);

    // then
    expect(messageASender.createMessageBatch).toHaveBeenCalled();
    expect(messageASender.sendMessages).toHaveBeenCalled();
  });
  it('should queue type b message', async () => {
    // given
    const events: EventHubsEvent[] = [{ type: MessageType.TypeB }];

    // when
    await enqueueService.enqueueMessages(events);

    // then
    expect(messageBSender.createMessageBatch).toHaveBeenCalled();
    expect(messageBSender.sendMessages).toHaveBeenCalled();
  });
  it('should queue type c message', async () => {
    // given
    const events: EventHubsEvent[] = [{ type: MessageType.TypeC }];

    // when
    await enqueueService.enqueueMessages(events);

    // then
    expect(messageCSender.createMessageBatch).toHaveBeenCalled();
    expect(messageCSender.sendMessages).toHaveBeenCalled();
  });
  it('should queue error message', async () => {
    // given
    const events: any[] = [{ i: 'error' }, { type: 'errormessages' }];

    // when
    await enqueueService.enqueueMessages(events);

    // then
    expect(errorSender.createMessageBatch).toHaveBeenCalled();
    expect(errorSender.sendMessages).toHaveBeenCalled();
  });
  it('should queue multiple messages correctly', async () => {
    // given
    const events: (EventHubsEvent | unknown)[] = [
      { type: MessageType.TypeA },
      { type: MessageType.TypeB },
      { type: MessageType.TypeC },
      { type: 'invalidtype' },
      { invalidProperty: 'invalidtype' },
    ];

    // when
    await enqueueService.enqueueMessages(events);

    // then
    expect(messageASender.createMessageBatch).toHaveBeenCalled();
    expect(messageASender.sendMessages).toHaveBeenCalled();
    expect(messageBSender.createMessageBatch).toHaveBeenCalled();
    expect(messageBSender.sendMessages).toHaveBeenCalled();
    expect(messageCSender.createMessageBatch).toHaveBeenCalled();
    expect(messageCSender.sendMessages).toHaveBeenCalled();
    expect(errorSender.createMessageBatch).toHaveBeenCalled();
    expect(errorSender.sendMessages).toHaveBeenCalled();
  });
});
