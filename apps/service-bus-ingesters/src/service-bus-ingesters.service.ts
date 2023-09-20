import { Injectable } from '@nestjs/common';

@Injectable()
export class ServiceBusIngestersService {
  getHello(): string {
    return 'Hello World!';
  }
}
