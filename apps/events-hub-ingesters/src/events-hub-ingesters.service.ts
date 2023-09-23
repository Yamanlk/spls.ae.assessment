import {
  EventHubConsumerClient,
  earliestEventPosition,
} from '@azure/event-hubs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EnqueueService } from './enqueue-services/enqueue.service';

@Injectable()
export class EventsHubIngestersService implements OnModuleInit {
  private readonly logger = new Logger(EventsHubIngestersService.name);

  constructor(
    private readonly eventHubConsumerClient: EventHubConsumerClient,
    private readonly enqueueService: EnqueueService,
  ) {}

  onModuleInit() {
    this.eventHubConsumerClient.subscribe(
      {
        processError: async (error, context) =>
          this.logger.error({
            message: `Process Error on partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`,
            cause: error,
          }),
        processEvents: async (events, context) => {
          if (events.length === 0) {
            this.logger.debug(
              `No events received within wait time from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'. Waiting for next interval`,
            );
            return;
          }

          this.logger.debug(
            `partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}' received ${events.length} events`,
          );

          await this.enqueueService.enqueueMessages(
            events.map((event) => event.body),
          );

          await context.updateCheckpoint(events[events.length - 1]);
        },
        processClose: async (reason, context) => {
          this.logger.debug({
            message: `Process Close partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`,
            reason,
          });
        },
        processInitialize: async (context) => {
          this.logger.debug({
            message: `Process Initialize on partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`,
          });
        },
      },
      { startPosition: earliestEventPosition },
    );
  }
}
