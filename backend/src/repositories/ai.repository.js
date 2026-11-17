import { AppDataSource } from '../config/data-source.js';
import { AiConversationEntity, AiMessageEntity } from '../entities/ai.entity.js';
import { PetEntity, PetSpeciesEntity, PetBreedEntity } from '../entities/pet.entity.js';
import { ServiceCategoryEntity, ServiceEntity } from '../entities/service.entity.js';
import { CustomerProfileEntity, UserEntity } from '../entities/user.entity.js';
import { inferServiceKind } from './service.repository.js';

const MEDICAL_CATEGORY_NAMES = ['Khám và điều trị', 'Tiêm phòng và tẩy giun'];

/**
 * AiRepository ánh xạ với AnimoraDB_Complete_ver1_5_Clean.sql
 */
class AiRepository {
  constructor(dataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  getRepo(entity, manager = null) {
    return manager ? manager.getRepository(entity) : this.dataSource.getRepository(entity);
  }

  async resolveCustomerByUserId(userId) {
    const cpRepo = this.getRepo(CustomerProfileEntity);
    let profile = await cpRepo.findOne({ where: { UserID: Number(userId) } });
    if (profile) return profile;

    const user = await this.getRepo(UserEntity).findOne({ where: { UserID: Number(userId) } });
    if (!user) return null;

    profile = await cpRepo.save(
      cpRepo.create({
        UserID: Number(userId),
        FullName: user.Email.split('@')[0],
      })
    );
    return profile;
  }

  async findPetById(petId) {
    const row = await this.dataSource
      .createQueryBuilder()
      .select([
        'p.PetID AS PetID',
        'p.PetName AS PetName',
        'p.BirthDate AS BirthDate',
        'p.Gender AS Gender',
        'p.CustomerID AS CustomerID',
        'p.WeightKg AS WeightKg',
        'p.GeneralNotes AS GeneralNotes',
        'p.IsActive AS IsActive',
        'ps.SpeciesName AS SpeciesName',
        'pb.BreedName AS BreedName',
        'cp.UserID AS OwnerUserID',
      ])
      .from(PetEntity, 'p')
      .leftJoin(PetSpeciesEntity, 'ps', 'ps.SpeciesID = p.SpeciesID')
      .leftJoin(PetBreedEntity, 'pb', 'pb.BreedID = p.BreedID')
      .leftJoin(CustomerProfileEntity, 'cp', 'cp.CustomerID = p.CustomerID')
      .where('p.PetID = :petId AND p.IsActive = 1', { petId: Number(petId) })
      .getRawOne();

    if (!row) return null;
    return {
      ...row,
      id: Number(row.PetID),
      name: row.PetName,
      species: row.SpeciesName,
      breed: row.BreedName,
      weight: row.WeightKg,
      birth_date: row.BirthDate,
      owner_id: row.OwnerUserID ? Number(row.OwnerUserID) : null,
      customer_id: row.CustomerID ? Number(row.CustomerID) : null,
    };
  }

  async createConversation(customerId, title = null) {
    const repo = this.getRepo(AiConversationEntity);
    return await repo.save(
      repo.create({
        CustomerID: Number(customerId),
        ConversationTitle: title,
        ConversationStatus: 'Active',
      })
    );
  }

  async findConversationById(id) {
    return await this.getRepo(AiConversationEntity).findOne({
      where: { AIConversationID: Number(id) },
    });
  }

  async findConversationsByCustomer(customerId, { after_id, page = 1, limit = 20 }) {
    const qb = this.getRepo(AiConversationEntity)
      .createQueryBuilder('c')
      .where('c.CustomerID = :customerId', { customerId: Number(customerId) });

    const total = await qb.getCount();
    if (after_id) {
      qb.andWhere('c.AIConversationID < :afterId', { afterId: Number(after_id) })
        .orderBy('c.AIConversationID', 'DESC')
        .take(Number(limit));
    } else {
      qb.orderBy('c.AIConversationID', 'DESC')
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit));
    }
    const items = await qb.getMany();
    const nextCursor = items.length > 0 ? Number(items[items.length - 1].AIConversationID) : null;
    return { items, total, page: Number(page), limit: Number(limit), nextCursor };
  }

  async createMessage(conversationId, role, content) {
    const repo = this.getRepo(AiMessageEntity);
    const senderType =
      role === 'assistant' ? 'Assistant' : role === 'system' ? 'System' : 'Customer';
    return await repo.save(
      repo.create({
        AIConversationID: Number(conversationId),
        SenderType: senderType,
        MessageContent: content,
      })
    );
  }

  async findMessages(conversationId, { after_id, page = 1, limit = 50 }) {
    const qb = this.getRepo(AiMessageEntity)
      .createQueryBuilder('m')
      .where('m.AIConversationID = :conversationId', { conversationId: Number(conversationId) });

    const total = await qb.getCount();
    if (after_id) {
      qb.andWhere('m.AIConversationMessageID > :afterId', { afterId: Number(after_id) })
        .orderBy('m.AIConversationMessageID', 'ASC')
        .take(Number(limit));
    } else {
      qb.orderBy('m.AIConversationMessageID', 'ASC')
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit));
    }
    const items = await qb.getMany();
    const nextCursor =
      items.length > 0 ? Number(items[items.length - 1].AIConversationMessageID) : null;
    return { items, total, page: Number(page), limit: Number(limit), nextCursor };
  }

  async findRecentMessages(conversationId, limit = 10) {
    const rows = await this.getRepo(AiMessageEntity)
      .createQueryBuilder('m')
      .where('m.AIConversationID = :conversationId', { conversationId: Number(conversationId) })
      .orderBy('m.AIConversationMessageID', 'DESC')
      .take(Number(limit))
      .getMany();
    return rows.reverse();
  }

  async findSuggestedServices(serviceKind, limit = 3) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        's.ServiceID AS ServiceID',
        's.ServiceName AS ServiceName',
        'sc.CategoryName AS CategoryName',
        's.BasePrice AS BasePrice',
        's.EstimatedDurationMinutes AS EstimatedDurationMinutes',
      ])
      .from(ServiceEntity, 's')
      .leftJoin(ServiceCategoryEntity, 'sc', 'sc.ServiceCategoryID = s.ServiceCategoryID')
      .where('s.IsActive = 1');

    if (serviceKind === 'medical') {
      qb.andWhere('sc.CategoryName IN (:...medicalCats)', { medicalCats: MEDICAL_CATEGORY_NAMES });
    } else if (serviceKind === 'care') {
      qb.andWhere('(sc.CategoryName IS NULL OR sc.CategoryName NOT IN (:...medicalCats))', {
        medicalCats: MEDICAL_CATEGORY_NAMES,
      });
    }

    const rows = await qb.orderBy('s.ServiceID', 'ASC').limit(Number(limit)).getRawMany();
    return rows.map((r) => ({
      ...r,
      service_kind: inferServiceKind(r.CategoryName),
    }));
  }
}

const defaultAiRepository = new AiRepository();
export { defaultAiRepository, AiRepository };
export default defaultAiRepository;
