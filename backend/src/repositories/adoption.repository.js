import { In } from 'typeorm';
import { AppDataSource } from '../config/data-source.js';
import {
  AdoptionListingEntity,
  AdoptionApplicationEntity,
  AdoptionApplicationHistoryEntity,
  AdoptionHandoverAppointmentEntity,
  PetOwnershipHistoryEntity,
} from '../entities/adoption.entity.js';
import { PetEntity, PetSpeciesEntity, PetBreedEntity, PetImageEntity } from '../entities/pet.entity.js';
import { CustomerProfileEntity, RescueStationProfileEntity, UserEntity } from '../entities/user.entity.js';

class AdoptionRepository {
  constructor(dataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  getRepo(entity, manager = null) {
    return manager ? manager.getRepository(entity) : this.dataSource.getRepository(entity);
  }

  async runSerializableTransaction(callback) {
    if (typeof this.dataSource?.createQueryRunner === 'function') {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction('SERIALIZABLE');
      try {
        const result = await callback(queryRunner.manager);
        await queryRunner.commitTransaction();
        return result;
      } catch (err) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }
        throw err;
      } finally {
        await queryRunner.release();
      }
    }
    return await this.dataSource.transaction(callback);
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

  async findRescueStationByUserId(userId, manager = null) {
    return await this.getRepo(RescueStationProfileEntity, manager).findOne({
      where: { UserID: Number(userId), IsActive: true },
    });
  }

  async findRescueStationById(stationId, manager = null) {
    return await this.getRepo(RescueStationProfileEntity, manager).findOne({
      where: { RescueStationID: Number(stationId), IsActive: true },
    });
  }

  async findPetById(petId, manager = null) {
    return await this.getRepo(PetEntity, manager).findOne({
      where: { PetID: Number(petId), IsActive: true },
    });
  }

  async findOpenListingByPetId(petId, manager = null) {
    return await this.getRepo(AdoptionListingEntity, manager).findOne({
      where: {
        PetID: Number(petId),
        ListingStatus: In(['Draft', 'Available', 'Pending']),
      },
    });
  }

  async findListingById(listingId, manager = null, lock = false) {
    if (lock && manager && typeof manager.query === 'function') {
      const rows = await manager.query(
        `SELECT * FROM dbo.AdoptionListings WITH (UPDLOCK, HOLDLOCK) WHERE AdoptionListingID = @0`,
        [Number(listingId)]
      );
      return rows[0] || null;
    }
    return await this.getRepo(AdoptionListingEntity, manager).findOne({
      where: { AdoptionListingID: Number(listingId) },
    });
  }

  async createListing(data, manager = null) {
    const repo = this.getRepo(AdoptionListingEntity, manager);
    return await repo.save(repo.create(data));
  }

  async updateListingStatus(listingId, listingStatus, manager = null) {
    await this.getRepo(AdoptionListingEntity, manager).update(
      { AdoptionListingID: Number(listingId) },
      { ListingStatus: listingStatus }
    );
  }

  async findListings({ page = 1, limit = 20, status = null, species = null, search = '' }) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'al.AdoptionListingID AS AdoptionListingID',
        'al.PetID AS PetID',
        'al.RescueStationID AS RescueStationID',
        'al.ListingTitle AS ListingTitle',
        'al.Description AS Description',
        'al.HealthSummary AS HealthSummary',
        'al.Temperament AS Temperament',
        'al.AdoptionRequirements AS AdoptionRequirements',
        'al.ListingStatus AS ListingStatus',
        'al.PublishedAt AS PublishedAt',
        'al.CreatedAt AS CreatedAt',
        'p.PetName AS PetName',
        'p.Gender AS Gender',
        'p.BirthDate AS BirthDate',
        'p.WeightKg AS WeightKg',
        'p.Color AS Color',
        'sp.SpeciesName AS SpeciesName',
        'br.BreedName AS BreedName',
        'rs.StationName AS StationName',
        'rs.Address AS StationAddress',
        'pi.ImageUrl AS PrimaryImageUrl',
      ])
      .from(AdoptionListingEntity, 'al')
      .innerJoin(PetEntity, 'p', 'p.PetID = al.PetID')
      .leftJoin(PetSpeciesEntity, 'sp', 'sp.SpeciesID = p.SpeciesID')
      .leftJoin(PetBreedEntity, 'br', 'br.BreedID = p.BreedID')
      .leftJoin(RescueStationProfileEntity, 'rs', 'rs.RescueStationID = al.RescueStationID')
      .leftJoin(PetImageEntity, 'pi', 'pi.PetID = p.PetID AND pi.IsPrimary = 1');

    if (status) {
      qb.andWhere('al.ListingStatus = :status', { status });
    } else {
      qb.andWhere('al.ListingStatus IN (:...defaultStatuses)', {
        defaultStatuses: ['Available', 'Pending', 'Adopted'],
      });
    }

    if (species) {
      qb.andWhere('sp.SpeciesName = :species', { species });
    }

    if (search && search.trim()) {
      qb.andWhere('(al.ListingTitle LIKE :kw OR p.PetName LIKE :kw OR br.BreedName LIKE :kw)', {
        kw: `${search.trim()}%`,
      });
    }

    const totalItems = await qb.getCount();
    const items = await qb
      .orderBy('al.CreatedAt', 'DESC')
      .offset((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .getRawMany();

    return { items, totalItems };
  }

  async findActiveApplicationByListingAndCustomer(listingId, customerId, manager = null) {
    if (manager && typeof manager.query === 'function') {
      const rows = await manager.query(
        `SELECT TOP (1) * FROM dbo.AdoptionApplications WITH (UPDLOCK, HOLDLOCK)
         WHERE AdoptionListingID = @0
           AND CustomerID = @1
           AND ApplicationStatus IN (N'Pending', N'UnderReview', N'Approved', N'Completed')`,
        [Number(listingId), Number(customerId)]
      );
      return rows[0] || null;
    }
    return await this.getRepo(AdoptionApplicationEntity, manager).findOne({
      where: {
        AdoptionListingID: Number(listingId),
        CustomerID: Number(customerId),
        ApplicationStatus: In(['Pending', 'UnderReview', 'Approved', 'Completed']),
      },
    });
  }

  async findApprovedOrCompletedApplicationByListing(listingId, excludeApplicationId = null, manager = null) {
    if (manager && typeof manager.query === 'function') {
      const rows = await manager.query(
        `SELECT TOP (1) * FROM dbo.AdoptionApplications WITH (UPDLOCK, HOLDLOCK)
         WHERE AdoptionListingID = @0
           AND ApplicationStatus IN (N'Approved', N'Completed')
           ${excludeApplicationId ? 'AND AdoptionApplicationID <> @1' : ''}`,
        excludeApplicationId ? [Number(listingId), Number(excludeApplicationId)] : [Number(listingId)]
      );
      return rows[0] || null;
    }
    const items = await this.getRepo(AdoptionApplicationEntity, manager).find({
      where: {
        AdoptionListingID: Number(listingId),
        ApplicationStatus: In(['Approved', 'Completed']),
      },
    });
    return items.find((a) => !excludeApplicationId || Number(a.AdoptionApplicationID) !== Number(excludeApplicationId)) || null;
  }

  async createApplicationAggregate({ applicationData, historyData }, manager = null) {
    const appRepo = this.getRepo(AdoptionApplicationEntity, manager);
    const saved = await appRepo.save(appRepo.create(applicationData));

    if (historyData) {
      const histRepo = this.getRepo(AdoptionApplicationHistoryEntity, manager);
      await histRepo.save(
        histRepo.create({
          ...historyData,
          AdoptionApplicationID: Number(saved.AdoptionApplicationID),
        })
      );
    }

    return await this.findApplicationById(saved.AdoptionApplicationID, manager);
  }

  async findApplicationById(applicationId, manager = null, lock = false) {
    if (lock && manager && typeof manager.query === 'function') {
      await manager.query(
        `SELECT AdoptionApplicationID FROM dbo.AdoptionApplications WITH (UPDLOCK, HOLDLOCK) WHERE AdoptionApplicationID = @0`,
        [Number(applicationId)]
      );
    }

    const qb = (manager ? manager.createQueryBuilder() : this.dataSource.createQueryBuilder())
      .select([
        'aa.AdoptionApplicationID AS AdoptionApplicationID',
        'aa.AdoptionListingID AS AdoptionListingID',
        'aa.CustomerID AS CustomerID',
        'aa.ApplicationStatus AS ApplicationStatus',
        'aa.ApplicantReason AS ApplicantReason',
        'aa.LivingEnvironment AS LivingEnvironment',
        'aa.ExperienceDescription AS ExperienceDescription',
        'aa.ReviewedByUserID AS ReviewedByUserID',
        'aa.ReviewedAt AS ReviewedAt',
        'aa.ReviewNote AS ReviewNote',
        'aa.HandoverConfirmedByStationAt AS HandoverConfirmedByStationAt',
        'aa.HandoverConfirmedByCustomerAt AS HandoverConfirmedByCustomerAt',
        'aa.HandoverNote AS HandoverNote',
        'aa.CreatedAt AS CreatedAt',
        'al.PetID AS PetID',
        'al.RescueStationID AS RescueStationID',
        'al.ListingTitle AS ListingTitle',
        'al.ListingStatus AS ListingStatus',
        'p.PetName AS PetName',
        'cp.FullName AS CustomerName',
        'cp.UserID AS CustomerUserID',
        'u.Email AS CustomerEmail',
        'u.PhoneNumber AS CustomerPhone',
        'rs.StationName AS StationName',
        'rs.UserID AS StationUserID',
      ])
      .from(AdoptionApplicationEntity, 'aa')
      .innerJoin(AdoptionListingEntity, 'al', 'al.AdoptionListingID = aa.AdoptionListingID')
      .innerJoin(PetEntity, 'p', 'p.PetID = al.PetID')
      .innerJoin(CustomerProfileEntity, 'cp', 'cp.CustomerID = aa.CustomerID')
      .leftJoin(UserEntity, 'u', 'u.UserID = cp.UserID')
      .leftJoin(RescueStationProfileEntity, 'rs', 'rs.RescueStationID = al.RescueStationID')
      .where('aa.AdoptionApplicationID = :id', { id: Number(applicationId) });

    return (await qb.getRawOne()) || null;
  }

  async findApplications({ customerId = null, rescueStationId = null, status = null, page = 1, limit = 20 }) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'aa.AdoptionApplicationID AS AdoptionApplicationID',
        'aa.AdoptionListingID AS AdoptionListingID',
        'aa.CustomerID AS CustomerID',
        'aa.ApplicationStatus AS ApplicationStatus',
        'aa.ApplicantReason AS ApplicantReason',
        'aa.LivingEnvironment AS LivingEnvironment',
        'aa.ExperienceDescription AS ExperienceDescription',
        'aa.ReviewedAt AS ReviewedAt',
        'aa.ReviewNote AS ReviewNote',
        'aa.HandoverConfirmedByStationAt AS HandoverConfirmedByStationAt',
        'aa.HandoverConfirmedByCustomerAt AS HandoverConfirmedByCustomerAt',
        'aa.HandoverNote AS HandoverNote',
        'aa.CreatedAt AS CreatedAt',
        'al.PetID AS PetID',
        'al.RescueStationID AS RescueStationID',
        'al.ListingTitle AS ListingTitle',
        'al.ListingStatus AS ListingStatus',
        'p.PetName AS PetName',
        'cp.FullName AS CustomerName',
        'u.Email AS CustomerEmail',
        'u.PhoneNumber AS CustomerPhone',
        'rs.StationName AS StationName',
      ])
      .from(AdoptionApplicationEntity, 'aa')
      .innerJoin(AdoptionListingEntity, 'al', 'al.AdoptionListingID = aa.AdoptionListingID')
      .innerJoin(PetEntity, 'p', 'p.PetID = al.PetID')
      .innerJoin(CustomerProfileEntity, 'cp', 'cp.CustomerID = aa.CustomerID')
      .leftJoin(UserEntity, 'u', 'u.UserID = cp.UserID')
      .leftJoin(RescueStationProfileEntity, 'rs', 'rs.RescueStationID = al.RescueStationID');

    if (customerId) qb.andWhere('aa.CustomerID = :customerId', { customerId: Number(customerId) });
    if (rescueStationId) qb.andWhere('al.RescueStationID = :stationId', { stationId: Number(rescueStationId) });
    if (status) qb.andWhere('aa.ApplicationStatus = :status', { status });

    const totalItems = await qb.getCount();
    const items = await qb
      .orderBy('aa.CreatedAt', 'DESC')
      .offset((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .getRawMany();

    return { items, totalItems };
  }

  async updateApplication(applicationId, patch, manager = null) {
    await this.getRepo(AdoptionApplicationEntity, manager).update(
      { AdoptionApplicationID: Number(applicationId) },
      patch
    );
    return await this.findApplicationById(applicationId, manager);
  }

  async addApplicationHistory(data, manager = null) {
    const repo = this.getRepo(AdoptionApplicationHistoryEntity, manager);
    return await repo.save(repo.create(data));
  }

  async hasOverlappingServiceAppointment(petId, startAt, endAt, manager = null) {
    const runner = manager || this.dataSource;
    if (!runner || typeof runner.query !== 'function') return false;
    const rows = await runner.query(
      `SELECT TOP (1) AppointmentID
       FROM dbo.Appointments WITH (UPDLOCK, HOLDLOCK)
       WHERE PetID = @0
         AND AppointmentStatus NOT IN (N'Cancelled', N'Rejected', N'NoShow')
         AND NOT (PaymentTiming = N'Prepaid' AND PaymentStatus = N'Prepaid_Pending' AND PaymentExpiresAt IS NOT NULL AND PaymentExpiresAt < SYSDATETIME())
         AND AppointmentAt < @1
         AND COALESCE(AppointmentEndAt, DATEADD(MINUTE, 60, AppointmentAt)) > @2`,
      [Number(petId), endAt, startAt]
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async scheduleHandoverViaSp({ applicationId, startAt, endAt, notes = null }) {
    const rows = await this.dataSource.query(
      `EXEC dbo.usp_ScheduleAdoptionHandover
         @AdoptionApplicationID = @0,
         @StartAt = @1,
         @EndAt = @2,
         @Notes = @3`,
      [Number(applicationId), startAt, endAt, notes]
    );
    return rows[0] || null;
  }

  async findActiveHandoverByApplication(applicationId, manager = null) {
    return await this.getRepo(AdoptionHandoverAppointmentEntity, manager).findOne({
      where: {
        AdoptionApplicationID: Number(applicationId),
        ScheduleStatus: In(['Scheduled', 'Confirmed']),
      },
      order: { AdoptionHandoverAppointmentID: 'DESC' },
    });
  }

  async findOwnershipHistoryByApplication(applicationId, manager = null) {
    return await this.getRepo(PetOwnershipHistoryEntity, manager).findOne({
      where: { AdoptionApplicationID: Number(applicationId) },
    });
  }

  async completeHandoverTransfer({ application, actorUserId }, manager) {
    const pet = await this.findPetById(application.PetID, manager);
    if (!pet) return null;

    const existingTransfer = await this.findOwnershipHistoryByApplication(
      application.AdoptionApplicationID,
      manager
    );
    if (existingTransfer) {
      return existingTransfer;
    }

    await this.getRepo(PetEntity, manager).update(
      { PetID: Number(pet.PetID) },
      {
        CurrentOwnerType: 'Customer',
        CustomerID: Number(application.CustomerID),
        RescueStationID: null,
        UpdatedAt: new Date(),
      }
    );

    const historyRepo = this.getRepo(PetOwnershipHistoryEntity, manager);
    const ownershipRecord = await historyRepo.save(
      historyRepo.create({
        PetID: Number(pet.PetID),
        PreviousOwnerType: pet.CurrentOwnerType || 'RescueStation',
        PreviousCustomerID: pet.CustomerID ? Number(pet.CustomerID) : null,
        PreviousRescueStationID: pet.RescueStationID ? Number(pet.RescueStationID) : null,
        NewOwnerType: 'Customer',
        NewCustomerID: Number(application.CustomerID),
        NewRescueStationID: null,
        AdoptionApplicationID: Number(application.AdoptionApplicationID),
        TransferReason: 'Hoàn tất bàn giao nhận nuôi thú cưng',
        RecordedByUserID: Number(actorUserId),
      })
    );

    await this.getRepo(AdoptionHandoverAppointmentEntity, manager).update(
      {
        AdoptionApplicationID: Number(application.AdoptionApplicationID),
        ScheduleStatus: In(['Scheduled', 'Confirmed']),
      },
      { ScheduleStatus: 'Completed', UpdatedAt: new Date() }
    );

    await this.updateListingStatus(application.AdoptionListingID, 'Adopted', manager);
    await this.getRepo(AdoptionApplicationEntity, manager).update(
      { AdoptionApplicationID: Number(application.AdoptionApplicationID) },
      { ApplicationStatus: 'Completed' }
    );

    return ownershipRecord;
  }
}

const defaultAdoptionRepository = new AdoptionRepository();
export { defaultAdoptionRepository, AdoptionRepository };
export default defaultAdoptionRepository;

