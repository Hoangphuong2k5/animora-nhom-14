// Service đề xuất kho (MED-09) — theo schema Animora v1.5 mới.
// medicine_suggestions -> warehouse_proposals (kho chung, bỏ hộp thuốc riêng).
// Bác sĩ đề xuất: RESTOCK (nhập thêm thuốc đang có), NEW_DRUG (thuốc mới),
// DISCONTINUE (ngừng thuốc). proposed_by_doctor_id = user_id của bác sĩ
// (cột NOT NULL). QL duyệt: APPROVED/REJECTED kèm review_note.
// linked_po_id để phần PO của nhóm điền sau (chưa làm ở đây).
import * as medicineSuggestionRepository from '../repositories/medicine-suggestion.repository.js';
import * as productRepository from '../repositories/product.repository.js';
import * as medicalRepository from '../repositories/medical.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { generateCode } from '../utils/codeGenerator.js';

// MED-09: Bác sĩ đề xuất nhập thêm / thuốc mới / ngừng thuốc.
const suggestMedicine = async (vetUserId, payload) => {
  const vet = await medicalRepository.findApprovedVetByUserId(vetUserId);
  if (!vet) {
    throw new ApiError(403, 'Chỉ bác sĩ thú y mới được đề xuất', 'FORBIDDEN');
  }

  const proposalType = payload.proposal_type;
  let productId = payload.product_id ? Number(payload.product_id) : null;
  let proposedProductName = payload.proposed_product_name || null;

  if (proposalType === 'NEW_DRUG') {
    if (!proposedProductName) {
      throw new ApiError(400, 'Thuốc mới phải có tên đề xuất', 'MISSING_PRODUCT_NAME');
    }
    productId = null;
  } else {
    // RESTOCK / DISCONTINUE: bắt buộc có product_id (theo CHECK của DB).
    if (!productId) {
      throw new ApiError(400, 'Phải chọn sản phẩm cần nhập thêm hoặc ngừng', 'MISSING_PRODUCT_ID');
    }
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw new ApiError(404, 'Không tìm thấy sản phẩm', 'PRODUCT_NOT_FOUND');
    }
    if (!proposedProductName) {
      proposedProductName = product.product_name;
    }
  }

  return medicineSuggestionRepository.createProposal({
    proposal_code: generateCode('PRP'),
    proposal_type: proposalType,
    product_id: productId,
    proposed_product_name: proposedProductName,
    proposed_unit_name: payload.proposed_unit_name || null,
    proposed_quantity: payload.proposed_quantity ? Number(payload.proposed_quantity) : null,
    suggested_supplier_id: payload.suggested_supplier_id ? Number(payload.suggested_supplier_id) : null,
    reason: payload.reason,
    proposal_status: 'PENDING',
    proposed_by_doctor_id: Number(vet.user_id),
  });
};

// MED-09b: Quản lý xem danh sách đề xuất (lọc theo trạng thái).
const listSuggestions = async (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const result = await medicineSuggestionRepository.listProposals({
    proposal_status: query.proposal_status || query.status || null,
    page,
    limit,
  });
  return {
    data: result.data,
    pagination: { page, limit, total: result.total, total_pages: Math.ceil(result.total / limit) },
  };
};

// MED-09c (endpoint mới): QL duyệt / từ chối đề xuất.
// Cần endpoint này để các trường reviewed_by_ql_id / reviewed_at / review_note
// của schema mới dùng được (bản cũ không có bước duyệt).
const reviewProposal = async (proposalId, qlUserId, payload) => {
  const proposal = await medicineSuggestionRepository.findProposalById(proposalId);
  if (!proposal) {
    throw new ApiError(404, 'Không tìm thấy đề xuất', 'PROPOSAL_NOT_FOUND');
  }
  if (proposal.proposal_status !== 'PENDING') {
    throw new ApiError(409, 'Đề xuất này đã được duyệt hoặc từ chối rồi', 'PROPOSAL_ALREADY_REVIEWED');
  }
  return medicineSuggestionRepository.updateProposalReview(proposalId, {
    proposal_status: payload.proposal_status,
    reviewed_by_ql_id: Number(qlUserId),
    review_note: payload.review_note || null,
  });
};

export {
  suggestMedicine,
  listSuggestions,
  reviewProposal,
};
