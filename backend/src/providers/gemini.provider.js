import { StatusCodes } from 'http-status-codes';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiConfig, SYSTEM_PROMPT } from '../config/gemini.config.js';
import ApiError from '../utils/ApiError.js';

let genAI = null;
if (geminiConfig.apiKey) {
  genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
}

export const generateReply = async (prompt, systemInstruction = SYSTEM_PROMPT) => {
  if (!genAI) {
    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      'Dịch vụ AI chưa được cấu hình API key',
      'AI_PROVIDER_NOT_CONFIGURED'
    );
  }
  try {
    const model = genAI.getGenerativeModel({
      model: geminiConfig.model,
      systemInstruction,
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      'Trợ lý AI đang bận, vui lòng thử lại sau',
      'AI_PROVIDER_ERROR'
    );
  }
};

export default { generateReply };
