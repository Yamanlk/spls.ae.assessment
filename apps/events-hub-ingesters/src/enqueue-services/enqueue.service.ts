import { InjectServiceBusSender } from '@app/clients';
import { EventHubsEvent, MessageType } from '@app/dto';
import { ServiceBusSender } from '@azure/service-bus';
import { plainToClass } from '@nestjs/class-transformer';
import { validate } from '@nestjs/class-validator';
import { Injectable, Logger } from '@nestjs/common';

type EnqueueServiceEvent =
  | EventHubsEvent
  | { type: 'error'; event: any; errors?: any };

@Injectable()
export class EnqueueService {
  private readonly logger = new Logger(EnqueueService.name);

  constructor(
    @InjectServiceBusSender(MessageType.TypeA)
    private readonly senderA: ServiceBusSender,
    @InjectServiceBusSender(MessageType.TypeB)
    private readonly senderB: ServiceBusSender,
    @InjectServiceBusSender(MessageType.TypeC)
    private readonly senderC: ServiceBusSender,
    @InjectServiceBusSender('error')
    private readonly errorSender: ServiceBusSender,
  ) {}

  async enqueueMessages(messages: (EventHubsEvent | unknown)[]): Promise<void> {
    const transformedMessages = await Promise.all(
      messages.map((message) => this._transformAndValidate(message)),
    );

    // groups messages by type to send them in batches to the correct queues
    const messagesByType = transformedMessages.reduce<
      Record<MessageType | 'error', EnqueueServiceEvent[]>
    >(
      (pre, curr) => {
        pre[curr.type].push(curr);
        return pre;
      },
      {
        [MessageType.TypeA]: [],
        [MessageType.TypeB]: [],
        [MessageType.TypeC]: [],
        error: [],
      },
    );

    await Promise.all(
      Object.entries(messagesByType).map(([key, value]) => {
        return this._send(key as MessageType, value);
      }),
    );
  }

  /**
   * @description sends messages of the same type to the correct queue based on the type.
   * @param type message type
   * @param messages messages to send, all messages should be of the same type.
   */
  private async _send(
    type: MessageType | 'error',
    messages: EnqueueServiceEvent[],
  ) {
    // ignore empty message arrays
    if (messages.length === 0) {
      return;
    }
    const sender = this.getSenderByType(type);

    let batch = await sender.createMessageBatch();

    for (const message of messages) {
      if (!batch.tryAddMessage({ body: message })) {
        // Send the current batch as it is full and create a new one
        this.logger.debug(
          `sending ${batch.count} messages to ${sender.entityPath}`,
        );
        await sender.sendMessages(batch);
        this.logger.debug(
          `sent ${batch.count} messages to ${sender.entityPath}`,
        );
        batch = await sender.createMessageBatch();

        if (!batch.tryAddMessage({ body: message })) {
          // this error cannot be handled gracefully since the message
          // cannot be sent to the error queue or any other queue
          throw new Error('Message too big to fit in a batch');
        }
      }

      // Send the last created batch of messages to the queue
      await sender.sendMessages(batch);
    }
  }

  /**
   * @description returnes the correct sender based on the type of the message
   * @param type
   * @returns
   */
  private getSenderByType(type: MessageType | 'error') {
    switch (type) {
      case MessageType.TypeA:
        return this.senderA;
      case MessageType.TypeB:
        return this.senderB;
      case MessageType.TypeC:
        return this.senderC;
      case 'error':
      default:
        return this.errorSender;
    }
  }

  /**
   * @description validates only the required fields for the enqueue service
   * to queue the message in the correct queue, doesn't validate other properties
   * @param rawEvent
   * @returns
   */
  private async _transformAndValidate(
    rawEvent: EventHubsEvent | unknown,
  ): Promise<EnqueueServiceEvent> {
    if (typeof rawEvent !== 'object') {
      return {
        event: rawEvent,
        type: 'error',
      };
    }

    const event = plainToClass(EventHubsEvent, rawEvent);

    const errors = await validate(event, {});

    if (errors.length > 0) {
      return {
        event,
        type: 'error',
        errors,
      };
    }

    return event;
  }
}
