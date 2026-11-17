/**
 * AI Guardrails (AI-03, AI-04) - Hàm THUẦN (không I/O) để dễ unit test.
 *  - classifyMessage: phân loại câu hỏi của khách trước khi gọi LLM
 *  - sanitizeAssistantReply: lọc đầu ra LLM, chặn tên thuốc/liều lượng
 *  - detectServiceKind: gợi ý loại dịch vụ phù hợp (AI-05)
 */

const removeDiacritics = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const PRESCRIPTION_PATTERNS = [
  /ke don/,
  /don thuoc/,
  /lieu (luong|dung)/,
  /bao nhieu (mg|ml|vien|thuoc)/,
  /uong (thuoc )?(gi|nao|bao nhieu)/,
  /cho (uong|an) thuoc/,
  /thuoc (gi|nao) (de|tri|chua)/,
  /(tiem|chich) (thuoc|khang sinh)/,
  /khang sinh/,
];

const EMERGENCY_PATTERNS = [
  /co giat/,
  /kho tho/,
  /chay mau/,
  /ngo doc/,
  /an nham/,
  /bat tinh|ngat xiu|liet/,
  /tai nan|bi xe/,
  /non (ra )?mau|di ngoai ra mau/,
  /trung doc/,
];

const SYMPTOM_PATTERNS = [
  /\bnon\b|oi mua/,
  /tieu chay|di ngoai long/,
  /bo an|chan an/,
  /\bsot\b|\bnong\b/,
  /\bho\b|hat hoi/,
  /\bngua\b|gai nhieu|rung long/,
  /chay (nuoc )?(mat|mui)/,
  /\bsung\b|\bque\b|dau (bung|chan)|bi dau/,
  /li bi|me met|kiet suc/,
  /vet thuong|nhiem trung|viem/,
];

const GROOMING_PATTERNS = [/tam|spa|cat (tia|long|mong)|cao voi|ve sinh|chai long/];
const TRAINING_PATTERNS = [/huan luyen|day (cho|cun|meo)|tap (ngoi|bat)/];

const DOSAGE_OUTPUT_PATTERN =
  /\b\d+([.,]\d+)?\s?(mg|mcg|µg|ml|iu|g\/kg|mg\/kg|ml\/kg|viên|vien)\b/i;

const KNOWN_DRUG_PATTERN =
  /\b(amoxicillin|amoxicilin|cephalexin|metronidazole|prednisolone|prednisone|doxycycline|enrofloxacin|ivermectin|meloxicam|tramadol|paracetamol|ibuprofen|aspirin|clavamox|dexamethasone)\b/i;

const matchesAny = (normalized, patterns) => patterns.some((p) => p.test(normalized));

const classifyMessage = (text) => {
  const normalized = removeDiacritics(text);
  if (matchesAny(normalized, EMERGENCY_PATTERNS)) return { type: 'emergency' };
  if (matchesAny(normalized, PRESCRIPTION_PATTERNS)) return { type: 'prescription_request' };
  if (matchesAny(normalized, SYMPTOM_PATTERNS)) return { type: 'symptom' };
  return { type: 'general' };
};

const detectServiceKind = (text, classificationType) => {
  if (classificationType === 'emergency' || classificationType === 'symptom' || classificationType === 'prescription_request') {
    return 'medical';
  }
  const normalized = removeDiacritics(text);
  if (matchesAny(normalized, GROOMING_PATTERNS)) return 'care';
  if (matchesAny(normalized, TRAINING_PATTERNS)) return 'care';
  return null;
};

const GUARDRAIL_MESSAGES = Object.freeze({
  emergency:
    'Tình huống bạn mô tả có thể NGUY HIỂM. Vui lòng đưa thú cưng đến phòng khám thú y gần nhất NGAY, giữ bé yên tĩnh và ấm. ' +
    'Mình không thể chẩn đoán hay hướng dẫn dùng thuốc qua chat. Bạn có thể đặt lịch khám khẩn với bác sĩ thú y trên ANIMORA.',
  prescription_request:
    'Mình không được phép kê đơn, gợi ý tên thuốc hay liều lượng vì dùng sai có thể gây nguy hiểm cho thú cưng. ' +
    'Bạn hãy đặt lịch khám với bác sĩ thú y trên ANIMORA để được thăm khám và kê đơn phù hợp nhé.',
  symptom_disclaimer:
    '\n\n⚠️ Đây chỉ là thông tin tham khảo, không thay thế chẩn đoán của bác sĩ thú y. Nếu triệu chứng kéo dài hoặc nặng hơn, hãy đặt lịch khám trên ANIMORA.',
  sanitized:
    'Mình không thể cung cấp tên thuốc hoặc liều lượng. Vui lòng đặt lịch khám với bác sĩ thú y trên ANIMORA để được tư vấn chính xác.',
  fallback:
    'Hiện trợ lý AI đang tạm thời quá tải nên chưa trả lời được. Bạn vui lòng thử lại sau ít phút, ' +
    'hoặc đặt lịch với chuyên viên trên ANIMORA nếu cần hỗ trợ gấp.',
});

/**
 * Lọc đầu ra của LLM: nếu có tên thuốc / liều lượng -> thay toàn bộ bằng thông điệp an toàn.
 * Nếu câu hỏi là triệu chứng -> luôn gắn disclaimer.
 */
const sanitizeAssistantReply = (reply, classificationType) => {
  const text = String(reply || '').trim();
  if (!text) return { text: GUARDRAIL_MESSAGES.fallback, sanitized: true };
  if (DOSAGE_OUTPUT_PATTERN.test(text) || KNOWN_DRUG_PATTERN.test(text)) {
    return { text: GUARDRAIL_MESSAGES.sanitized, sanitized: true };
  }
  if (classificationType === 'symptom') {
    return { text: text + GUARDRAIL_MESSAGES.symptom_disclaimer, sanitized: false };
  }
  return { text, sanitized: false };
};

export {
  removeDiacritics,
  classifyMessage,
  detectServiceKind,
  sanitizeAssistantReply,
  GUARDRAIL_MESSAGES,
};
export default {
  removeDiacritics,
  classifyMessage,
  detectServiceKind,
  sanitizeAssistantReply,
  GUARDRAIL_MESSAGES,
};

