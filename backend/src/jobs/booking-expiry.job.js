import cron from 'node-cron';
import { AppDataSource } from '../config/data-source.js';
import logger from '../utils/logger.js';
import { runWithTrace } from '../utils/traceContext.js';

/**
 * Tự động hủy các lịch hẹn Prepaid_Pending đã quá hạn thanh toán (PaymentExpiresAt < SYSDATETIME())
 * để giải phóng slot và hủy các Payment Pending liên quan.
 * Dùng sp_getapplock chống chạy trùng trên nhiều instance.
 */
async function processExpiredPrepaidBookings(dataSource = AppDataSource) {
  return runWithTrace(async () => {
    if (!dataSource?.isInitialized) return { cancelledCount: 0 };

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lockRes = await queryRunner.query(`
        DECLARE @res INT;
        EXEC @res = sp_getapplock
          @Resource = 'animora_cron_booking_expiry_lock',
          @LockMode = 'Exclusive',
          @LockOwner = 'Transaction',
          @LockTimeout = 0;
        SELECT @res AS lock_status;
      `);

      if (!lockRes[0] || Number(lockRes[0].lock_status) < 0) {
        await queryRunner.rollbackTransaction();
        return { cancelledCount: 0, skipped: true };
      }

      const expiredRows = await queryRunner.query(`
        SELECT TOP (100) AppointmentID, AppointmentCode
        FROM dbo.Appointments WITH (UPDLOCK, READPAST)
        WHERE AppointmentStatus = N'Pending'
          AND PaymentTiming = N'Prepaid'
          AND PaymentStatus = N'Prepaid_Pending'
          AND PaymentExpiresAt IS NOT NULL
          AND PaymentExpiresAt < SYSDATETIME()
        ORDER BY PaymentExpiresAt ASC;
      `);

      if (!expiredRows || expiredRows.length === 0) {
        await queryRunner.commitTransaction();
        return { cancelledCount: 0 };
      }

      const expiredIds = expiredRows.map((r) => Number(r.AppointmentID));
      const idPlaceholders = expiredIds.map((_, idx) => `@${idx}`).join(', ');

      await queryRunner.query(
        `UPDATE dbo.Appointments
         SET AppointmentStatus = N'Cancelled',
             CancelledAt = SYSDATETIME(),
             InternalNote = COALESCE(InternalNote + N' | ', N'') + N'Tự động hủy do quá hạn thanh toán trả trước',
             UpdatedAt = SYSDATETIME()
         WHERE AppointmentID IN (${idPlaceholders})
           AND AppointmentStatus = N'Pending'
           AND PaymentTiming = N'Prepaid'
           AND PaymentStatus = N'Prepaid_Pending';`,
        expiredIds
      );

      await queryRunner.query(
        `INSERT INTO dbo.AppointmentStatusHistory (AppointmentID, OldStatus, NewStatus, ChangedByUserID, ChangeReason)
         SELECT AppointmentID, N'Pending', N'Cancelled', NULL, N'Tự động hủy do quá hạn thanh toán trả trước'
         FROM dbo.Appointments
         WHERE AppointmentID IN (${idPlaceholders});`,
        expiredIds
      );

      await queryRunner.query(
        `UPDATE dbo.Payments
         SET PaymentStatus = N'Cancelled'
         WHERE AppointmentID IN (${idPlaceholders})
           AND PaymentStatus = N'Pending';`,
        expiredIds
      );

      await queryRunner.commitTransaction();
      logger.info('BookingExpiryJob completed', { cancelledCount: expiredIds.length });
      return { cancelledCount: expiredIds.length };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      logger.error('BookingExpiryJob failed', {
        errorName: error.name,
        message: error.message,
      });
      return { cancelledCount: 0, error: error.message };
    } finally {
      await queryRunner.release();
    }
  });
}

function startBookingExpiryJob() {
  return cron.schedule('* * * * *', async () => {
    await processExpiredPrepaidBookings();
  });
}

export {
  processExpiredPrepaidBookings,
  startBookingExpiryJob,
};
export default {
  processExpiredPrepaidBookings,
  startBookingExpiryJob,
};

