import cron from 'node-cron';
import { AppDataSource } from '../config/data-source.js';
import notificationService from '../services/notification.service.js';
import logger from '../utils/logger.js';
import { runWithTrace } from '../utils/traceContext.js';

/**
 * REM-03 & Rule 15, 24: Care Reminder Cron Job
 * - Uses SQL Server Distributed Application Lock (sp_getapplock) + UPDLOCK, READPAST
 *   so multiple instances never send duplicate care reminder notifications.
 * - Uses JSON Structured Logger with traceId context.
 */
async function processDueCareReminders() {
  return runWithTrace(async () => {
    if (!AppDataSource.isInitialized) return { processedCount: 0 };

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lockRes = await queryRunner.query(`
        DECLARE @res INT;
        EXEC @res = sp_getapplock
          @Resource = 'animora_cron_care_reminder_lock',
          @LockMode = 'Exclusive',
          @LockOwner = 'Transaction',
          @LockTimeout = 0;
        SELECT @res AS lock_status;
      `);

      if (!lockRes[0] || Number(lockRes[0].lock_status) < 0) {
        await queryRunner.rollbackTransaction();
        logger.info('ReminderJob skipped: another instance holds the distributed lock');
        return { processedCount: 0, skipped: true };
      }

      const dueReminders = await notificationService.processDueReminders(50);
      await queryRunner.commitTransaction();

      logger.info('ReminderJob completed', { processedCount: dueReminders.length });
      return { processedCount: dueReminders.length };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      logger.error('ReminderJob failed', {
        errorName: error.name,
        message: error.message,
        stack: error.stack,
      });
      return { processedCount: 0, error: error.message };
    } finally {
      await queryRunner.release();
    }
  });
}

function startReminderJob() {
  return cron.schedule('*/5 * * * *', async () => {
    await processDueCareReminders();
  });
}

export {
  processDueCareReminders,
  startReminderJob,
};
export default {
  processDueCareReminders,
  startReminderJob,
};
