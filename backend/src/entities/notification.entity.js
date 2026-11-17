import { EntitySchema } from 'typeorm';

/**
 * Entities phân hệ Thông báo & Audit log - bảng NotificationTemplates, Notifications, AuditLogs
 */
const NotificationTemplateEntity = new EntitySchema({
  name: 'NotificationTemplate',
  tableName: 'NotificationTemplates',
  columns: {
    NotificationTemplateID: { type: 'int', primary: true, generated: 'increment' },
    TemplateCode: { type: 'nvarchar', length: 100, unique: true, nullable: false },
    TemplateName: { type: 'nvarchar', length: 150, nullable: false },
    Channel: { type: 'nvarchar', length: 30, nullable: false },
    SubjectTemplate: { type: 'nvarchar', length: 300, nullable: true },
    BodyTemplate: { type: 'nvarchar', length: 'MAX', nullable: false },
    IsActive: { type: 'bit', default: true },
  },
});

const NotificationEntity = new EntitySchema({
  name: 'Notification',
  tableName: 'Notifications',
  columns: {
    NotificationID: { type: 'bigint', primary: true, generated: 'increment' },
    UserID: { type: 'bigint', nullable: false },
    NotificationTemplateID: { type: 'int', nullable: true },
    Title: { type: 'nvarchar', length: 250, nullable: false },
    MessageContent: { type: 'nvarchar', length: 2000, nullable: false },
    NotificationType: { type: 'nvarchar', length: 50, nullable: true },
    RelatedEntityType: { type: 'nvarchar', length: 100, nullable: true },
    RelatedEntityID: { type: 'bigint', nullable: true },
    IsRead: { type: 'bit', default: false },
    SentAt: { type: 'datetime2', precision: 0, createDate: true },
    ReadAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const AuditLogEntity = new EntitySchema({
  name: 'AuditLog',
  tableName: 'AuditLogs',
  columns: {
    AuditLogID: { type: 'bigint', primary: true, generated: 'increment' },
    ActorUserID: { type: 'bigint', nullable: true },
    Action: { type: 'nvarchar', length: 100, nullable: false },
    EntityName: { type: 'nvarchar', length: 150, nullable: false },
    EntityID: { type: 'nvarchar', length: 100, nullable: true },
    OldValues: { type: 'nvarchar', length: 'MAX', nullable: true },
    NewValues: { type: 'nvarchar', length: 'MAX', nullable: true },
    Reason: { type: 'nvarchar', length: 2000, nullable: true },
    IsEmergency: { type: 'bit', default: false },
    IPAddress: { type: 'nvarchar', length: 45, nullable: true },
    UserAgent: { type: 'nvarchar', length: 500, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

export { NotificationTemplateEntity, NotificationEntity, AuditLogEntity };
export default { NotificationTemplateEntity, NotificationEntity, AuditLogEntity };
