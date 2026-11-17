// Tầng truy vấn CSDL cho medicine_suggestions (MED-09).
// Chỉ làm việc với TypeORM DataSource, theo đúng mẫu repositories trong rules.md §7.2.
import { AppDataSource } from '../config/data-source.js';
import { MedicineSuggestionEntity } from '../entities/medicine-suggestion.entity.js';

const getSuggestionRepo = (manager) =>
  manager
    ? manager.getRepository(MedicineSuggestionEntity)
    : AppDataSource.getRepository(MedicineSuggestionEntity);

const createSuggestion = async (suggestionData, manager = null) => {
  const repo = getSuggestionRepo(manager);
  const row = repo.create(suggestionData);
  return await repo.save(row);
};

// MED-09 (phụ trợ): admin xem danh sách đề xuất để duyệt (lọc theo status, phân trang).
const listSuggestions = async ({ status, page, limit }) => {
  const repo = getSuggestionRepo();
  const qb = repo.createQueryBuilder('s');
  if (status) {
    qb.andWhere('s.status = :status', { status });
  }
  qb.orderBy('s.created_at', 'DESC');
  qb.skip((page - 1) * limit).take(limit);
  const [items, total] = await qb.getManyAndCount();
  return { items, total };
};

export {
  createSuggestion,
  listSuggestions,
};
