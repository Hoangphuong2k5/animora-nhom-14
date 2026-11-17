/**
 * DTO phân hệ Thông báo (AnimoraDB ver 1.5)
 */
const toNotificationDTO = (entity) => {
  if (!entity) return null;
  return Object.freeze({
    id: Number(entity.NotificationID ?? entity.id),
    user_id: Number(entity.UserID ?? entity.user_id),
    type: String(entity.NotificationType ?? entity.type ?? 'system'),
    title: String(entity.Title ?? entity.title),
    content: entity.MessageContent ?? entity.content ?? null,
    ref_type: entity.RelatedEntityType ?? entity.ref_type ?? null,
    ref_id:
      entity.RelatedEntityID !== null && entity.RelatedEntityID !== undefined
        ? Number(entity.RelatedEntityID)
        : entity.ref_id !== null && entity.ref_id !== undefined
          ? Number(entity.ref_id)
          : null,
    is_read: Boolean(entity.IsRead ?? entity.is_read),
    created_at: entity.SentAt ?? entity.created_at ?? null,
    read_at: entity.ReadAt ?? entity.read_at ?? null,
  });
};

export { toNotificationDTO };
export default { toNotificationDTO };
