import { AppDataSource } from '../config/data-source.js';
import { NotificationEntity, AuditLogEntity } from '../entities/notification.entity.js';
import logger from '../utils/logger.js';

/**
 * NotificationRepository ánh xạ với AnimoraDB_Complete_ver1_5_Clean.sql
 */
class NotificationRepository {
  constructor(dataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  getRepo(entity, manager = null) {
    return manager ? manager.getRepository(entity) : this.dataSource.getRepository(entity);
  }

  mapNotificationPayload(data) {
    return {
      UserID: Number(data.UserID ?? data.user_id),
      NotificationTemplateID: data.NotificationTemplateID ?? null,
      Title: data.Title ?? data.title,
      MessageContent: data.MessageContent ?? data.content ?? '',
      NotificationType: data.NotificationType ?? data.type ?? 'system',
      RelatedEntityType: data.RelatedEntityType ?? data.ref_type ?? null,
      RelatedEntityID:
        data.RelatedEntityID ?? data.ref_id
          ? Number(data.RelatedEntityID ?? data.ref_id)
          : null,
      IsRead: Boolean(data.IsRead ?? data.is_read ?? false),
    };
  }

  async createNotification(data, manager = null) {
    try {
      const repo = this.getRepo(NotificationEntity, manager);
      return await repo.save(repo.create(this.mapNotificationPayload(data)));
    } catch (error) {
      logger.error('createNotification failed', {
        errorName: error.name,
        message: error.message,
        input: data,
      });
      throw error;
    }
  }

  async bulkCreateNotifications(list, manager = null) {
    if (!list || list.length === 0) return [];
    const repo = this.getRepo(NotificationEntity, manager);
    return await repo.save(list.map((item) => repo.create(this.mapNotificationPayload(item))));
  }

  async createAuditLog(data, manager = null) {
    try {
      const repo = this.getRepo(AuditLogEntity, manager);
      const oldRaw = data.OldValues ?? data.old_values ?? null;
      const newRaw = data.NewValues ?? data.new_values ?? null;
      const rawEntityId = data.EntityID ?? data.entity_id;
      const logData = {
        ActorUserID: (data.ActorUserID ?? data.actor_id) ? Number(data.ActorUserID ?? data.actor_id) : null,
        Action: data.Action ?? data.action,
        EntityName: data.EntityName ?? data.entity_type,
        EntityID: rawEntityId !== undefined && rawEntityId !== null ? String(rawEntityId) : null,
        OldValues: oldRaw !== null && typeof oldRaw === 'object' ? JSON.stringify(oldRaw) : oldRaw,
        NewValues: newRaw !== null && typeof newRaw === 'object' ? JSON.stringify(newRaw) : newRaw,
        Reason: data.Reason ?? data.reason ?? null,
        IsEmergency: Boolean(data.IsEmergency ?? false),
        IPAddress: data.IPAddress ?? data.ip_address ?? null,
        UserAgent: data.UserAgent ?? data.user_agent ?? null,
      };
      return await repo.save(repo.create(logData));
    } catch (error) {
      logger.error('createAuditLog failed', {
        errorName: error.name,
        message: error.message,
        input: data,
      });
      throw error;
    }
  }

  async findByUser(userId, { is_read, after_id, page = 1, limit = 20 }) {
    const qb = this.getRepo(NotificationEntity)
      .createQueryBuilder('n')
      .where('n.UserID = :userId', { userId: Number(userId) });

    if (is_read !== undefined) {
      qb.andWhere('n.IsRead = :isRead', { isRead: is_read ? 1 : 0 });
    }

    const total = await qb.getCount();

    if (after_id) {
      qb.andWhere('n.NotificationID < :afterId', { afterId: Number(after_id) });
      qb.orderBy('n.NotificationID', 'DESC').take(Number(limit));
    } else {
      qb.orderBy('n.NotificationID', 'DESC')
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit));
    }

    const items = await qb.getMany();
    const nextCursor = items.length > 0 ? Number(items[items.length - 1].NotificationID) : null;
    return { items, total, page: Number(page), limit: Number(limit), nextCursor };
  }

  async countUnread(userId) {
    return await this.getRepo(NotificationEntity).count({
      where: { UserID: Number(userId), IsRead: false },
    });
  }

  async markAsRead(id, userId) {
    const result = await this.getRepo(NotificationEntity).update(
      { NotificationID: Number(id), UserID: Number(userId) },
      { IsRead: true, ReadAt: new Date() }
    );
    return result.affected || 0;
  }

  async markAllAsRead(userId) {
    const result = await this.getRepo(NotificationEntity).update(
      { UserID: Number(userId), IsRead: false },
      { IsRead: true, ReadAt: new Date() }
    );
    return result.affected || 0;
  }

  async existsRecentByTitle(userId, title, sinceDate) {
    const row = await this.getRepo(NotificationEntity)
      .createQueryBuilder('n')
      .select('n.NotificationID')
      .where('n.UserID = :userId', { userId: Number(userId) })
      .andWhere('n.Title = :title', { title })
      .andWhere('n.SentAt >= :since', { since: sinceDate })
      .getOne();
    return Boolean(row);
  }

  /**
   * NTF-01: Lấy lịch nhắc chăm sóc đến hạn từ dbo.PetReminders (UPDLOCK, READPAST)
   */
  async lockDueCareReminders(limit, queryRunner) {
    return await queryRunner.manager.query(
      `SELECT TOP (@0) r.PetReminderID AS id, r.PetID AS pet_id, rt.ReminderTypeName AS reminder_type,
              r.ReminderTitle AS title, r.ReminderDescription AS note, r.RemindAt AS remind_at,
              cp.UserID AS owner_user_id, p.PetName AS pet_name
       FROM dbo.PetReminders r WITH (UPDLOCK, READPAST, ROWLOCK)
       INNER JOIN dbo.Pets p ON p.PetID = r.PetID
       INNER JOIN dbo.CustomerProfiles cp ON cp.CustomerID = r.CustomerID
       INNER JOIN dbo.ReminderTypes rt ON rt.ReminderTypeID = r.ReminderTypeID
       WHERE r.ReminderStatus = N'Pending' AND r.RemindAt <= SYSDATETIME() AND p.IsActive = 1
       ORDER BY r.RemindAt ASC`,
      [Number(limit)]
    );
  }

  async markRemindersSent(reminderIds, queryRunner) {
    if (!reminderIds || reminderIds.length === 0) return;
    await queryRunner.manager
      .createQueryBuilder()
      .update('PetReminders')
      .set({ ReminderStatus: 'Sent' })
      .where('PetReminderID IN (:...ids)', { ids: reminderIds.map(Number) })
      .execute();
  }

  /**
   * NTF-01: Nhắc lịch hẹn trước 2h trên dbo.Appointments + dbo.AppointmentAssignments
   */
  async insertBookingReminders(hoursAhead = 2) {
    const rows = await this.dataSource.query(
      `INSERT INTO dbo.Notifications (UserID, NotificationType, Title, MessageContent, RelatedEntityType, RelatedEntityID)
       OUTPUT INSERTED.NotificationID
       SELECT t.UserID, N'booking_reminder', N'Nhắc lịch hẹn sắp diễn ra',
              CONCAT(N'Lịch hẹn ', a.AppointmentCode, N' sẽ bắt đầu lúc ', FORMAT(a.AppointmentAt, 'HH:mm dd/MM/yyyy'), N'.'),
              N'Appointment', a.AppointmentID
       FROM dbo.Appointments a
       INNER JOIN dbo.CustomerProfiles cp ON cp.CustomerID = a.CustomerID
       INNER JOIN dbo.AppointmentAssignments aa ON aa.AppointmentID = a.AppointmentID
       INNER JOIN dbo.EmployeeProfiles ep ON ep.EmployeeID = aa.EmployeeID
       CROSS APPLY (VALUES (cp.UserID), (ep.UserID)) AS t(UserID)
       WHERE a.AppointmentStatus = N'Confirmed'
         AND a.AppointmentAt > SYSDATETIME()
         AND a.AppointmentAt <= DATEADD(HOUR, @0, SYSDATETIME())
         AND NOT EXISTS (
           SELECT 1 FROM dbo.Notifications n
           WHERE n.UserID = t.UserID
             AND n.RelatedEntityType = N'Appointment'
             AND n.RelatedEntityID = a.AppointmentID
             AND n.NotificationType = N'booking_reminder'
         )`,
      [Number(hoursAhead)]
    );
    return Array.isArray(rows) ? rows.length : 0;
  }
}

const notificationRepositoryInstance = new NotificationRepository();
export { notificationRepositoryInstance, NotificationRepository };
export default notificationRepositoryInstance;
