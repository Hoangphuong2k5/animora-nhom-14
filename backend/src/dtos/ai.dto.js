/**
 * DTO phân hệ Trợ lý AI (AnimoraDB ver 1.5)
 */
const toConversationDTO = (entity) => {
  if (!entity) return null;
  return Object.freeze({
    id: Number(entity.AIConversationID ?? entity.id),
    customer_id: Number(entity.CustomerID ?? entity.customer_id),
    title: entity.ConversationTitle ?? entity.title ?? null,
    status: String(entity.ConversationStatus ?? entity.status ?? 'Active'),
    pet_id: entity.pet_id ? Number(entity.pet_id) : null,
    started_at: entity.StartedAt ?? entity.started_at ?? null,
    ended_at: entity.EndedAt ?? entity.ended_at ?? null,
  });
};

const toMessageDTO = (entity) => {
  if (!entity) return null;
  const senderType = entity.SenderType ?? entity.role ?? 'Customer';
  const role =
    senderType === 'Assistant' ? 'assistant' : senderType === 'System' ? 'system' : 'user';
  return Object.freeze({
    id: Number(entity.AIConversationMessageID ?? entity.id),
    conversation_id: Number(entity.AIConversationID ?? entity.conversation_id),
    role,
    sender_type: String(senderType),
    content: String(entity.MessageContent ?? entity.content),
    created_at: entity.SentAt ?? entity.created_at ?? null,
  });
};

const toSuggestedServiceDTO = (entity) =>
  Object.freeze({
    id: Number(entity.ServiceID ?? entity.id),
    name: String(entity.ServiceName ?? entity.name),
    category: entity.CategoryName ?? entity.category ?? null,
    service_kind: String(entity.service_kind || 'care'),
    price: Number(entity.BasePrice ?? entity.price ?? 0),
    duration_min: Number(entity.EstimatedDurationMinutes ?? entity.duration_min ?? 60),
  });

export { toConversationDTO, toMessageDTO, toSuggestedServiceDTO };
export default { toConversationDTO, toMessageDTO, toSuggestedServiceDTO };
