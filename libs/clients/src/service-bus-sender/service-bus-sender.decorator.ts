import { Inject } from '@nestjs/common';

const SERVICE_BUS_SENDER_INJECTION_TOKEN = 'SERVICE_BUS_SENDER';

export const getServiceBusSenderInjectionToken = (queue: string) => {
  return `${SERVICE_BUS_SENDER_INJECTION_TOKEN}/${queue}`;
};

export const InjectServiceBusSender = (queue: string) =>
  Inject(getServiceBusSenderInjectionToken(queue));
