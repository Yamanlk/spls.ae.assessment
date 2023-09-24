import { InjectServiceBusReceiver, InjectServiceBusSender } from '@app/clients';
import { ErrorMessageDTO, MessageType } from '@app/dto';
import { MessageDTO, MessageHolderDTO } from '@app/dto/message.dto';
import { ServiceBusReceiver, ServiceBusSender } from '@azure/service-bus';
import { plainToClass } from '@nestjs/class-transformer';
import { validate } from '@nestjs/class-validator';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/service-bus-ingesters';

@Injectable()
export class ServiceBusIngestersService implements OnModuleInit {
  private readonly logger = new Logger(ServiceBusIngestersService.name);

  constructor(
    private readonly prisma: PrismaClient,
    @InjectServiceBusReceiver(MessageType.TypeA)
    private readonly receiverA: ServiceBusReceiver,
    @InjectServiceBusReceiver(MessageType.TypeB)
    private readonly receiverB: ServiceBusReceiver,
    @InjectServiceBusReceiver(MessageType.TypeC)
    private readonly receiverC: ServiceBusReceiver,
    @InjectServiceBusSender('error')
    private readonly errorSender: ServiceBusSender,
  ) {}

  onModuleInit() {
    // add subscription handler for each message type
    Object.values(MessageType).forEach((type) => {
      this.subscribeTo(type);
    });
  }

  subscribeTo(type: MessageType) {
    const receiver = this.receiverFor(type);

    if (!receiver) {
      return;
    }

    this.logger.debug(`subscribed to queue '${receiver.entityPath}'`);

    receiver.subscribe({
      processError: async (args) => {
        this.logger.error({
          message: `Process Error from queue: '${args.entityPath}'`,
          error: args.error,
          errorSource: args.errorSource,
        });
      },
      processMessage: async (message) => {
        this.logger.debug(
          `message from ${this.receiverA.entityPath} '${JSON.stringify(
            message.body,
          )}'`,
        );

        try {
          const validatedMessage = await this.validateAndTransform({
            ...message.body,
            enqueuedAt: message.enqueuedTimeUtc,
          });

          await this.prisma.message.create({ data: validatedMessage });
        } catch (errorMessage) {
          // todo handle different errors.

          if (errorMessage instanceof ErrorMessageDTO) {
            await this.errorSender.sendMessages([
              { body: errorMessage as ErrorMessageDTO },
            ]);
          }
        } finally {
          // delete message from the queue
          await this.receiverA.completeMessage(message);
        }
      },
    });
  }
  receiverFor(type: MessageType): ServiceBusReceiver | null {
    switch (type) {
      case MessageType.TypeA:
        return this.receiverA;
      case MessageType.TypeB:
        return this.receiverB;
      case MessageType.TypeC:
        return this.receiverC;

      default:
        this.logger.warn(
          `requested receiver for '${type}' but no receiver is registred`,
        );
        return null;
    }
  }

  /**
   * @description validates the message schema and throws if invalid
   * @throws a message to be queued in the error queue {@link ErrorMessageDTO}
   * @param rawMessage
   * @returns
   */
  private async validateAndTransform(
    rawMessage: Partial<MessageDTO> | unknown,
  ): Promise<MessageDTO> {
    if (typeof rawMessage !== 'object') {
      throw plainToClass(ErrorMessageDTO, {
        type: 'error',
        source: rawMessage,
      });
    }

    const message = plainToClass(MessageHolderDTO, { message: rawMessage });

    const errors = await validate(message, {});

    if (errors.length > 0) {
      throw plainToClass(ErrorMessageDTO, {
        type: 'error',
        source: rawMessage,
        errors,
      });
    }

    return message.message;
  }
}
