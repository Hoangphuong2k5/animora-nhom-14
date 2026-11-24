// Repository hồ sơ thú cưng, lịch sức khỏe, log cân, audit log
// — theo schema Animora v1.5 mới (56 bảng).
// Bỏ hẳn so với bản cũ: findByOwnerId (owner_id -> customer_id),
// createAuditLog kiểu cũ (audit_logs -> system_audit_logs),
// findBySlug (products.slug đã bỏ), các hàm dùng bảng pet_vaccinations.
// customer_id lấy từ bảng customers theo user_id (customers.user_id).
import { AppDataSource } from '../config/data-source.js';
import { PetEntity, PetHealthScheduleEntity, PetWeightLogEntity, SystemAuditLogEntity } from '../entities/pet-phuong.entity.js';
import { ApiError } from '../utils/ApiError.js';

const getPetRepo = (manager = null) => (manager || AppDataSource).getRepository(PetEntity);
const getHealthScheduleRepo = (manager = null) => (manager || AppDataSource).getRepository(PetHealthScheduleEntity);
const getWeightLogRepo = (manager = null) => (manager || AppDataSource).getRepository(PetWeightLogEntity);
const getSystemAuditLogRepo = (manager = null) => (manager || AppDataSource).getRepository(SystemAuditLogEntity);

// customers.user_id -> customers.customer_id (pets.customer_id trỏ vào đây).
const findCustomerIdByUserId = async (userId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(`SELECT customer_id FROM dbo.customers WHERE user_id = @0`, [Number(userId)]);
  return rows[0] ? Number(rows[0].customer_id) : null;
};

const findById = async (petId, manager = null) => {
  const pet = await getPetRepo(manager).findOne({ where: { pet_id: Number(petId), is_hidden: false } });
  return pet || null;
};

const findByCustomerId = async (customerId, manager = null) => {
  return getPetRepo(manager).find({
    where: { customer_id: Number(customerId), is_hidden: false },
    order: { created_at: 'DESC' },
  });
};

const createPet = async (petData, manager = null) => {
  const pet = getPetRepo(manager).create(petData);
  return getPetRepo(manager).save(pet);
};

const updatePet = async (petId, petData, manager = null) => {
  const repo = getPetRepo(manager);
  await repo.update({ pet_id: Number(petId) }, petData);
  return findById(petId, manager);
};

const findSpeciesIdByCode = async (speciesCode, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(`SELECT species_id FROM dbo.pet_species WHERE species_code = @0`, [speciesCode]);
  return rows[0] ? Number(rows[0].species_id) : null;
};

const findBreedById = async (breedId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT breed_id, species_id, breed_name FROM dbo.pet_breeds WHERE breed_id = @0`,
    [Number(breedId)],
  );
  return rows[0] || null;
};

// Lịch sức khỏe (PET-07): pet_health_schedules thay cho pet_vaccinations.
const findHealthSchedulesByPetId = async (petId, manager = null) => {
  return getHealthScheduleRepo(manager).find({
    where: { pet_id: Number(petId) },
    order: { performed_date: 'DESC' },
  });
};

const createHealthSchedule = async (scheduleData, manager = null) => {
  const schedule = getHealthScheduleRepo(manager).create(scheduleData);
  return getHealthScheduleRepo(manager).save(schedule);
};

// Log đổi cân (PET-02 đổi cân, MED-02 cân lúc khám).
const createWeightLog = async (logData, manager = null) => {
  const log = getWeightLogRepo(manager).create(logData);
  return getWeightLogRepo(manager).save(log);
};

// Audit log hệ thống (PRD-05). entity_id là NVARCHAR(100) nên chuyển sang chuỗi.
const createAuditLog = async (logData, manager = null) => {
  const log = getSystemAuditLogRepo(manager).create({
    ...logData,
    entity_id: String(logData.entity_id),
  });
  return getSystemAuditLogRepo(manager).save(log);
};

export {
  findCustomerIdByUserId,
  findById,
  findByCustomerId,
  createPet,
  updatePet,
  findSpeciesIdByCode,
  findBreedById,
  findHealthSchedulesByPetId,
  createHealthSchedule,
  createWeightLog,
  createAuditLog,
};
