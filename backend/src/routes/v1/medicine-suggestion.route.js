// Routes đề xuất kho (MED-09).
// URL giữ nguyên bản cũ: /medicine-suggestions.
// Thêm endpoint mới: PUT /medicine-suggestions/:id/review — QL duyệt/từ chối
// đề xuất (cần để dùng được các trường reviewed_by_ql_id / reviewed_at /
// review_note của schema mới; bản cũ không có bước duyệt).
// Vai 'QL' là mã vai mới của schema v1.5 (chưa có trong hằng ROLES của nhóm
// nên dùng chuỗi trực tiếp; nếu JWT của nhóm dùng mã khác thì sửa ở đây).
// File này gắn TRỰC TIẾP vào router /api/v1 (không có tiền tố riêng) vì đường
// dẫn đã đầy đủ (xem patches/routes-index.patch.txt).
// Không còn migration: bảng warehouse_proposals đã có sẵn trong schema v1.5.
import express from 'express';
const router = express.Router();
import * as medicineSuggestionController from '../../controllers/medicine-suggestion.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { suggestMedicineSchema, reviewProposalSchema } from '../../validators/medicine-suggestion.validator.js';
import { ROLES } from '../../utils/constants.js';

router.use(verifyToken);

// [MED-09] Bác sĩ đề xuất nhập thêm / thuốc mới / ngừng thuốc
router.post('/medicine-suggestions', authorizeRoles(ROLES.EXPERT, ROLES.ADMIN), validate(suggestMedicineSchema), medicineSuggestionController.suggestMedicine);
// [MED-09] Admin xem danh sách đề xuất để duyệt
router.get('/medicine-suggestions', authorizeRoles(ROLES.ADMIN), medicineSuggestionController.listSuggestions);
// [MED-09] QL duyệt / từ chối đề xuất (endpoint mới)
router.put('/medicine-suggestions/:id/review', authorizeRoles('QL', ROLES.ADMIN), validate(reviewProposalSchema), medicineSuggestionController.reviewProposal);

export default router;
