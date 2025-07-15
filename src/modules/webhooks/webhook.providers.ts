import { REPOSITORY } from 'src/core/constants';
import WebhookEvent from 'src/core/database/models/webhook.model';

export const webhookProviders = [
  {
    provide: REPOSITORY.WEBHOOK_EVENT,
    useValue: WebhookEvent,
  },
];
