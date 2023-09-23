import { Expose, Type } from '@nestjs/class-transformer';
import { IsEnum, IsNotEmpty } from '@nestjs/class-validator';
import { MessageType } from './message.enum';

@Expose()
export class EventHubsEvent {
  @IsEnum(MessageType)
  @IsNotEmpty()
  @Type(() => String)
  type: MessageType;
}
