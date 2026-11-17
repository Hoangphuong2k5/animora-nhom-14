import defaultNotificationRepo from '../repositories/notification.repository.js';
import { AppDataSource } from '../config/data-source.js';
import { toNotificationDTO } from '../dtos/notification.dto.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * NotificationService (NTF-01) - Hệ thống thông báo (AnimoraDB ver 1.5)
 */
class NotificationService {
  constructor(notificationRepo = defaultNotificationRepo, dataSource = AppDataSource) {
    this.notificationRepo = notificationRepo;
    this.dataSource = dataSource;
  }

  async hasRecentSystemAlert(userId, title, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await this.notificationRepo.existsRecentByTitle(userId, title, since);
  }

  async sendSystemAlert({ user_id, title, content, type = 'system', ref_type = null, ref_id = null }) {
    const created = await this.notificationRepo.createNotification({
      user_id: Number(user_id),
      type,
      title,
      content: content || '',
      ref_type,
      ref_id,
    });
    logger.info('System alert created', {
      user_id,
      title,
      type,
      notificationId: created.NotificationID ?? created.id,
    });
    return toNotificationDTO(created);
  }

  async processDueReminders(limit = 50) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let processed = [];

    try {
      processed = await this.notificationRepo.lockDueCareReminders(limit, queryRunner);

      if (processed.length > 0) {
        const notifications = processed.map((r) => ({
          user_id: Number(r.owner_user_id),
          type: 'care_reminder',
          title: r.title || `Nhắc lịch chăm sóc cho ${r.pet_name}`,
          content: r.note || `Đã đến lịch ${r.reminder_type} cho ${r.pet_name}.`,
          ref_type: 'PetReminder',
          ref_id: Number(r.id),
        }));
        await this.notificationRepo.bulkCreateNotifications(notifications, queryRunner.manager);
        await this.notificationRepo.markRemindersSent(
          processed.map((r) => r.id),
          queryRunner
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      logger.error('processDueReminders failed', {
        errorName: error.name,
        message: error.message,
        input: { limit },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }

    const bookingReminderCount = await this.notificationRepo.insertBookingReminders(2);
    logger.info('Reminders processed', {
      careReminders: processed.length,
      bookingReminders: bookingReminderCount,
    });
    return processed;
  }

  async listMyNotifications(userId, query) {
    const result = await this.notificationRepo.findByUser(userId, query);
    return { ...result, items: result.items.map(toNotificationDTO) };
  }

  async getUnreadCount(userId) {
    return { unread: await this.notificationRepo.countUnread(userId) };
  }

  async markAsRead(userId, notificationId) {
    const affected = await this.notificationRepo.markAsRead(notificationId, userId);
    if (affected === 0) {
      throw new ApiError(404, 'Không tìm thấy thông báo', 'NOTIFICATION_NOT_FOUND');
    }
    return { id: Number(notificationId), is_read: true };
  }

  async markAllAsRead(userId) {
    const affected = await this.notificationRepo.markAllAsRead(userId);
    return { updated: affected };
  }
}

const defaultNotificationService = new NotificationService();
export { defaultNotificationService, NotificationService };
export default defaultNotificationService;
