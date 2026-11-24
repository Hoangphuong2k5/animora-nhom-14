import { In } from 'typeorm';
import { AppDataSource } from '../config/data-source.js';
import {
  PetSpeciesEntity,
  PetBreedEntity,
  PetEntity,
  PetImageEntity,
  VaccinationRecordEntity,
  DewormingRecordEntity,
} from '../entities/pet.entity.js';
import { CustomerProfileEntity, UserEntity } from '../entities/user.entity.js';

const normalizeGender = (gender) => {
  if (!gender) return 'Unknown';
  const lower = String(gender).trim().toLowerCase();
  if (lower === 'male') return 'Male';
  if (lower === 'female') return 'Female';
  return 'Unknown';
};

/**
 * PetRepository ánh xạ với AnimoraDB_Complete_ver1_5_Clean.sql
 */
class PetRepository {
  constructor(dataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  getRepo(entity, manager = null) {
    return manager ? manager.getRepository(entity) : this.dataSource.getRepository(entity);
  }

  async resolveCustomerByUserId(userId, manager = null) {
    const cpRepo = this.getRepo(CustomerProfileEntity, manager);
    let profile = await cpRepo.findOne({ where: { UserID: Number(userId) } });
    if (profile) return profile;

    const user = await this.getRepo(UserEntity, manager).findOne({
      where: { UserID: Number(userId) },
    });
    if (!user) return null;

    profile = await cpRepo.save(
      cpRepo.create({
        UserID: Number(userId),
        FullName: user.Email.split('@')[0],
      })
    );
    return profile;
  }

  async findAllSpeciesWithBreeds() {
    const [speciesList, breeds] = await Promise.all([
      this.getRepo(PetSpeciesEntity).find({ order: { SpeciesID: 'ASC' } }),
      this.getRepo(PetBreedEntity).find({ order: { BreedID: 'ASC' } }),
    ]);

    const breedsBySpecies = new Map();
    for (const b of breeds) {
      const key = Number(b.SpeciesID);
      if (!breedsBySpecies.has(key)) breedsBySpecies.set(key, []);
      breedsBySpecies.get(key).push(b);
    }

    return speciesList.map((sp) => ({
      ...sp,
      breeds: breedsBySpecies.get(Number(sp.SpeciesID)) || [],
    }));
  }

  async resolveSpeciesAndBreed({ species_id, species, breed_id, breed }, manager = null) {
    const spRepo = this.getRepo(PetSpeciesEntity, manager);
    const brRepo = this.getRepo(PetBreedEntity, manager);

    let speciesRow = null;
    if (species_id) {
      speciesRow = await spRepo.findOne({ where: { SpeciesID: Number(species_id) } });
    } else if (species) {
      speciesRow = await spRepo.findOne({ where: { SpeciesName: String(species).trim() } });
      if (!speciesRow) {
        const lower = String(species).trim().toLowerCase();
        const aliasMap = { dog: 'Chó', cat: 'Mèo', rabbit: 'Thỏ', bird: 'Chim', other: 'Khác' };
        if (aliasMap[lower]) {
          speciesRow = await spRepo.findOne({ where: { SpeciesName: aliasMap[lower] } });
        }
      }
    }

    if (!speciesRow) return { speciesId: null, breedId: null };

    let resolvedBreedId = null;
    if (breed_id) {
      const br = await brRepo.findOne({
        where: { BreedID: Number(breed_id), SpeciesID: Number(speciesRow.SpeciesID) },
      });
      if (br) resolvedBreedId = Number(br.BreedID);
    } else if (breed && String(breed).trim()) {
      const breedName = String(breed).trim();
      let br = await brRepo.findOne({
        where: { SpeciesID: Number(speciesRow.SpeciesID), BreedName: breedName },
      });
      if (!br) {
        br = await brRepo.save(
          brRepo.create({ SpeciesID: Number(speciesRow.SpeciesID), BreedName: breedName })
        );
      }
      resolvedBreedId = Number(br.BreedID);
    }

    return { speciesId: Number(speciesRow.SpeciesID), breedId: resolvedBreedId };
  }

  async findPetsByCustomerId(customerId, { page = 1, limit = 20, search = '' }) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'p.PetID AS PetID',
        'p.SpeciesID AS SpeciesID',
        'p.BreedID AS BreedID',
        'p.PetName AS PetName',
        'p.BirthDate AS BirthDate',
        'p.Gender AS Gender',
        'p.CurrentOwnerType AS CurrentOwnerType',
        'p.CustomerID AS CustomerID',
        'p.Color AS Color',
        'p.WeightKg AS WeightKg',
        'p.MicrochipNumber AS MicrochipNumber',
        'p.GeneralNotes AS GeneralNotes',
        'p.IsActive AS IsActive',
        'p.CreatedAt AS CreatedAt',
        'p.UpdatedAt AS UpdatedAt',
        'ps.SpeciesName AS SpeciesName',
        'pb.BreedName AS BreedName',
        'cp.UserID AS OwnerUserID',
      ])
      .from(PetEntity, 'p')
      .leftJoin(PetSpeciesEntity, 'ps', 'ps.SpeciesID = p.SpeciesID')
      .leftJoin(PetBreedEntity, 'pb', 'pb.BreedID = p.BreedID')
      .leftJoin(CustomerProfileEntity, 'cp', 'cp.CustomerID = p.CustomerID')
      .where('p.CustomerID = :customerId AND p.IsActive = 1', { customerId: Number(customerId) });

    if (search && search.trim()) {
      qb.andWhere('(p.PetName LIKE :kw OR ps.SpeciesName LIKE :kw OR pb.BreedName LIKE :kw)', {
        kw: `%${search.trim()}%`,
      });
    }

    const totalItems = await qb.getCount();
    const rows = await qb
      .orderBy('p.CreatedAt', 'DESC')
      .offset((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .getRawMany();

    if (rows.length > 0) {
      const petIds = rows.map((r) => Number(r.PetID));
      const images = await this.getRepo(PetImageEntity).find({
        where: { PetID: In(petIds), IsPrimary: true },
      });
      const imgByPet = new Map(images.map((i) => [Number(i.PetID), i.ImageUrl]));
      for (const r of rows) {
        r.PrimaryImageUrl = imgByPet.get(Number(r.PetID)) || null;
      }
    }

    return { items: rows, totalItems };
  }

  async findPetById(petId, includeDetails = false, manager = null) {
    const qb = (manager ? manager.createQueryBuilder() : this.dataSource.createQueryBuilder())
      .select([
        'p.PetID AS PetID',
        'p.SpeciesID AS SpeciesID',
        'p.BreedID AS BreedID',
        'p.PetName AS PetName',
        'p.BirthDate AS BirthDate',
        'p.Gender AS Gender',
        'p.CurrentOwnerType AS CurrentOwnerType',
        'p.CustomerID AS CustomerID',
        'p.Color AS Color',
        'p.WeightKg AS WeightKg',
        'p.MicrochipNumber AS MicrochipNumber',
        'p.GeneralNotes AS GeneralNotes',
        'p.IsActive AS IsActive',
        'p.CreatedAt AS CreatedAt',
        'p.UpdatedAt AS UpdatedAt',
        'ps.SpeciesName AS SpeciesName',
        'pb.BreedName AS BreedName',
        'cp.UserID AS OwnerUserID',
      ])
      .from(PetEntity, 'p')
      .leftJoin(PetSpeciesEntity, 'ps', 'ps.SpeciesID = p.SpeciesID')
      .leftJoin(PetBreedEntity, 'pb', 'pb.BreedID = p.BreedID')
      .leftJoin(CustomerProfileEntity, 'cp', 'cp.CustomerID = p.CustomerID')
      .where('p.PetID = :petId AND p.IsActive = 1', { petId: Number(petId) });

    const row = await qb.getRawOne();
    if (!row) return null;

    if (includeDetails) {
      const [images, vaccinations, dewormings] = await Promise.all([
        this.getRepo(PetImageEntity, manager).find({
          where: { PetID: Number(petId) },
          order: { IsPrimary: 'DESC', UploadedAt: 'DESC' },
        }),
        this.getRepo(VaccinationRecordEntity, manager).find({
          where: { PetID: Number(petId) },
          order: { VaccinatedAt: 'DESC' },
        }),
        this.getRepo(DewormingRecordEntity, manager).find({
          where: { PetID: Number(petId) },
          order: { DewormedAt: 'DESC' },
        }),
      ]);
      row.images = images;
      row.PrimaryImageUrl = images.find((i) => i.IsPrimary)?.ImageUrl || images[0]?.ImageUrl || null;
      row.vaccinations = vaccinations;
      row.dewormings = dewormings;
    }

    return row;
  }

  async findByMicrochip(microchip, excludePetId = null) {
    if (!microchip || !String(microchip).trim()) return null;
    const qb = this.getRepo(PetEntity)
      .createQueryBuilder('p')
      .where('p.MicrochipNumber = :chip', { chip: String(microchip).trim() });
    if (excludePetId) {
      qb.andWhere('p.PetID != :excludePetId', { excludePetId: Number(excludePetId) });
    }
    return await qb.getOne();
  }

  async createPet(data, manager = null) {
    const run = async (trxManager) => {
      const repo = this.getRepo(PetEntity, trxManager);
      const saved = await repo.save(
        repo.create({
          SpeciesID: Number(data.SpeciesID),
          BreedID: data.BreedID ? Number(data.BreedID) : null,
          PetName: data.PetName,
          BirthDate: data.BirthDate || null,
          Gender: normalizeGender(data.Gender),
          CurrentOwnerType: 'Customer',
          CustomerID: Number(data.CustomerID),
          Color: data.Color || null,
          WeightKg: data.WeightKg !== undefined && data.WeightKg !== null ? Number(data.WeightKg) : null,
          MicrochipNumber: data.MicrochipNumber ? String(data.MicrochipNumber).trim() : null,
          GeneralNotes: data.GeneralNotes || null,
          IsActive: true,
        })
      );

      if (data.image_url) {
        const imgRepo = this.getRepo(PetImageEntity, trxManager);
        await imgRepo.save(
          imgRepo.create({
            PetID: Number(saved.PetID),
            ImageUrl: data.image_url,
            IsPrimary: true,
          })
        );
      }

      return await this.findPetById(saved.PetID, true, trxManager);
    };

    return manager ? await run(manager) : await this.dataSource.transaction(run);
  }

  async updatePet(petId, patch, imageUrl = undefined, manager = null) {
    const run = async (trxManager) => {
      const updateFields = { ...patch, UpdatedAt: new Date() };
      if (updateFields.Gender !== undefined) {
        updateFields.Gender = normalizeGender(updateFields.Gender);
      }

      await this.getRepo(PetEntity, trxManager).update({ PetID: Number(petId) }, updateFields);

      if (imageUrl !== undefined && imageUrl) {
        const imgRepo = this.getRepo(PetImageEntity, trxManager);
        await imgRepo.update({ PetID: Number(petId), IsPrimary: true }, { IsPrimary: false });
        await imgRepo.save(
          imgRepo.create({
            PetID: Number(petId),
            ImageUrl: imageUrl,
            IsPrimary: true,
          })
        );
      }

      return await this.findPetById(petId, true, trxManager);
    };

    return manager ? await run(manager) : await this.dataSource.transaction(run);
  }

  async softDeletePet(petId, manager = null) {
    await this.getRepo(PetEntity, manager).update(
      { PetID: Number(petId) },
      { IsActive: false, UpdatedAt: new Date() }
    );
    return true;
  }
}

const defaultPetRepository = new PetRepository();
export { defaultPetRepository, PetRepository, normalizeGender };
export default defaultPetRepository;

