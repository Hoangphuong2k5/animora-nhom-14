import { GoogleGenerativeAI } from '@google/generative-ai';
import CircuitBreaker from 'opossum';
import geminiConfig from '../config/gemini.config.js';
import logger from './logger.js';

/**
 * GeminiClient - tích hợp dịch vụ ngoài theo Rule 18 (Resilience):
 *  - Timeout cứng cho mỗi lần gọi (không bao giờ chờ vô hạn)
 *  - Circuit Breaker (opossum): lỗi liên tục -> mở mạch, trả lỗi ngay, không cạn thread/socket
 *  - Retry chỉ với lỗi mạng chập chờn / 429 / 5xx bằng Exponential Backoff with Jitter
 *    (KHÔNG retry lỗi logic 400, 401, 403, 404)
 * Việc fallback (Graceful Degradation) do AiService quyết định.
 */
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

const isRetryableError = (error) => {
  if (error && error.code === 'EOPENBREAKER') return false;
  if (error && error.status !== undefined) return RETRYABLE_STATUS.has(Number(error.status));
  return true; // timeout / lỗi mạng không có status
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Exponential backoff with full jitter: random(0, base * 2^attempt)
const computeBackoffMs = (attempt, baseMs = 300, capMs = 3000) =>
  Math.floor(Math.random() * Math.min(capMs, baseMs * 2 ** attempt));

class GeminiClient {
  constructor(config = geminiConfig, sdkFactory = null) {
    this.config = config;
    this.sdkFactory = sdkFactory;
    this.model = null;
    this.breaker = new CircuitBreaker((payload) => this.callOnce(payload), {
      timeout: config.timeoutMs,
      errorThresholdPercentage: 50,
      volumeThreshold: 5,
      resetTimeout: 30000,
    });
    this.breaker.on('open', () => logger.warn('Gemini circuit breaker OPEN'));
    this.breaker.on('halfOpen', () => logger.info('Gemini circuit breaker HALF-OPEN'));
    this.breaker.on('close', () => logger.info('Gemini circuit breaker CLOSED'));
  }

  isAvailable() {
    return this.config.isConfigured;
  }

  getModel() {
    if (!this.model) {
      const genAI = this.sdkFactory
        ? this.sdkFactory(this.config.apiKey)
        : new GoogleGenerativeAI(this.config.apiKey);
      this.model = genAI.getGenerativeModel({
        model: this.config.model,
        systemInstruction: this.config.systemPrompt,
      });
    }
    return this.model;
  }

  async callOnce({ history, message }) {
    const chat = this.getModel().startChat({ history });
    const result = await chat.sendMessage(message);
    return result.response.text();
  }

  /**
   * @param {{history: Array<{role:'user'|'model', parts:Array<{text:string}>}>, message: string}} payload
   * @returns {Promise<string>} nội dung trả lời
   */
  async generate(payload) {
    if (!this.isAvailable()) {
      const error = new Error('GEMINI_API_KEY chưa được cấu hình');
      error.code = 'GEMINI_NOT_CONFIGURED';
      throw error;
    }

    let lastError;
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt += 1) {
      try {
        return await this.breaker.fire(payload);
      } catch (error) {
        lastError = error;
        if (!isRetryableError(error) || attempt === this.config.maxRetries) break;
        const delayMs = computeBackoffMs(attempt);
        logger.warn('Gemini call failed, retrying', {
          attempt: attempt + 1,
          delayMs,
          message: error.message,
          status: error.status,
        });
        await sleep(delayMs);
      }
    }
    throw lastError;
  }
}

const defaultGeminiClient = new GeminiClient();
export { defaultGeminiClient, GeminiClient, isRetryableError, computeBackoffMs };
export default defaultGeminiClient;
