import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { PetService } from '../../src/services/pet.service.js';

describe('[PET-01] Unit Tests - Quản lý hồ sơ thú cưng (AnimoraDB Pets)', () => {
  let mockPetRepo;
  let petService;

  beforeEach(() => {
    mockPetRepo = {
      resolveCustomerByUserId: jest.fn(),
      findAllSpeciesWithBreeds: jest.fn(),
      findPetsByCustomerId: jest.fn(),
      findPetById: jest.fn(),
      resolveSpeciesAndBreed: jest.fn(),
      findByMicrochip: jest.fn(),
      createPet: jest.fn(),
      updatePet: jest.fn(),
      softDeletePet: jest.fn(),
    };

    petService = new PetService(mockPetRepo);
  });

  test('TC-1: listSpecies() trả về danh sách loài và giống thú cưng', async () => {
    mockPetRepo.findAllSpeciesWithBreeds.mockResolvedValue([
      {
        SpeciesID: 1,
        SpeciesName: 'Chó',
        Description: null,
        breeds: [{ BreedID: 1, SpeciesID: 1, BreedName: 'Poodle', Description: null }],
      },
    ]);

    const result = await petService.listSpecies();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Chó');
    expect(result[0].breeds[0].name).toBe('Poodle');
  });

  test('TC-2: createPet() tạo thú cưng mới thành công', async () => {
    mockPetRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 5, UserID: 10 });
    mockPetRepo.resolveSpeciesAndBreed.mockResolvedValue({ speciesId: 1, breedId: 2 });
    mockPetRepo.findByMicrochip.mockResolvedValue(null);
    mockPetRepo.createPet.mockResolvedValue({
      PetID: 100,
      SpeciesID: 1,
      BreedID: 2,
      CustomerID: 5,
      OwnerUserID: 10,
      PetName: 'Mochi',
      SpeciesName: 'Chó',
      BreedName: 'Corgi',
      Gender: 'Female',
      WeightKg: 8.5,
      IsActive: true,
    });

    const result = await petService.createPet(10, {
      name: 'Mochi',
      species: 'Chó',
      breed: 'Corgi',
      gender: 'Female',
      weight_kg: 8.5,
    });

    expect(result.id).toBe(100);
    expect(result.name).toBe('Mochi');
    expect(result.species).toBe('Chó');
    expect(result.weight_kg).toBe(8.5);
  });

  test('TC-3: createPet() ném lỗi 409 MICROCHIP_EXISTS nếu trùng microchip', async () => {
    mockPetRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 5, UserID: 10 });
    mockPetRepo.resolveSpeciesAndBreed.mockResolvedValue({ speciesId: 1, breedId: null });
    mockPetRepo.findByMicrochip.mockResolvedValue({ PetID: 99 });

    await expect(
      petService.createPet(10, {
        name: 'Lucky',
        species_id: 1,
        microchip_number: 'MC-123456',
      })
    ).rejects.toMatchObject({ statusCode: 409, errorCode: 'MICROCHIP_EXISTS' });
  });

  test('TC-4: getPetDetail() chặn khách hàng khác xem hồ sơ thú cưng (ABAC 403)', async () => {
    mockPetRepo.findPetById.mockResolvedValue({
      PetID: 100,
      SpeciesID: 1,
      CustomerID: 5,
      OwnerUserID: 10,
      PetName: 'Mochi',
    });

    await expect(
      petService.getPetDetail({ id: 99, role: 'customer', dbRole: 'Customer' }, 100)
    ).rejects.toMatchObject({ statusCode: 403, errorCode: 'FORBIDDEN' });
  });

  test('TC-5: getPetDetail() cho phép Bác sĩ xem hồ sơ thú cưng của khách hàng', async () => {
    mockPetRepo.findPetById.mockResolvedValue({
      PetID: 100,
      SpeciesID: 1,
      CustomerID: 5,
      OwnerUserID: 10,
      PetName: 'Mochi',
      SpeciesName: 'Chó',
    });

    const result = await petService.getPetDetail(
      { id: 20, role: 'expert', dbRole: 'Doctor' },
      100
    );
    expect(result.id).toBe(100);
    expect(result.name).toBe('Mochi');
  });

  test('TC-6: deletePet() thực hiện xóa mềm thú cưng thuộc sở hữu', async () => {
    mockPetRepo.findPetById.mockResolvedValue({
      PetID: 100,
      CustomerID: 5,
      OwnerUserID: 10,
    });
    mockPetRepo.softDeletePet.mockResolvedValue(true);

    const result = await petService.deletePet({ id: 10, role: 'customer' }, 100);
    expect(mockPetRepo.softDeletePet).toHaveBeenCalledWith(100);
    expect(result).toEqual({ deleted: true, petId: 100 });
  });
});

