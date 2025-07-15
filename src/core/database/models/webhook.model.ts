import { Column, DataType } from 'sequelize-typescript';
import { ApiBuilderTable } from '../base-model/table-decorators';
import { BaseModel } from '../base-model';

@ApiBuilderTable({
  tableName: 'webhook_events',
  timestamps: true,
})
export default class WebhookEvent extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reference: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'event_type',
  })
  eventType: string;

  @Column({
    type: DataType.ENUM('pending', 'processed', 'failed'),
    defaultValue: 'pending',
  })
  status: string;

  @Column({
    type: DataType.DATE,
    field: 'processed_at',
  })
  processedAt: Date;

  @Column({
    type: DataType.JSON,
  })
  payload: object;
}

export { WebhookEvent };
