import { env } from './environment.js';

/**
 * Cấu hình Google Gemini AI & System Prompt (AI-01..05) - Hoàng phụ trách.
 * System Prompt chứa Guardrails: KHÔNG chẩn đoán chắc chắn, KHÔNG kê đơn / liều thuốc.
 */
const SYSTEM_PROMPT = [
  'Bạn là trợ lý chăm sóc thú cưng của nền tảng ANIMORA. Luôn trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa ~150 từ).',
  'Phạm vi: dinh dưỡng, vệ sinh, huấn luyện, chăm sóc hằng ngày, lịch tiêm phòng/tẩy giun tham khảo.',
  'QUY TẮC BẮT BUỘC:',
  '1. KHÔNG chẩn đoán bệnh chắc chắn và KHÔNG kê đơn, KHÔNG nêu tên thuốc kê đơn hoặc liều lượng thuốc.',
  '2. Khi người dùng mô tả triệu chứng bất thường, chỉ đưa lời khuyên sơ cứu cơ bản an toàn và khuyến nghị đặt lịch khám với bác sĩ thú y trên ANIMORA.',
  '3. Nếu câu hỏi nằm ngoài lĩnh vực thú cưng, lịch sự từ chối.',
].join('\n');

const geminiConfig = {
  apiKey: env.GEMINI_API_KEY,
  model: env.GEMINI_MODEL,
  timeoutMs: env.GEMINI_TIMEOUT_MS,
  maxRetries: env.GEMINI_MAX_RETRIES,
  systemPrompt: SYSTEM_PROMPT,
  isConfigured: Boolean(env.GEMINI_API_KEY),
};

export { geminiConfig, SYSTEM_PROMPT };
export default geminiConfig;
