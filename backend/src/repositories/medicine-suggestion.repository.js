// Repository đề xuất kho (MED-09) — theo schema Animora v1.5 mới.
// medicine_suggestions -> warehouse_proposals (kho chung, bỏ hộp thuốc riêng).
// Duyệt đề xuất: QL đặt proposal_status APPROVED/REJECTED kèm review_note;
// linked_po_id để phần PO của nhóm điền sau (chưa làm ở đây).
import { AppDataSource } from '../config/data-source.js';
import { WarehouseProposalEntity } from '../entities/medicine-suggestion.entity.js';
import { ApiError } from '../utils/ApiError.js';

const getWarehouseProposalRepo = (manager = null) => (manager || AppDataSource).getRepository(WarehouseProposalEntity);

const createProposal = async (proposalData, manager = null) => {
  const proposal = getWarehouseProposalRepo(manager).create(proposalData);
  return getWarehouseProposalRepo(manager).save(proposal);
};

const findProposalById = async (proposalId, manager = null) => {
  return getWarehouseProposalRepo(manager).findOne({ where: { proposal_id: Number(proposalId) } });
};

const listProposals = async ({ proposal_status, page = 1, limit = 20 }) => {
  const queryBuilder = getWarehouseProposalRepo().createQueryBuilder('wp');
  if (proposal_status) {
    queryBuilder.andWhere('wp.proposal_status = :proposalStatus', { proposalStatus: proposal_status });
  }
  const total = await queryBuilder.getCount();
  const proposals = await queryBuilder
    .orderBy('wp.created_at', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();
  return { data: proposals, total };
};

const updateProposalReview = async (proposalId, reviewData, manager = null) => {
  const repo = getWarehouseProposalRepo(manager);
  await repo.update(
    { proposal_id: Number(proposalId) },
    {
      proposal_status: reviewData.proposal_status,
      reviewed_by_ql_id: reviewData.reviewed_by_ql_id,
      reviewed_at: new Date(),
      review_note: reviewData.review_note || null,
    },
  );
  return findProposalById(proposalId, manager);
};

export {
  createProposal,
  findProposalById,
  listProposals,
  updateProposalReview,
};
