'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseModelMigration = require('../base-model/base-model.migration');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webhook_events', {
      ...baseModelMigration(Sequelize), // adds id, created_at, updated_at, deleted_at

      reference: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Payment reference from webhook',
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Type of webhook event (e.g., charge.success)',
      },
      status: {
        type: Sequelize.ENUM('pending', 'processed', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
        comment: 'Processing status of the webhook',
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the webhook was successfully processed',
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Original webhook payload from Paystack',
      },
    });

    // ✅ Fixed indexes - using correct snake_case column names
    await queryInterface.addIndex('webhook_events', ['reference'], {
      name: 'idx_webhook_events_reference',
    });

    await queryInterface.addIndex('webhook_events', ['event_type'], {
      // Fixed: was 'eventType'
      name: 'idx_webhook_events_event_type',
    });

    await queryInterface.addIndex('webhook_events', ['status'], {
      name: 'idx_webhook_events_status',
    });

    await queryInterface.addIndex('webhook_events', ['created_at'], {
      // Fixed: was 'createdAt'
      name: 'idx_webhook_events_created_at',
    });

    await queryInterface.addIndex(
      'webhook_events',
      ['reference', 'event_type', 'status'], // Fixed: was 'eventType'
      {
        name: 'idx_webhook_events_ref_event_status',
      },
    );
  },

  async down(queryInterface) {
    // Drop indexes first
    await queryInterface.removeIndex(
      'webhook_events',
      'idx_webhook_events_reference',
    );
    await queryInterface.removeIndex(
      'webhook_events',
      'idx_webhook_events_event_type',
    );
    await queryInterface.removeIndex(
      'webhook_events',
      'idx_webhook_events_status',
    );
    await queryInterface.removeIndex(
      'webhook_events',
      'idx_webhook_events_created_at',
    );
    await queryInterface.removeIndex(
      'webhook_events',
      'idx_webhook_events_ref_event_status',
    );

    // Drop table
    await queryInterface.dropTable('webhook_events');
  },
};
