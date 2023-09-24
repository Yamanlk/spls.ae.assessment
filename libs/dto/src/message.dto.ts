import { Expose, Type } from '@nestjs/class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from '@nestjs/class-validator';
import { PickType } from '@nestjs/swagger';
import { EventHubsEvent } from './event-hubs.dto';
import { MessageType } from './message.enum';

@Expose()
export class MessageDTO extends PickType(EventHubsEvent, ['type']) {
  @IsDate()
  @Type(() => Date)
  enqueuedAt: Date;
}

@Expose()
export class MessageADTO extends MessageDTO {
  @IsString()
  propertyA: string;
}
@Expose()
export class MessageBDTO extends MessageDTO {
  @IsString()
  propertyB: string;
}
@Expose()
export class MessageCDTO extends MessageDTO {
  @IsString()
  propertyC: string;
}

/**
 * @description used to enable discriminator
 */
@Expose()
export class MessageHolderDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => MessageDTO, {
    discriminator: {
      property: 'type',
      subTypes: [
        {
          name: MessageType.TypeA,
          value: MessageADTO,
        },
        {
          name: MessageType.TypeB,
          value: MessageBDTO,
        },
        {
          name: MessageType.TypeC,
          value: MessageCDTO,
        },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  message: MessageADTO | MessageBDTO | MessageCDTO;
}
