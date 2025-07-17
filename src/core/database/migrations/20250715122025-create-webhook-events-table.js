'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseModelMigration = require('../base-model/base-model.migration');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webhook_events', {
      ...baseModelMigration(Sequelize),

      reference: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'processed', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('webhook_events', ['reference'], {
      name: 'idx_webhook_events_reference',
    });

    await queryInterface.addIndex('webhook_events', ['event_type'], {
      name: 'idx_webhook_events_event_type',
    });

    await queryInterface.addIndex('webhook_events', ['status'], {
      name: 'idx_webhook_events_status',
    });

    await queryInterface.addIndex('webhook_events', ['created_at'], {
      name: 'idx_webhook_events_created_at',
    });

    await queryInterface.addIndex(
      'webhook_events',
      ['reference', 'event_type', 'status'],
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
