import defaultAiRepository from '../repositories/ai.repository.js';
import defaultGeminiClient from '../utils/gemini.client.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import {
  classifyMessage,
  detectServiceKind,
  sanitizeAssistantReply,
  GUARDRAIL_MESSAGES,
} from '../utils/ai-guardrail.js';
import { toConversationDTO, toMessageDTO, toSuggestedServiceDTO } from '../dtos/ai.dto.js';

const HISTORY_LIMIT = 10;

/**
 * AiService (AI-01..05) - Trợ lý AI tư vấn chăm sóc thú cưng (AnimoraDB ver 1.5)
 */
class AiService {
  constructor(aiRepository = defaultAiRepository, geminiClient = defaultGeminiClient) {
    this.aiRepository = aiRepository;
    this.geminiClient = geminiClient;
  }

  async resolveCustomerProfile(userId) {
    const profile = await this.aiRepository.resolveCustomerByUserId(userId);
    if (!profile) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
    }
    return profile;
  }

  // AI-01
  async openConversation(userId, { pet_id, title } = {}) {
    const customer = await this.resolveCustomerProfile(userId);
    let conversationTitle = title || null;

    if (pet_id) {
      const pet = await this.assertPetOwnedBy(pet_id, Number(customer.CustomerID), userId);
      if (!conversationTitle && pet) {
        conversationTitle = `Tư vấn chăm sóc: ${pet.name}`;
      }
    }

    const conversation = await this.aiRepository.createConversation(
      Number(customer.CustomerID),
      conversationTitle
    );
    return toConversationDTO({ ...conversation, pet_id: pet_id || null });
  }

  async listConversations(userId, query) {
    const customer = await this.resolveCustomerProfile(userId);
    const result = await this.aiRepository.findConversationsByCustomer(
      Number(customer.CustomerID),
      query
    );
    return { ...result, items: result.items.map(toConversationDTO) };
  }

  async getMessages(userId, conversationId, query) {
    await this.getOwnedConversation(conversationId, userId);
    const result = await this.aiRepository.findMessages(conversationId, query);
    return { ...result, items: result.items.map(toMessageDTO) };
  }

  // AI-02..05
  async sendMessage(userId, conversationId, content) {
    const conversation = await this.getOwnedConversation(conversationId, userId);
    const convId = Number(conversation.AIConversationID ?? conversation.id);
    const classification = classifyMessage(content);

    const history = await this.aiRepository.findRecentMessages(convId, HISTORY_LIMIT);
    const userMessage = await this.aiRepository.createMessage(convId, 'user', content);

    const { text, guardrail, degraded } = await this.buildAssistantReply(
      conversation,
      classification,
      content,
      history
    );

    const assistantMessage = await this.aiRepository.createMessage(convId, 'assistant', text);
    const suggestedServices = await this.suggestServices(content, classification.type);

    return {
      user_message: toMessageDTO(userMessage),
      assistant_message: toMessageDTO(assistantMessage),
      guardrail,
      degraded,
      suggested_services: suggestedServices,
    };
  }

  async buildAssistantReply(conversation, classification, content, history) {
    if (classification.type === 'emergency' || classification.type === 'prescription_request') {
      return {
        text: GUARDRAIL_MESSAGES[classification.type],
        guardrail: classification.type,
        degraded: false,
      };
    }

    try {
      const rawReply = await this.geminiClient.generate({
        history: this.toGeminiHistory(history),
        message: await this.composePrompt(conversation, content),
      });
      const { text, sanitized } = sanitizeAssistantReply(rawReply, classification.type);
      return {
        text,
        guardrail: sanitized ? 'sanitized' : classification.type === 'symptom' ? 'symptom' : null,
        degraded: false,
      };
    } catch (error) {
      logger.error('AI reply degraded to fallback', {
        errorName: error.name,
        message: error.message,
        rootCause: error.code || error.status || null,
        input: {
          conversationId: conversation.AIConversationID ?? conversation.id,
          classification: classification.type,
        },
      });
      return { text: GUARDRAIL_MESSAGES.fallback, guardrail: null, degraded: true };
    }
  }

  async composePrompt(conversation, content) {
    if (!conversation.pet_id) return content;
    const pet = await this.aiRepository.findPetById(conversation.pet_id);
    if (!pet) return content;
    const context = [
      `Tên: ${pet.name}`,
      `Loài: ${pet.species}`,
      pet.breed ? `Giống: ${pet.breed}` : null,
      pet.weight ? `Cân nặng: ${pet.weight}kg` : null,
      pet.birth_date ? `Ngày sinh: ${new Date(pet.birth_date).toISOString().slice(0, 10)}` : null,
      pet.GeneralNotes ? `Ghi chú: ${pet.GeneralNotes}` : null,
    ]
      .filter(Boolean)
      .join('; ');
    return `[Hồ sơ thú cưng: ${context}]\nCâu hỏi: ${content}`;
  }

  toGeminiHistory(messages) {
    if (!Array.isArray(messages)) return [];
    const mapped = messages
      .filter((m) => m && (m.MessageContent || m.content))
      .map((m) => {
        const sender = m.SenderType ?? m.role;
        const text = m.MessageContent ?? m.content;
        return {
          role: sender === 'Assistant' || sender === 'assistant' ? 'model' : 'user',
          parts: [{ text }],
        };
      });
    while (mapped.length > 0 && mapped[0].role !== 'user') mapped.shift();
    return mapped;
  }

  async quickChat({ message, history = [] }) {
    const classification = classifyMessage(message);
    const { text, guardrail, degraded } = await this.buildAssistantReply(
      { pet_id: null },
      classification,
      message,
      history
    );
    let suggestedServices = [];
    try {
      suggestedServices = await this.suggestServices(message, classification.type);
    } catch {
      // Bỏ qua nếu DB chưa kết nối
    }
    return {
      reply: text,
      guardrail,
      degraded,
      suggested_services: suggestedServices,
    };
  }

  // AI-05
  async suggestServices(content, classificationType) {
    const kind = detectServiceKind(content, classificationType);
    if (!kind) return [];
    const services = await this.aiRepository.findSuggestedServices(kind, 3);
    return services.map(toSuggestedServiceDTO);
  }

  // ---------- ABAC ----------

  async getOwnedConversation(conversationId, userId) {
    const customer = await this.resolveCustomerProfile(userId);
    const conversation = await this.aiRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new ApiError(404, 'Không tìm thấy cuộc hội thoại', 'AI_CONVERSATION_NOT_FOUND');
    }
    if (Number(conversation.CustomerID) !== Number(customer.CustomerID)) {
      throw new ApiError(403, 'Bạn không có quyền truy cập cuộc hội thoại này', 'FORBIDDEN');
    }
    return conversation;
  }

  async assertPetOwnedBy(petId, customerId, userId) {
    const pet = await this.aiRepository.findPetById(petId);
    if (!pet) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ thú cưng', 'PET_NOT_FOUND');
    }
    if (
      Number(pet.customer_id) !== Number(customerId) &&
      Number(pet.owner_id) !== Number(userId)
    ) {
      throw new ApiError(403, 'Bạn không có quyền truy cập hồ sơ thú cưng này', 'FORBIDDEN');
    }
    return pet;
  }
}

const defaultAiService = new AiService();
export { defaultAiService, AiService };
export default defaultAiService;
