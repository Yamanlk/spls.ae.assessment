import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsHubIngestersService {
  getHello(): string {
    return 'Hello World!';
  }
}
