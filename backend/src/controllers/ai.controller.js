import defaultAiService from '../services/ai.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

class AiController {
  constructor(aiService = defaultAiService) {
    this.aiService = aiService;

    this.chatDirect = asyncHandler(this.chatDirect.bind(this));
    this.openConversation = asyncHandler(this.openConversation.bind(this));
    this.listConversations = asyncHandler(this.listConversations.bind(this));
    this.getMessages = asyncHandler(this.getMessages.bind(this));
    this.sendMessage = asyncHandler(this.sendMessage.bind(this));
  }

  async chatDirect(req, res) {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống' });
    }
    const data = await this.aiService.quickChat({ message: message.trim(), history: history || [] });
    return successResponse(res, data, 'Trợ lý AI đã phản hồi');
  }

  async openConversation(req, res) {
    const data = await this.aiService.openConversation(req.user.id, req.body);
    return successResponse(res, data, 'Mở hội thoại với trợ lý AI thành công', 201);
  }

  async listConversations(req, res) {
    const r = await this.aiService.listConversations(req.user.id, req.query);
    return paginatedResponse(res, r.items, r.page, r.limit, r.total, 'Lấy danh sách hội thoại thành công');
  }

  async getMessages(req, res) {
    const r = await this.aiService.getMessages(req.user.id, req.params.id, req.query);
    return paginatedResponse(res, r.items, r.page, r.limit, r.total, 'Lấy lịch sử hội thoại thành công');
  }

  async sendMessage(req, res) {
    const data = await this.aiService.sendMessage(req.user.id, req.params.id, req.body.content);
    return successResponse(res, data, 'Trợ lý AI đã phản hồi', 201);
  }
}

const defaultAiController = new AiController();
export { defaultAiController, AiController };
export default defaultAiController;
