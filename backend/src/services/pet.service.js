import defaultPetRepository from '../repositories/pet.repository.js';
import ApiError from '../utils/ApiError.js';
import { toPetDTO, toSpeciesDTO } from '../dtos/pet.dto.js';

const STAFF_VIEW_ROLES = new Set(['admin', 'manager', 'staff', 'expert', 'doctor', 'care_staff']);

/**
 * PetService (AnimoraDB ver 1.5)
 */
class PetService {
  constructor(petRepository = defaultPetRepository) {
    this.petRepository = petRepository;
  }

  async listSpecies() {
    const species = await this.petRepository.findAllSpeciesWithBreeds();
    return species.map(toSpeciesDTO);
  }

  async getMyPets(userId, query = {}) {
    const customer = await this.petRepository.resolveCustomerByUserId(userId);
    if (!customer) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
    }

    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
    const { items, totalItems } = await this.petRepository.findPetsByCustomerId(
      Number(customer.CustomerID),
      { page, limit, search: query.search || '' }
    );

    return {
      items: items.map(toPetDTO),
      page,
      limit,
      totalItems,
    };
  }

  async getPetDetail(currentUser, petId) {
    const pet = await this.petRepository.findPetById(petId, true);
    if (!pet) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ thú cưng', 'PET_NOT_FOUND');
    }

    this.assertCanViewPet(currentUser, pet);
    return toPetDTO(pet);
  }

  async createPet(userId, payload) {
    const customer = await this.petRepository.resolveCustomerByUserId(userId);
    if (!customer) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
    }

    const { speciesId, breedId } = await this.petRepository.resolveSpeciesAndBreed({
      species_id: payload.species_id,
      species: payload.species,
      breed_id: payload.breed_id,
      breed: payload.breed,
    });

    if (!speciesId) {
      throw new ApiError(400, 'Loài thú cưng không tồn tại trong hệ thống', 'INVALID_PET_SPECIES');
    }

    if (payload.microchip_number) {
      const dup = await this.petRepository.findByMicrochip(payload.microchip_number);
      if (dup) {
        throw new ApiError(409, 'Số microchip này đã được đăng ký cho thú cưng khác', 'MICROCHIP_EXISTS');
      }
    }

    const created = await this.petRepository.createPet({
      CustomerID: Number(customer.CustomerID),
      SpeciesID: speciesId,
      BreedID: breedId,
      PetName: payload.name,
      BirthDate: payload.birth_date || null,
      Gender: payload.gender || 'Unknown',
      Color: payload.color || null,
      WeightKg: payload.weight_kg ?? null,
      MicrochipNumber: payload.microchip_number || null,
      GeneralNotes: payload.general_notes || null,
      image_url: payload.image_url || null,
    });

    return toPetDTO(created);
  }

  async updatePet(currentUser, petId, payload) {
    const pet = await this.petRepository.findPetById(petId, false);
    if (!pet) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ thú cưng', 'PET_NOT_FOUND');
    }

    this.assertCanModifyPet(currentUser, pet);

    const patch = {};
    if (payload.name !== undefined) patch.PetName = payload.name;
    if (payload.birth_date !== undefined) patch.BirthDate = payload.birth_date;
    if (payload.gender !== undefined) patch.Gender = payload.gender;
    if (payload.color !== undefined) patch.Color = payload.color;
    if (payload.weight_kg !== undefined) patch.WeightKg = payload.weight_kg;
    if (payload.general_notes !== undefined) patch.GeneralNotes = payload.general_notes;

    if (payload.microchip_number !== undefined) {
      const chip = payload.microchip_number ? String(payload.microchip_number).trim() : null;
      if (chip) {
        const dup = await this.petRepository.findByMicrochip(chip, petId);
        if (dup) {
          throw new ApiError(409, 'Số microchip này đã được đăng ký cho thú cưng khác', 'MICROCHIP_EXISTS');
        }
      }
      patch.MicrochipNumber = chip;
    }

    if (
      payload.species_id !== undefined ||
      payload.species !== undefined ||
      payload.breed_id !== undefined ||
      payload.breed !== undefined
    ) {
      const { speciesId, breedId } = await this.petRepository.resolveSpeciesAndBreed({
        species_id: payload.species_id ?? pet.SpeciesID,
        species: payload.species,
        breed_id: payload.breed_id,
        breed: payload.breed,
      });
      if (!speciesId) {
        throw new ApiError(400, 'Loài thú cưng không tồn tại trong hệ thống', 'INVALID_PET_SPECIES');
      }
      patch.SpeciesID = speciesId;
      if (payload.breed_id !== undefined || payload.breed !== undefined) {
        patch.BreedID = breedId;
      }
    }

    const updated = await this.petRepository.updatePet(petId, patch, payload.image_url);
    return toPetDTO(updated);
  }

  async deletePet(currentUser, petId) {
    const pet = await this.petRepository.findPetById(petId, false);
    if (!pet) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ thú cưng', 'PET_NOT_FOUND');
    }

    this.assertCanModifyPet(currentUser, pet);
    await this.petRepository.softDeletePet(petId);
    return { deleted: true, petId: Number(petId) };
  }

  assertCanViewPet(currentUser, pet) {
    const role = String(currentUser.role || '').toLowerCase();
    const dbRole = String(currentUser.dbRole || '').toLowerCase();
    if (STAFF_VIEW_ROLES.has(role) || ['admin', 'manager', 'doctor', 'carestaff'].includes(dbRole)) {
      return;
    }
    if (Number(pet.OwnerUserID) !== Number(currentUser.id)) {
      throw new ApiError(403, 'Bạn không có quyền xem hồ sơ thú cưng này', 'FORBIDDEN');
    }
  }

  assertCanModifyPet(currentUser, pet) {
    const role = String(currentUser.role || '').toLowerCase();
    const dbRole = String(currentUser.dbRole || '').toLowerCase();
    if (role === 'admin' || role === 'manager' || dbRole === 'admin' || dbRole === 'manager') {
      return;
    }
    if (Number(pet.OwnerUserID) !== Number(currentUser.id)) {
      throw new ApiError(403, 'Bạn không có quyền chỉnh sửa hồ sơ thú cưng này', 'FORBIDDEN');
    }
  }
}

const defaultPetService = new PetService();
export { defaultPetService, PetService };
export default defaultPetService;

