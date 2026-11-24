// Service hồ sơ thú cưng (PET-01/02/03/05) + lịch sức khỏe (PET-07)
// — theo schema Animora v1.5 mới.
// Quyền: chủ thú (khách) chỉ thấy/sửa thú của mình (pets.customer_id).
// Bỏ hẳn so với bản cũ: pets.chronic (không còn cột — không gộp vào đâu),
// trường weight/color/avatar/breed cũ (chỉ còn weight_kg/coat_color/
// avatar_url/breed_id + custom_breed_name), bảng pet_vaccinations.
// Chỉ nhận 4 loài: DOG, CAT, RODENT, RABBIT (D7) — bird/other trả lỗi rõ ràng.
// Khóa y tế: khi medical_locked = 1, KH không được sửa 4 trường y tế
// (weight_kg, allergies, special_behaviors, neutered_status).
// Đổi cân ghi log vào pet_weight_logs (không ghi audit_logs nữa).
import { AppDataSource } from '../config/data-source.js';
import * as petRepository from '../repositories/pet-phuong.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { generateCode } from '../utils/codeGenerator.js';

const ALLOWED_SPECIES = ['DOG', 'CAT', 'RODENT', 'RABBIT'];
const MEDICAL_FIELDS = ['weight_kg', 'allergies', 'special_behaviors', 'neutered_status'];

const toJsonString = (value) => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

const normalizeEnum = (value) => (typeof value === 'string' ? value.toUpperCase() : value);

const assertCustomer = async (userId) => {
  const customerId = await petRepository.findCustomerIdByUserId(userId);
  if (!customerId) {
    throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
  }
  return customerId;
};

const assertPetOwner = async (petId, userId) => {
  const customerId = await assertCustomer(userId);
  const pet = await petRepository.findById(petId);
  if (!pet || pet.customer_id !== customerId) {
    throw new ApiError(404, 'Không tìm thấy thú cưng', 'PET_NOT_FOUND');
  }
  return pet;
};

// PET-01: Tạo hồ sơ thú cưng.
const createPet = async (userId, payload) => {
  const customerId = await assertCustomer(userId);
  const speciesCode = normalizeEnum(payload.species);
  if (!ALLOWED_SPECIES.includes(speciesCode)) {
    throw new ApiError(
      400,
      `Loài không hợp lệ: ${payload.species}. Chỉ nhận DOG (chó), CAT (mèo), RODENT (chuột), RABBIT (thỏ).`,
      'INVALID_SPECIES',
    );
  }

  const speciesId = await petRepository.findSpeciesIdByCode(speciesCode);
  if (!speciesId) {
    throw new ApiError(400, `Loài ${speciesCode} chưa có trong hệ thống`, 'SPECIES_NOT_FOUND');
  }

  let breedId = null;
  if (payload.breed_id) {
    const breed = await petRepository.findBreedById(payload.breed_id);
    if (!breed) {
      throw new ApiError(400, 'Giống không tồn tại', 'BREED_NOT_FOUND');
    }
    if (breed.species_id !== speciesId) {
      throw new ApiError(400, 'Giống không thuộc loài đã chọn', 'BREED_SPECIES_MISMATCH');
    }
    breedId = breed.breed_id;
  }

  const petData = {
    pet_code: generateCode('PET'),
    customer_id: customerId,
    species_id: speciesId,
    breed_id: breedId,
    custom_breed_name: payload.custom_breed_name || null,
    pet_name: payload.pet_name,
    gender: normalizeEnum(payload.gender) || 'UNKNOWN',
    birth_date: payload.birth_date || null,
    estimated_age_months: payload.estimated_age_months ? Number(payload.estimated_age_months) : null,
    coat_color: payload.coat_color || null,
    avatar_url: payload.avatar_url || null,
    weight_kg: payload.weight_kg ? Number(payload.weight_kg) : null,
    weight_source: 'CUSTOMER_DECLARED',
    allergies: toJsonString(payload.allergies),
    special_behaviors: toJsonString(payload.special_behaviors),
    neutered_status: normalizeEnum(payload.neutered_status) || 'UNKNOWN',
    created_by_user_id: Number(userId),
  };

  return petRepository.createPet(petData);
};

// PET-02: Cập nhật hồ sơ thú cưng (chỉ chủ thú).
// Khi hồ sơ y tế đã khóa (medical_locked = 1) thì không được sửa 4 trường y tế.
// Đổi cân ghi 1 dòng vào pet_weight_logs.
const updatePet = async (petId, userId, payload) => {
  const pet = await assertPetOwner(petId, userId);

  const patch = {};
  if (payload.pet_name !== undefined) patch.pet_name = payload.pet_name;
  if (payload.coat_color !== undefined) patch.coat_color = payload.coat_color;
  if (payload.avatar_url !== undefined) patch.avatar_url = payload.avatar_url;
  if (payload.birth_date !== undefined) patch.birth_date = payload.birth_date;
  if (payload.estimated_age_months !== undefined) {
    patch.estimated_age_months = payload.estimated_age_months ? Number(payload.estimated_age_months) : null;
  }
  if (payload.gender !== undefined) patch.gender = normalizeEnum(payload.gender);
  if (payload.neutered_status !== undefined) patch.neutered_status = normalizeEnum(payload.neutered_status);
  if (payload.allergies !== undefined) patch.allergies = toJsonString(payload.allergies);
  if (payload.special_behaviors !== undefined) patch.special_behaviors = toJsonString(payload.special_behaviors);
  if (payload.weight_kg !== undefined) {
    patch.weight_kg = payload.weight_kg ? Number(payload.weight_kg) : null;
    patch.weight_source = 'CUSTOMER_DECLARED';
  }
  if (payload.breed_id !== undefined) {
    if (payload.breed_id) {
      const breed = await petRepository.findBreedById(payload.breed_id);
      if (!breed) {
        throw new ApiError(400, 'Giống không tồn tại', 'BREED_NOT_FOUND');
      }
      if (breed.species_id !== pet.species_id) {
        throw new ApiError(400, 'Giống không thuộc loài của thú này', 'BREED_SPECIES_MISMATCH');
      }
      patch.breed_id = breed.breed_id;
    } else {
      patch.breed_id = null;
    }
  }
  if (payload.custom_breed_name !== undefined) patch.custom_breed_name = payload.custom_breed_name;

  // Hồ sơ y tế đã khóa thì chặn 4 trường y tế.
  if (pet.medical_locked) {
    const touched = Object.keys(patch).filter((key) => MEDICAL_FIELDS.includes(key));
    if (touched.length > 0) {
      throw new ApiError(
        403,
        'Hồ sơ y tế đã bị khóa sau lần khám, chỉ bác sĩ mới được cập nhật các thông tin y tế',
        'MEDICAL_LOCKED',
      );
    }
  }

  const weightChanged = patch.weight_kg !== undefined && Number(patch.weight_kg) !== Number(pet.weight_kg);
  patch.row_version = (pet.row_version || 1) + 1;

  const updated = await AppDataSource.transaction(async (manager) => {
    const result = await petRepository.updatePet(petId, patch, manager);
    if (weightChanged) {
      await petRepository.createWeightLog(
        {
          pet_id: Number(petId),
          appointment_id: null,
          weight_kg: Number(patch.weight_kg),
          measurement_source: 'INITIAL_DECLARED', // KH tự khai (schema chỉ có 4 giá trị này)
          recorded_by_user_id: Number(userId),
          recorded_by_role: 'KH',
          note: null,
        },
        manager,
      );
    }
    return result;
  });
  return updated;
};

// PET-02b: Cập nhật dị ứng (KH khai dị ứng trước khi hồ sơ bị khóa).
const updateAllergies = async (petId, userId, payload) => {
  const pet = await assertPetOwner(petId, userId);
  if (pet.medical_locked) {
    throw new ApiError(
      403,
      'Hồ sơ y tế đã bị khóa sau lần khám, chỉ bác sĩ mới được cập nhật dị ứng',
      'MEDICAL_LOCKED',
    );
  }
  return petRepository.updatePet(petId, {
    allergies: toJsonString(payload.allergies),
    row_version: (pet.row_version || 1) + 1,
  });
};

// PET-03: Xem danh sách thú của khách.
const listMyPets = async (userId) => {
  const customerId = await assertCustomer(userId);
  return petRepository.findByCustomerId(customerId);
};

// PET-05: Xem chi tiết 1 thú của khách.
const getPetById = async (petId, userId) => {
  return assertPetOwner(petId, userId);
};

// PET-07: Xem lịch sức khỏe của thú (tiêm chủng / tẩy giun / tái khám).
const listHealthSchedules = async (petId, userId) => {
  await assertPetOwner(petId, userId);
  return petRepository.findHealthSchedulesByPetId(petId);
};

// PET-07: Tạo 1 lịch sức khỏe cho thú.
const addHealthSchedule = async (petId, userId, payload) => {
  const pet = await assertPetOwner(petId, userId);
  return petRepository.createHealthSchedule({
    pet_id: pet.pet_id,
    medical_record_id: payload.medical_record_id ? Number(payload.medical_record_id) : null,
    schedule_type: normalizeEnum(payload.schedule_type) || 'VACCINATION',
    title: payload.title,
    performed_date: payload.performed_date || null,
    next_due_date: payload.next_due_date || null,
    reminder_status: 'PENDING',
    notes: payload.notes || null,
    created_by_user_id: Number(userId),
  });
};

export {
  createPet,
  updatePet,
  updateAllergies,
  listMyPets,
  getPetById,
  listHealthSchedules,
  addHealthSchedule,
};
