import { EntitySchema } from 'typeorm';

/**
 * Entities phân hệ Trợ lý AI - bảng AIConversations, AIConversationMessages, AIUsageLogs
 */
const AiConversationEntity = new EntitySchema({
  name: 'AiConversation',
  tableName: 'AIConversations',
  columns: {
    AIConversationID: { type: 'bigint', primary: true, generated: 'increment' },
    CustomerID: { type: 'bigint', nullable: false },
    ConversationTitle: { type: 'nvarchar', length: 200, nullable: true },
    ConversationStatus: { type: 'nvarchar', length: 30, default: 'Active' },
    StartedAt: { type: 'datetime2', precision: 0, createDate: true },
    EndedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const AiMessageEntity = new EntitySchema({
  name: 'AiMessage',
  tableName: 'AIConversationMessages',
  columns: {
    AIConversationMessageID: { type: 'bigint', primary: true, generated: 'increment' },
    AIConversationID: { type: 'bigint', nullable: false },
    SenderType: { type: 'nvarchar', length: 20, nullable: false }, // Customer | Assistant | System
    MessageContent: { type: 'nvarchar', length: 'MAX', nullable: false },
    SentAt: { type: 'datetime2', precision: 0, createDate: true },
    TokenCount: { type: 'int', nullable: true },
  },
});

const AiUsageLogEntity = new EntitySchema({
  name: 'AiUsageLog',
  tableName: 'AIUsageLogs',
  columns: {
    AIUsageLogID: { type: 'bigint', primary: true, generated: 'increment' },
    CustomerID: { type: 'bigint', nullable: true },
    AIConversationID: { type: 'bigint', nullable: true },
    AIModelName: { type: 'nvarchar', length: 150, nullable: true },
    InputTokens: { type: 'int', nullable: true },
    OutputTokens: { type: 'int', nullable: true },
    EstimatedCost: { type: 'decimal', precision: 18, scale: 6, nullable: true },
    ResponseTimeMilliseconds: { type: 'int', nullable: true },
    WasEscalatedToDoctor: { type: 'bit', default: false },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

export { AiConversationEntity, AiMessageEntity, AiUsageLogEntity };
export default { AiConversationEntity, AiMessageEntity, AiUsageLogEntity };
