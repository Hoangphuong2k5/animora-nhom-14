import express from 'express';
import aiController from '../../controllers/ai.controller.js';
import validator from '../../validators/ai.validator.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

// /api/v1/ai  (AI-01..05)
const router = express.Router();

// Trò chuyện trực tiếp (không bắt buộc đăng nhập, phục vụ widget chat trên trang)
router.post('/chat', aiController.chatDirect);

// Boundary RBAC: chỉ khách hàng dùng trợ lý AI có lưu phiên hội thoại; ABAC kiểm tra trong Service
router.use(verifyToken, authorizeRoles('customer'));

router.post('/conversations', validate(validator.openConversationSchema), aiController.openConversation);
router.get('/conversations', validate(validator.listConversationsSchema), aiController.listConversations);
router.get('/conversations/:id/messages', validate(validator.listMessagesSchema), aiController.getMessages);
router.post('/conversations/:id/messages', validate(validator.sendMessageSchema), aiController.sendMessage);

export default router;
