import crypto from 'crypto';
import dayjs from 'dayjs';
import { In } from 'typeorm';
import { AppDataSource } from '../config/data-source.js';
import {
  BookingEntity,
  AppointmentServiceEntity,
  AppointmentAssignmentEntity,
  AppointmentStatusHistoryEntity,
  AppointmentChangeRequestEntity,
  PaymentEntity,
  RefundEntity,
} from '../entities/booking.entity.js';
import {
  ServiceCategoryEntity,
  ServiceEntity,
  ExpertServiceEntity,
} from '../entities/service.entity.js';
import { ExpertEntity } from '../entities/expert.entity.js';
import { PetEntity } from '../entities/pet.entity.js';
import { CustomerProfileEntity, UserEntity } from '../entities/user.entity.js';
import { inferServiceKind } from './service.repository.js';

const generateAppointmentCode = () =>
  `BKG-${dayjs().format('YYYYMMDD')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

/**
 * BookingRepository ánh xạ với AnimoraDB_Complete_ver1_5_Clean.sql
 */
class BookingRepository {
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

  async lockBookingResources({ petId, expertId = null }, manager = null) {
    if (!manager || typeof manager.query !== 'function') return;
    if (petId) {
      await manager.query(
        `SELECT PetID FROM dbo.Pets WITH (UPDLOCK, HOLDLOCK) WHERE PetID = @0`,
        [Number(petId)]
      );
    }
    if (expertId) {
      await manager.query(
        `SELECT EmployeeID FROM dbo.EmployeeProfiles WITH (UPDLOCK, HOLDLOCK) WHERE EmployeeID = @0`,
        [Number(expertId)]
      );
    }
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

  async findPetById(petId, manager = null) {
    return await this.getRepo(PetEntity, manager).findOne({
      where: { PetID: Number(petId), IsActive: true },
    });
  }

  async findServicesByIds(serviceIds, manager = null) {
    if (!serviceIds || serviceIds.length === 0) return [];
    const qb = (manager ? manager.createQueryBuilder() : this.dataSource.createQueryBuilder())
      .select([
        's.ServiceID AS ServiceID',
        's.ServiceName AS ServiceName',
        's.BasePrice AS BasePrice',
        's.EstimatedDurationMinutes AS EstimatedDurationMinutes',
        's.IsActive AS IsActive',
        'sc.CategoryName AS CategoryName',
      ])
      .from(ServiceEntity, 's')
      .leftJoin(ServiceCategoryEntity, 'sc', 'sc.ServiceCategoryID = s.ServiceCategoryID')
      .where('s.ServiceID IN (:...ids)', { ids: serviceIds.map(Number) })
      .andWhere('s.IsActive = 1');

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      ...r,
      service_kind: inferServiceKind(r.CategoryName),
    }));
  }

  async findExpertById(expertId, manager = null) {
    return await this.getRepo(ExpertEntity, manager).findOne({
      where: { EmployeeID: Number(expertId), IsActive: true },
    });
  }

  async findExpertServiceLinks(expertId, serviceIds, manager = null) {
    return await this.getRepo(ExpertServiceEntity, manager).find({
      where: {
        EmployeeID: Number(expertId),
        ServiceID: In(serviceIds.map(Number)),
        IsActive: true,
      },
    });
  }

  async hasOverlappingPetAppointment(petId, startAt, endAt, excludeAppointmentId = null, manager = null) {
    const qb = this.getRepo(BookingEntity, manager)
      .createQueryBuilder('a')
      .where('a.PetID = :petId', { petId: Number(petId) })
      .andWhere('a.AppointmentStatus NOT IN (:...inactive)', {
        inactive: ['Cancelled', 'Rejected', 'NoShow'],
      })
      .andWhere(
        "NOT (a.PaymentTiming = 'Prepaid' AND a.PaymentStatus = 'Prepaid_Pending' AND a.PaymentExpiresAt IS NOT NULL AND a.PaymentExpiresAt < SYSDATETIME())"
      )
      .andWhere('a.AppointmentAt < :endAt', { endAt })
      .andWhere('COALESCE(a.AppointmentEndAt, DATEADD(MINUTE, 60, a.AppointmentAt)) > :startAt', {
        startAt,
      });

    if (excludeAppointmentId) {
      qb.andWhere('a.AppointmentID != :excludeId', { excludeId: Number(excludeAppointmentId) });
    }
    const count = await qb.getCount();
    return count > 0;
  }

  async hasOverlappingExpertAppointment(
    expertId,
    startAt,
    endAt,
    excludeAppointmentId = null,
    manager = null
  ) {
    const qb = this.getRepo(BookingEntity, manager)
      .createQueryBuilder('a')
      .innerJoin(
        AppointmentAssignmentEntity,
        'aa',
        'aa.AppointmentID = a.AppointmentID AND aa.EmployeeID = :expertId',
        { expertId: Number(expertId) }
      )
      .where('a.AppointmentStatus NOT IN (:...inactive)', {
        inactive: ['Cancelled', 'Rejected', 'NoShow'],
      })
      .andWhere(
        "NOT (a.PaymentTiming = 'Prepaid' AND a.PaymentStatus = 'Prepaid_Pending' AND a.PaymentExpiresAt IS NOT NULL AND a.PaymentExpiresAt < SYSDATETIME())"
      )
      .andWhere('a.AppointmentAt < :endAt', { endAt })
      .andWhere('COALESCE(a.AppointmentEndAt, DATEADD(MINUTE, 60, a.AppointmentAt)) > :startAt', {
        startAt,
      });

    if (excludeAppointmentId) {
      qb.andWhere('a.AppointmentID != :excludeId', { excludeId: Number(excludeAppointmentId) });
    }
    const count = await qb.getCount();
    return count > 0;
  }

  async hasOverlappingPetHandover(petId, startAt, endAt, manager = null) {
    const runner = manager || this.dataSource;
    if (!runner || typeof runner.query !== 'function') return false;
    const rows = await runner.query(
      `SELECT TOP (1) AdoptionHandoverAppointmentID
       FROM dbo.AdoptionHandoverAppointments WITH (UPDLOCK, HOLDLOCK)
       WHERE PetID = @0
         AND ScheduleStatus IN (N'Scheduled', N'Confirmed')
         AND StartAt < @1
         AND EndAt > @2`,
      [Number(petId), endAt, startAt]
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async findExpertUnassignedServiceIds(expertId, serviceIds, manager = null) {
    const repo = this.getRepo(ExpertServiceEntity, manager);
    const totalConfigured = await repo.count({
      where: { EmployeeID: Number(expertId), IsActive: true },
    });
    if (totalConfigured === 0) return [];
    const linked = await this.findExpertServiceLinks(expertId, serviceIds, manager);
    const linkedSet = new Set(linked.map((l) => Number(l.ServiceID)));
    return serviceIds.map(Number).filter((id) => !linkedSet.has(id));
  }

  async checkExpertScheduleAndLeave(expertId, startAt, endAt, manager = null) {
    const runner = manager || this.dataSource;
    if (!runner || typeof runner.query !== 'function') {
      return { available: true };
    }

    const workDate = dayjs(startAt).format('YYYY-MM-DD');
    const startTime = dayjs(startAt).format('HH:mm:ss');
    const endTime = dayjs(endAt).format('HH:mm:ss');

    const approvedLeaveRows = await runner.query(
      `SELECT TOP (1) lr.LeaveRequestID
       FROM dbo.LeaveRequestDays lrd
       INNER JOIN dbo.LeaveRequests lr ON lr.LeaveRequestID = lrd.LeaveRequestID
       WHERE lr.EmployeeID = @0
         AND lr.ApprovalStatus = N'Approved'
         AND lrd.LeaveDate = @1`,
      [Number(expertId), workDate]
    );
    if (approvedLeaveRows.length > 0) {
      return { available: false, reason: 'Chuyên viên đang nghỉ phép vào ngày đã chọn' };
    }

    const shiftRows = await runner.query(
      `SELECT sch.EmployeeWorkScheduleID, sch.ScheduleStatus, ws.StartTime, ws.EndTime
       FROM dbo.EmployeeWorkSchedules sch
       INNER JOIN dbo.WorkShifts ws ON ws.WorkShiftID = sch.WorkShiftID
       WHERE sch.EmployeeID = @0
         AND sch.WorkDate = @1`,
      [Number(expertId), workDate]
    );

    if (shiftRows.length > 0) {
      const hasMatchingActiveShift = shiftRows.some((s) => {
        if (!['Scheduled', 'Confirmed'].includes(s.ScheduleStatus)) return false;
        const shiftStart = String(s.StartTime).slice(0, 8);
        const shiftEnd = String(s.EndTime).slice(0, 8);
        return shiftStart <= startTime && shiftEnd >= endTime;
      });
      if (!hasMatchingActiveShift) {
        return {
          available: false,
          reason: 'Khung giờ đặt lịch nằm ngoài ca làm việc của chuyên viên',
        };
      }
    }

    return { available: true };
  }

  async getBusySlotsForDate({ dateStr, petId = null, expertId = null }) {
    const startOfDay = `${dateStr}T00:00:00`;
    const endOfDay = `${dateStr}T23:59:59`;

    const queryBusy = async (sql, params) => {
      if (!this.dataSource || typeof this.dataSource.query !== 'function') return [];
      const rows = await this.dataSource.query(sql, params);
      return rows.map((r) => ({
        start_at: r.StartAt,
        end_at: r.EndAt,
        source: r.Source,
      }));
    };

    const [petSlots, expertSlots, handoverSlots] = await Promise.all([
      petId
        ? queryBusy(
            `SELECT a.AppointmentAt AS StartAt,
                    COALESCE(a.AppointmentEndAt, DATEADD(MINUTE, 60, a.AppointmentAt)) AS EndAt,
                    N'pet_appointment' AS Source
             FROM dbo.Appointments a
             WHERE a.PetID = @0
               AND a.AppointmentStatus NOT IN (N'Cancelled', N'Rejected', N'NoShow')
               AND NOT (a.PaymentTiming = N'Prepaid' AND a.PaymentStatus = N'Prepaid_Pending' AND a.PaymentExpiresAt IS NOT NULL AND a.PaymentExpiresAt < SYSDATETIME())
               AND a.AppointmentAt <= @2
               AND COALESCE(a.AppointmentEndAt, DATEADD(MINUTE, 60, a.AppointmentAt)) >= @1`,
            [Number(petId), startOfDay, endOfDay]
          )
        : Promise.resolve([]),
      expertId
        ? queryBusy(
            `SELECT a.AppointmentAt AS StartAt,
                    COALESCE(a.AppointmentEndAt, DATEADD(MINUTE, 60, a.AppointmentAt)) AS EndAt,
                    N'expert_appointment' AS Source
             FROM dbo.Appointments a
             INNER JOIN dbo.AppointmentAssignments aa ON aa.AppointmentID = a.AppointmentID
             WHERE aa.EmployeeID = @0
               AND a.AppointmentStatus NOT IN (N'Cancelled', N'Rejected', N'NoShow')
               AND NOT (a.PaymentTiming = N'Prepaid' AND a.PaymentStatus = N'Prepaid_Pending' AND a.PaymentExpiresAt IS NOT NULL AND a.PaymentExpiresAt < SYSDATETIME())
               AND a.AppointmentAt <= @2
               AND COALESCE(a.AppointmentEndAt, DATEADD(MINUTE, 60, a.AppointmentAt)) >= @1`,
            [Number(expertId), startOfDay, endOfDay]
          )
        : Promise.resolve([]),
      petId
        ? queryBusy(
            `SELECT h.StartAt AS StartAt, h.EndAt AS EndAt, N'adoption_handover' AS Source
             FROM dbo.AdoptionHandoverAppointments h
             WHERE h.PetID = @0
               AND h.ScheduleStatus IN (N'Scheduled', N'Confirmed')
               AND h.StartAt <= @2
               AND h.EndAt >= @1`,
            [Number(petId), startOfDay, endOfDay]
          )
        : Promise.resolve([]),
    ]);

    return {
      date: dateStr,
      pet_busy_slots: petSlots,
      expert_busy_slots: expertSlots,
      handover_busy_slots: handoverSlots,
      busy_slots: [...petSlots, ...expertSlots, ...handoverSlots],
    };
  }

  async createAppointmentAggregate(
    { appointmentData, servicesData, assignmentData, historyData },
    manager = null
  ) {
    const run = async (trxManager) => {
      const bookingRepo = this.getRepo(BookingEntity, trxManager);
      const savedBooking = await bookingRepo.save(
        bookingRepo.create({
          ...appointmentData,
          AppointmentCode: appointmentData.AppointmentCode || generateAppointmentCode(),
        })
      );
      const appointmentId = Number(savedBooking.AppointmentID);

      if (servicesData && servicesData.length > 0) {
        const svcRepo = this.getRepo(AppointmentServiceEntity, trxManager);
        await svcRepo.save(
          servicesData.map((s) =>
            svcRepo.create({
              AppointmentID: appointmentId,
              ServiceID: Number(s.ServiceID),
              Quantity: Number(s.Quantity || 1),
              UnitPrice: Number(s.UnitPrice),
              Notes: s.Notes || null,
            })
          )
        );
      }

      if (assignmentData) {
        const assignRepo = this.getRepo(AppointmentAssignmentEntity, trxManager);
        await assignRepo.save(
          assignRepo.create({
            AppointmentID: appointmentId,
            EmployeeID: Number(assignmentData.EmployeeID),
            AssignedByUserID: Number(assignmentData.AssignedByUserID),
            AssignmentRole: assignmentData.AssignmentRole,
            AssignmentNote: assignmentData.AssignmentNote || null,
          })
        );
      }

      if (historyData) {
        const histRepo = this.getRepo(AppointmentStatusHistoryEntity, trxManager);
        await histRepo.save(
          histRepo.create({
            AppointmentID: appointmentId,
            OldStatus: historyData.OldStatus || null,
            NewStatus: historyData.NewStatus,
            ChangedByUserID: historyData.ChangedByUserID ? Number(historyData.ChangedByUserID) : null,
            ChangeReason: historyData.ChangeReason || null,
          })
        );
      }

      return await this.findAppointmentById(appointmentId, trxManager);
    };

    return manager ? await run(manager) : await this.dataSource.transaction(run);
  }

  async hydrateAppointments(appointments, manager = null) {
    if (!appointments || appointments.length === 0) return [];
    const ids = appointments.map((a) => Number(a.AppointmentID));
    const qBuilder = manager ? manager.createQueryBuilder() : this.dataSource.createQueryBuilder();

    const [serviceRows, assignmentRows] = await Promise.all([
      qBuilder
        .select([
          'aps.AppointmentServiceID AS AppointmentServiceID',
          'aps.AppointmentID AS AppointmentID',
          'aps.ServiceID AS ServiceID',
          'aps.Quantity AS Quantity',
          'aps.UnitPrice AS UnitPrice',
          'aps.Notes AS Notes',
          's.ServiceName AS ServiceName',
        ])
        .from(AppointmentServiceEntity, 'aps')
        .leftJoin(ServiceEntity, 's', 's.ServiceID = aps.ServiceID')
        .where('aps.AppointmentID IN (:...ids)', { ids })
        .getRawMany(),
      (manager ? manager.createQueryBuilder() : this.dataSource.createQueryBuilder())
        .select([
          'aa.AssignmentID AS AssignmentID',
          'aa.AppointmentID AS AppointmentID',
          'aa.EmployeeID AS EmployeeID',
          'aa.AssignmentRole AS AssignmentRole',
          'aa.AssignedAt AS AssignedAt',
          'ep.FullName AS FullName',
          'ep.UserID AS EmployeeUserID',
        ])
        .from(AppointmentAssignmentEntity, 'aa')
        .leftJoin(ExpertEntity, 'ep', 'ep.EmployeeID = aa.EmployeeID')
        .where('aa.AppointmentID IN (:...ids)', { ids })
        .getRawMany(),
    ]);

    const servicesByApp = new Map();
    for (const s of serviceRows) {
      const k = Number(s.AppointmentID);
      if (!servicesByApp.has(k)) servicesByApp.set(k, []);
      servicesByApp.get(k).push(s);
    }

    const assignByApp = new Map();
    for (const a of assignmentRows) {
      const k = Number(a.AppointmentID);
      if (!assignByApp.has(k)) assignByApp.set(k, []);
      assignByApp.get(k).push(a);
    }

    return appointments.map((app) => ({
      ...app,
      services: servicesByApp.get(Number(app.AppointmentID)) || [],
      assignments: assignByApp.get(Number(app.AppointmentID)) || [],
    }));
  }

  async findAppointments({ customerId = null, page = 1, limit = 10, status, pet_id, from_date, to_date }) {
    const qb = this.getRepo(BookingEntity)
      .createQueryBuilder('a')
      .leftJoinAndMapOne('a.customer', CustomerProfileEntity, 'cp', 'cp.CustomerID = a.CustomerID')
      .leftJoinAndMapOne('a.pet', PetEntity, 'p', 'p.PetID = a.PetID');

    if (customerId) {
      qb.andWhere('a.CustomerID = :customerId', { customerId: Number(customerId) });
    }
    if (status) {
      qb.andWhere('a.AppointmentStatus = :status', { status });
    }
    if (pet_id) {
      qb.andWhere('a.PetID = :petId', { petId: Number(pet_id) });
    }
    if (from_date) {
      qb.andWhere('a.AppointmentAt >= :fromDt', { fromDt: `${from_date}T00:00:00` });
    }
    if (to_date) {
      qb.andWhere('a.AppointmentAt <= :toDt', { toDt: `${to_date}T23:59:59` });
    }

    qb.orderBy('a.AppointmentAt', 'DESC')
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));

    const [items, totalItems] = await qb.getManyAndCount();
    const hydrated = await this.hydrateAppointments(items);
    return { items: hydrated, totalItems };
  }

  async findAppointmentById(appointmentId, manager = null) {
    const app = await this.getRepo(BookingEntity, manager)
      .createQueryBuilder('a')
      .leftJoinAndMapOne('a.customer', CustomerProfileEntity, 'cp', 'cp.CustomerID = a.CustomerID')
      .leftJoinAndMapOne('a.pet', PetEntity, 'p', 'p.PetID = a.PetID')
      .where('a.AppointmentID = :id', { id: Number(appointmentId) })
      .getOne();

    if (!app) return null;
    const [hydrated] = await this.hydrateAppointments([app], manager);
    return hydrated;
  }

  async updateAppointment(appointmentId, patch, manager = null) {
    await this.getRepo(BookingEntity, manager).update(
      { AppointmentID: Number(appointmentId) },
      { ...patch, UpdatedAt: new Date() }
    );
    return await this.findAppointmentById(appointmentId, manager);
  }

  async addStatusHistory(data, manager = null) {
    const repo = this.getRepo(AppointmentStatusHistoryEntity, manager);
    return await repo.save(repo.create(data));
  }

  async addChangeRequest(data, manager = null) {
    const repo = this.getRepo(AppointmentChangeRequestEntity, manager);
    return await repo.save(repo.create(data));
  }

  async findLastPaidPaymentByAppointment(appointmentId, manager = null) {
    return await this.getRepo(PaymentEntity, manager).findOne({
      where: { AppointmentID: Number(appointmentId), PaymentStatus: 'Paid' },
      order: { PaymentID: 'DESC' },
    });
  }

  async createCancelRefund(refundData, manager = null) {
    const repo = this.getRepo(RefundEntity, manager);
    return await repo.save(repo.create(refundData));
  }
}

const defaultBookingRepository = new BookingRepository();
export { defaultBookingRepository, BookingRepository };
export default defaultBookingRepository;

