import { Inject } from '@nestjs/common';

const SERVICE_BUS_RECEIVER_INJECTION_TOKEN = 'SERVICE_BUS_RECEIVER';

export const getServiceBusReceiverInjectionToken = (queue: string) => {
  return `${SERVICE_BUS_RECEIVER_INJECTION_TOKEN}/${queue}`;
};

export const InjectServiceBusReceiver = (queue: string) =>
  Inject(getServiceBusReceiverInjectionToken(queue));
