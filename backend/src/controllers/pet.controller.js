import defaultPetService from '../services/pet.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

class PetController {
  constructor(petService = defaultPetService) {
    this.petService = petService;

    this.listSpecies = asyncHandler(this.listSpecies.bind(this));
    this.listMyPets = asyncHandler(this.listMyPets.bind(this));
    this.getPetById = asyncHandler(this.getPetById.bind(this));
    this.createPet = asyncHandler(this.createPet.bind(this));
    this.updatePet = asyncHandler(this.updatePet.bind(this));
    this.deletePet = asyncHandler(this.deletePet.bind(this));
  }

  async listSpecies(req, res) {
    const result = await this.petService.listSpecies();
    return successResponse(res, result, 'Lấy danh sách loài và giống thú cưng thành công');
  }

  async listMyPets(req, res) {
    const { items, page, limit, totalItems } = await this.petService.getMyPets(req.user.id, req.query);
    return paginatedResponse(res, items, page, limit, totalItems, 'Lấy danh sách thú cưng thành công');
  }

  async getPetById(req, res) {
    const result = await this.petService.getPetDetail(req.user, req.params.id);
    return successResponse(res, result, 'Lấy chi tiết hồ sơ thú cưng thành công');
  }

  async createPet(req, res) {
    const result = await this.petService.createPet(req.user.id, req.body);
    return successResponse(res, result, 'Tạo hồ sơ thú cưng thành công', 201);
  }

  async updatePet(req, res) {
    const result = await this.petService.updatePet(req.user, req.params.id, req.body);
    return successResponse(res, result, 'Cập nhật hồ sơ thú cưng thành công');
  }

  async deletePet(req, res) {
    const result = await this.petService.deletePet(req.user, req.params.id);
    return successResponse(res, result, 'Xóa hồ sơ thú cưng thành công');
  }
}

const defaultPetController = new PetController();
export { defaultPetController, PetController };
export default defaultPetController;

