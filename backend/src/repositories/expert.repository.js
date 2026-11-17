import { In } from 'typeorm';
import { AppDataSource } from '../config/data-source.js';
import {
  ExpertEntity,
  ExpertCertificateEntity,
  CertificateApprovalEntity,
  WorkShiftEntity,
  ExpertScheduleEntity,
  ExpertReviewEntity,
} from '../entities/expert.entity.js';
import {
  ServiceCategoryEntity,
  ServiceEntity,
  ExpertServiceEntity,
} from '../entities/service.entity.js';
import { UserEntity, CustomerProfileEntity } from '../entities/user.entity.js';
import {
  BookingEntity,
  AppointmentServiceEntity,
  AppointmentAssignmentEntity,
  AppointmentStatusHistoryEntity,
  PaymentEntity,
  RefundEntity,
} from '../entities/booking.entity.js';
import { PetEntity, MedicalRecordEntity } from '../entities/pet.entity.js';
import { inferServiceKind } from './service.repository.js';

const toEmployeeType = (type) => {
  if (!type) return null;
  const lower = String(type).trim().toLowerCase();
  if (lower === 'vet' || lower === 'doctor') return 'Doctor';
  if (lower === 'groomer' || lower === 'trainer' || lower === 'carestaff' || lower === 'care_staff') {
    return 'CareStaff';
  }
  return type;
};

/**
 * ExpertRepository tuân thủ AnimoraDB_Complete_ver1_5_Clean.sql
 */
class ExpertRepository {
  constructor(dataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  getRepo(entity, manager = null) {
    return manager ? manager.getRepository(entity) : this.dataSource.getRepository(entity);
  }

  async findById(id, manager = null) {
    const expert = await this.getRepo(ExpertEntity, manager).findOne({
      where: { EmployeeID: Number(id) },
    });
    if (!expert) return null;
    expert.id = Number(expert.EmployeeID);
    expert.user_id = Number(expert.UserID);
    expert.type = expert.EmployeeType === 'Doctor' ? 'vet' : 'groomer';
    expert.license_no = expert.Specialization || null;
    return expert;
  }

  async findByUserId(userId, manager = null) {
    const expert = await this.getRepo(ExpertEntity, manager).findOne({
      where: { UserID: Number(userId) },
    });
    if (!expert) return null;
    expert.id = Number(expert.EmployeeID);
    expert.user_id = Number(expert.UserID);
    expert.type = expert.EmployeeType === 'Doctor' ? 'vet' : 'groomer';
    expert.license_no = expert.Specialization || null;
    return expert;
  }

  async findUserById(userId, manager = null) {
    return await this.getRepo(UserEntity, manager).findOne({
      where: { UserID: Number(userId) },
    });
  }

  async createExpert(data, manager = null) {
    const repo = this.getRepo(ExpertEntity, manager);
    const employeeType = toEmployeeType(data.EmployeeType ?? data.type) || 'CareStaff';
    const employmentType =
      employeeType === 'Doctor' ? 'FullTime' : data.EmploymentType || 'FullTime';

    const saved = await repo.save(
      repo.create({
        UserID: Number(data.UserID ?? data.user_id),
        FullName: data.FullName ?? data.full_name ?? 'Chuyên viên Animora',
        EmployeeType: employeeType,
        EmploymentType: employmentType,
        Specialization: data.Specialization ?? data.license_no ?? null,
        Biography: data.Biography ?? data.bio ?? null,
        AvatarUrl: data.AvatarUrl ?? data.avatar ?? null,
        YearsOfExperience: data.YearsOfExperience ?? null,
        IsActive: data.IsActive !== undefined ? Boolean(data.IsActive) : false,
      })
    );
    saved.id = Number(saved.EmployeeID);
    saved.user_id = Number(saved.UserID);
    saved.type = saved.EmployeeType === 'Doctor' ? 'vet' : 'groomer';
    saved.license_no = saved.Specialization || null;
    return saved;
  }

  async updateExpert(id, updateData, manager = null) {
    const repo = this.getRepo(ExpertEntity, manager);
    const patch = {};
    if (updateData.EmployeeType !== undefined || updateData.type !== undefined) {
      patch.EmployeeType = toEmployeeType(updateData.EmployeeType ?? updateData.type);
      if (patch.EmployeeType === 'Doctor') {
        patch.EmploymentType = 'FullTime';
      }
    }
    if (updateData.IsActive !== undefined) patch.IsActive = Boolean(updateData.IsActive);
    if (updateData.status !== undefined) {
      patch.IsActive = updateData.status === 'approved' || updateData.status === 'active';
    }
    if (updateData.Specialization !== undefined || updateData.license_no !== undefined) {
      patch.Specialization = updateData.Specialization ?? updateData.license_no;
    }
    if (updateData.Biography !== undefined || updateData.bio !== undefined) {
      patch.Biography = updateData.Biography ?? updateData.bio;
    }

    if (Object.keys(patch).length > 0) {
      await repo.update({ EmployeeID: Number(id) }, patch);
    }
    return await this.findById(id, manager);
  }

  async createCertificates(certList, manager = null) {
    if (!certList || certList.length === 0) return [];
    const repo = this.getRepo(ExpertCertificateEntity, manager);
    const entities = certList.map((c) =>
      repo.create({
        EmployeeID: Number(c.EmployeeID ?? c.expert_id),
        CertificateName: c.CertificateName ?? c.name,
        CertificateNumber: c.CertificateNumber ?? c.certificate_number ?? null,
        IssuingOrganization: c.IssuingOrganization ?? c.issuer ?? null,
        IssuedDate: c.IssuedDate ?? (c.year ? `${c.year}-01-01` : null),
        ExpiryDate: c.ExpiryDate ?? null,
        CertificateUrl: c.CertificateUrl ?? c.file_url ?? null,
        ApprovalStatus: c.ApprovalStatus ?? 'Pending',
      })
    );
    return await repo.save(entities);
  }

  async findCertificatesByExpertIds(expertIds, onlyVerified = false) {
    if (!expertIds || expertIds.length === 0) return new Map();
    const where = { EmployeeID: In(expertIds.map(Number)) };
    if (onlyVerified) {
      where.ApprovalStatus = 'Approved';
    }

    const certs = await this.getRepo(ExpertCertificateEntity).find({
      where,
      order: { CertificateID: 'DESC' },
    });

    const grouped = new Map();
    for (const c of certs) {
      const key = Number(c.EmployeeID);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(c);
    }
    return grouped;
  }

  async verifyAllCertificatesByExpertId(expertId, approvalStatus = 'Approved', adminUserId = null, notes = null, manager = null) {
    const certRepo = this.getRepo(ExpertCertificateEntity, manager);
    const certs = await certRepo.find({ where: { EmployeeID: Number(expertId) } });
    if (certs.length === 0) return;

    await certRepo.update(
      { EmployeeID: Number(expertId) },
      { ApprovalStatus: approvalStatus }
    );

    if (adminUserId && (approvalStatus === 'Approved' || approvalStatus === 'Rejected')) {
      const approvalRepo = this.getRepo(CertificateApprovalEntity, manager);
      await approvalRepo.save(
        certs.map((c) =>
          approvalRepo.create({
            CertificateID: Number(c.CertificateID),
            ReviewedByUserID: Number(adminUserId),
            ApprovalStatus: approvalStatus,
            ReviewNotes: notes || null,
          })
        )
      );
    }
  }

  async findPendingExperts({ page = 1, limit = 10, after_id, status = 'pending', type }) {
    const isActiveFilter = status === 'approved' ? 1 : 0;
    const qb = this.getRepo(ExpertEntity)
      .createQueryBuilder('exp')
      .leftJoinAndMapOne('exp.user', UserEntity, 'u', 'u.UserID = exp.UserID')
      .where('exp.IsActive = :isActive', { isActive: isActiveFilter });

    if (type) {
      qb.andWhere('exp.EmployeeType = :empType', { empType: toEmployeeType(type) });
    }

    if (after_id !== undefined && after_id !== null) {
      qb.andWhere('exp.EmployeeID > :afterId', { afterId: Number(after_id) }).orderBy(
        'exp.EmployeeID',
        'ASC'
      );
    } else {
      qb.orderBy('exp.CreatedAt', 'DESC').skip((Number(page) - 1) * Number(limit));
    }

    qb.take(Number(limit));
    const [items, totalItems] = await qb.getManyAndCount();

    const expertIds = items.map((i) => Number(i.EmployeeID));
    const certsByExpert = await this.findCertificatesByExpertIds(expertIds, false);

    for (const item of items) {
      item.status = item.IsActive ? 'approved' : 'pending';
      item.certificates = certsByExpert.get(Number(item.EmployeeID)) || [];
    }

    return { items, totalItems };
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
      id: Number(r.ServiceID),
      name: r.ServiceName,
      category: r.CategoryName,
      service_kind: inferServiceKind(r.CategoryName),
      price: Number(r.BasePrice),
      duration_min: Number(r.EstimatedDurationMinutes ?? 60),
    }));
  }

  async replaceExpertServices(expertId, serviceIds, assignedByUserId, manager = null) {
    const repo = this.getRepo(ExpertServiceEntity, manager);
    await repo.delete({ EmployeeID: Number(expertId) });
    const rows = serviceIds.map((serviceId) =>
      repo.create({
        EmployeeID: Number(expertId),
        ServiceID: Number(serviceId),
        AssignedByUserID: Number(assignedByUserId),
        IsActive: true,
      })
    );
    return await repo.save(rows);
  }

  async findExpertServices(expertId) {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select([
        's.ServiceID AS ServiceID',
        's.ServiceName AS ServiceName',
        's.BasePrice AS BasePrice',
        's.EstimatedDurationMinutes AS EstimatedDurationMinutes',
        's.IsActive AS IsActive',
        'sc.CategoryName AS CategoryName',
      ])
      .from(ExpertServiceEntity, 'es')
      .innerJoin(ServiceEntity, 's', 's.ServiceID = es.ServiceID AND s.IsActive = 1')
      .leftJoin(ServiceCategoryEntity, 'sc', 'sc.ServiceCategoryID = s.ServiceCategoryID')
      .where('es.EmployeeID = :expertId AND es.IsActive = 1', { expertId: Number(expertId) })
      .orderBy('s.ServiceName', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      ...r,
      id: Number(r.ServiceID),
      name: r.ServiceName,
      category: r.CategoryName,
      service_kind: inferServiceKind(r.CategoryName),
      price: Number(r.BasePrice),
      duration_min: Number(r.EstimatedDurationMinutes ?? 60),
    }));
  }

  async findServicesByExpertIds(expertIds) {
    if (!expertIds || expertIds.length === 0) return new Map();

    const rows = await this.dataSource
      .createQueryBuilder()
      .select([
        'es.EmployeeID AS EmployeeID',
        's.ServiceID AS ServiceID',
        's.ServiceName AS ServiceName',
        'sc.CategoryName AS CategoryName',
        's.BasePrice AS BasePrice',
        's.EstimatedDurationMinutes AS EstimatedDurationMinutes',
      ])
      .from(ExpertServiceEntity, 'es')
      .innerJoin(ServiceEntity, 's', 's.ServiceID = es.ServiceID AND s.IsActive = 1')
      .leftJoin(ServiceCategoryEntity, 'sc', 'sc.ServiceCategoryID = s.ServiceCategoryID')
      .where('es.EmployeeID IN (:...expertIds) AND es.IsActive = 1', {
        expertIds: expertIds.map(Number),
      })
      .orderBy('s.ServiceName', 'ASC')
      .getRawMany();

    const grouped = new Map();
    for (const r of rows) {
      const expId = Number(r.EmployeeID);
      if (!grouped.has(expId)) grouped.set(expId, []);
      grouped.get(expId).push({
        ...r,
        id: Number(r.ServiceID),
        name: r.ServiceName,
        category: r.CategoryName,
        service_kind: inferServiceKind(r.CategoryName),
        price: Number(r.BasePrice),
        duration_min: Number(r.EstimatedDurationMinutes ?? 60),
      });
    }
    return grouped;
  }

  async findOrCreateWorkShift({ workShiftId, shiftStart = '08:00:00', shiftEnd = '17:00:00', breakMinutes = 0 }, manager = null) {
    const repo = this.getRepo(WorkShiftEntity, manager);
    if (workShiftId) {
      const existing = await repo.findOne({ where: { WorkShiftID: Number(workShiftId) } });
      if (existing) return existing;
    }

    const normStart = shiftStart.length === 5 ? `${shiftStart}:00` : shiftStart;
    const normEnd = shiftEnd.length === 5 ? `${shiftEnd}:00` : shiftEnd;

    const rows = await repo
      .createQueryBuilder('ws')
      .where('ws.StartTime = :startTime AND ws.EndTime = :endTime AND ws.IsActive = 1', {
        startTime: normStart,
        endTime: normEnd,
      })
      .getMany();
    if (rows.length > 0) return rows[0];

    return await repo.save(
      repo.create({
        ShiftName: `Ca ${normStart.slice(0, 5)} - ${normEnd.slice(0, 5)}`,
        StartTime: normStart,
        EndTime: normEnd,
        BreakMinutes: Number(breakMinutes || 0),
        IsOvernight: normEnd < normStart,
        IsActive: true,
      })
    );
  }

  async upsertEmployeeWorkSchedule({ employeeId, workShiftId, workDate, scheduleStatus, createdByUserId }, manager = null) {
    const repo = this.getRepo(ExpertScheduleEntity, manager);
    let existing = await repo.findOne({
      where: {
        EmployeeID: Number(employeeId),
        WorkShiftID: Number(workShiftId),
        WorkDate: workDate,
      },
    });

    if (existing) {
      await repo.update(
        { EmployeeWorkScheduleID: Number(existing.EmployeeWorkScheduleID) },
        { ScheduleStatus: scheduleStatus }
      );
      existing.ScheduleStatus = scheduleStatus;
      return existing;
    }

    return await repo.save(
      repo.create({
        EmployeeID: Number(employeeId),
        WorkShiftID: Number(workShiftId),
        WorkDate: workDate,
        ScheduleStatus: scheduleStatus,
        CreatedByUserID: Number(createdByUserId),
      })
    );
  }

  async findSchedulesByExpert(expertId, { from_date, to_date } = {}) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'sch.EmployeeWorkScheduleID AS EmployeeWorkScheduleID',
        'sch.EmployeeID AS EmployeeID',
        'sch.WorkShiftID AS WorkShiftID',
        'sch.WorkDate AS WorkDate',
        'sch.ScheduleStatus AS ScheduleStatus',
        'ws.ShiftName AS ShiftName',
        'ws.StartTime AS StartTime',
        'ws.EndTime AS EndTime',
      ])
      .from(ExpertScheduleEntity, 'sch')
      .innerJoin(WorkShiftEntity, 'ws', 'ws.WorkShiftID = sch.WorkShiftID')
      .where('sch.EmployeeID = :expertId', { expertId: Number(expertId) });

    if (from_date) qb.andWhere('sch.WorkDate >= :from_date', { from_date });
    if (to_date) qb.andWhere('sch.WorkDate <= :to_date', { to_date });

    return await qb.orderBy('sch.WorkDate', 'ASC').addOrderBy('ws.StartTime', 'ASC').getRawMany();
  }

  async findScheduleById(scheduleId, manager = null) {
    const qb = (manager ? manager.createQueryBuilder() : this.dataSource.createQueryBuilder())
      .select([
        'sch.EmployeeWorkScheduleID AS EmployeeWorkScheduleID',
        'sch.EmployeeID AS EmployeeID',
        'sch.WorkShiftID AS WorkShiftID',
        'sch.WorkDate AS WorkDate',
        'sch.ScheduleStatus AS ScheduleStatus',
        'ws.ShiftName AS ShiftName',
        'ws.StartTime AS StartTime',
        'ws.EndTime AS EndTime',
      ])
      .from(ExpertScheduleEntity, 'sch')
      .innerJoin(WorkShiftEntity, 'ws', 'ws.WorkShiftID = sch.WorkShiftID')
      .where('sch.EmployeeWorkScheduleID = :scheduleId', { scheduleId: Number(scheduleId) });

    return await qb.getRawOne();
  }

  async updateScheduleStatus(scheduleId, scheduleStatus, manager = null) {
    await this.getRepo(ExpertScheduleEntity, manager).update(
      { EmployeeWorkScheduleID: Number(scheduleId) },
      { ScheduleStatus: scheduleStatus }
    );
    return await this.findScheduleById(scheduleId, manager);
  }

  async searchApprovedExperts({
    page = 1,
    limit = 10,
    after_id,
    type,
    service_id,
    work_date,
    start_time,
    search,
  }) {
    const qb = this.getRepo(ExpertEntity)
      .createQueryBuilder('exp')
      .innerJoinAndMapOne(
        'exp.user',
        UserEntity,
        'u',
        'u.UserID = exp.UserID AND u.AccountStatus = :userStatus',
        { userStatus: 'Active' }
      )
      .where('exp.IsActive = 1');

    if (type) {
      qb.andWhere('exp.EmployeeType = :empType', { empType: toEmployeeType(type) });
    }

    if (service_id) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM dbo.EmployeeServices es WHERE es.EmployeeID = exp.EmployeeID AND es.ServiceID = :serviceId AND es.IsActive = 1)',
        { serviceId: Number(service_id) }
      );
    }

    if (work_date) {
      if (start_time) {
        const normStart = start_time.length === 5 ? `${start_time}:00` : start_time;
        qb.andWhere(
          `EXISTS (
            SELECT 1 FROM dbo.EmployeeWorkSchedules sch
            INNER JOIN dbo.WorkShifts ws ON ws.WorkShiftID = sch.WorkShiftID
            WHERE sch.EmployeeID = exp.EmployeeID
              AND sch.WorkDate = :workDate
              AND sch.ScheduleStatus IN ('Scheduled', 'Confirmed')
              AND ws.StartTime <= :startTime AND ws.EndTime > :startTime
          )`,
          { workDate: work_date, startTime: normStart }
        );
      } else {
        qb.andWhere(
          `EXISTS (
            SELECT 1 FROM dbo.EmployeeWorkSchedules sch
            WHERE sch.EmployeeID = exp.EmployeeID
              AND sch.WorkDate = :workDate
              AND sch.ScheduleStatus IN ('Scheduled', 'Confirmed')
          )`,
          { workDate: work_date }
        );
      }
    }

    if (search && search.trim()) {
      qb.andWhere('(exp.FullName LIKE :prefixKw OR exp.Specialization LIKE :prefixKw)', {
        prefixKw: `${search.trim()}%`,
      });
    }

    if (after_id !== undefined && after_id !== null) {
      qb.andWhere('exp.EmployeeID > :afterId', { afterId: Number(after_id) }).orderBy(
        'exp.EmployeeID',
        'ASC'
      );
    } else {
      qb.orderBy('exp.EmployeeID', 'ASC').skip((Number(page) - 1) * Number(limit));
    }

    qb.take(Number(limit));
    const [items, totalItems] = await qb.getManyAndCount();

    const expertIds = items.map((i) => Number(i.EmployeeID));
    const servicesByExpert = await this.findServicesByExpertIds(expertIds);

    for (const item of items) {
      item.status = 'approved';
      item.services = servicesByExpert.get(Number(item.EmployeeID)) || [];
    }

    return { items, totalItems };
  }

  async getPublicProfileById(expertId, fromDateStr) {
    const expert = await this.getRepo(ExpertEntity)
      .createQueryBuilder('exp')
      .innerJoinAndMapOne('exp.user', UserEntity, 'u', 'u.UserID = exp.UserID')
      .where('exp.EmployeeID = :expertId AND exp.IsActive = 1', {
        expertId: Number(expertId),
      })
      .getOne();

    if (!expert) return null;

    const [certsMap, services, schedules, reviews] = await Promise.all([
      this.findCertificatesByExpertIds([expert.EmployeeID], true),
      this.findExpertServices(expert.EmployeeID),
      this.findSchedulesByExpert(expert.EmployeeID, { from_date: fromDateStr }),
      this.getRepo(ExpertReviewEntity)
        .createQueryBuilder('rvw')
        .leftJoinAndMapOne(
          'rvw.customer',
          CustomerProfileEntity,
          'cp',
          'cp.CustomerID = rvw.CustomerID'
        )
        .where('rvw.EmployeeID = :expertId AND rvw.ReviewStatus = :rvwStatus', {
          expertId: Number(expertId),
          rvwStatus: 'Published',
        })
        .orderBy('rvw.CreatedAt', 'DESC')
        .take(20)
        .getMany(),
    ]);

    expert.status = 'approved';
    expert.certificates = certsMap.get(Number(expert.EmployeeID)) || [];
    expert.services = services;
    expert.schedules = schedules;
    expert.reviews = reviews;

    return expert;
  }

  async findBookingsByExpert(
    expertId,
    { page = 1, limit = 10, status, date, from_date, to_date }
  ) {
    const qb = this.getRepo(BookingEntity)
      .createQueryBuilder('a')
      .innerJoin(
        AppointmentAssignmentEntity,
        'aa',
        'aa.AppointmentID = a.AppointmentID AND aa.EmployeeID = :expertId',
        { expertId: Number(expertId) }
      )
      .leftJoinAndMapOne('a.customer', CustomerProfileEntity, 'cp', 'cp.CustomerID = a.CustomerID')
      .leftJoinAndMapOne('a.pet', PetEntity, 'p', 'p.PetID = a.PetID');

    if (status) {
      qb.andWhere('a.AppointmentStatus = :status', { status });
    }

    if (date) {
      qb.andWhere('a.AppointmentAt >= :startOfDay AND a.AppointmentAt <= :endOfDay', {
        startOfDay: `${date}T00:00:00`,
        endOfDay: `${date}T23:59:59`,
      });
    } else {
      if (from_date) {
        qb.andWhere('a.AppointmentAt >= :fromDateTime', {
          fromDateTime: `${from_date}T00:00:00`,
        });
      }
      if (to_date) {
        qb.andWhere('a.AppointmentAt <= :toDateTime', {
          toDateTime: `${to_date}T23:59:59`,
        });
      }
    }

    qb.orderBy('a.AppointmentAt', 'ASC')
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));

    const [items, totalItems] = await qb.getManyAndCount();
    return { items, totalItems };
  }

  async findBookingById(bookingId, manager = null) {
    const appointment = await this.getRepo(BookingEntity, manager)
      .createQueryBuilder('a')
      .leftJoinAndMapOne('a.customer', CustomerProfileEntity, 'cp', 'cp.CustomerID = a.CustomerID')
      .leftJoinAndMapOne('a.pet', PetEntity, 'p', 'p.PetID = a.PetID')
      .where('a.AppointmentID = :bookingId', { bookingId: Number(bookingId) })
      .getOne();

    if (!appointment) return null;

    const [assignments, services] = await Promise.all([
      this.getRepo(AppointmentAssignmentEntity, manager).find({
        where: { AppointmentID: Number(bookingId) },
      }),
      this.getRepo(AppointmentServiceEntity, manager).find({
        where: { AppointmentID: Number(bookingId) },
      }),
    ]);

    appointment.assignments = assignments;
    appointment.services = services;
    appointment.expert_id = assignments[0] ? Number(assignments[0].EmployeeID) : null;
    appointment.service_id = services[0] ? Number(services[0].ServiceID) : null;
    appointment.customer_user_id = appointment.customer ? Number(appointment.customer.UserID) : null;
    return appointment;
  }

  async updateBooking(bookingId, updateData, manager = null) {
    const repo = this.getRepo(BookingEntity, manager);
    await repo.update({ AppointmentID: Number(bookingId) }, { ...updateData, UpdatedAt: new Date() });
    return await this.findBookingById(bookingId, manager);
  }

  async addBookingStatusHistory(data, manager = null) {
    const repo = this.getRepo(AppointmentStatusHistoryEntity, manager);
    return await repo.save(repo.create(data));
  }

  async createRefundRecord(refundData, manager = null) {
    const repo = this.getRepo(RefundEntity, manager);
    return await repo.save(repo.create(refundData));
  }

  async findLastPaidPaymentByAppointment(appointmentId, manager = null) {
    return await this.getRepo(PaymentEntity, manager).findOne({
      where: {
        AppointmentID: Number(appointmentId),
        PaymentStatus: 'Paid',
      },
      order: { PaymentID: 'DESC' },
    });
  }

  async findAlternativeExperts({ excludedExpertId, serviceId, employeeType, workDate }) {
    const qb = this.getRepo(ExpertEntity)
      .createQueryBuilder('exp')
      .innerJoinAndMapOne('exp.user', UserEntity, 'u', 'u.UserID = exp.UserID AND u.AccountStatus = :uStatus', {
        uStatus: 'Active',
      })
      .where('exp.IsActive = 1')
      .andWhere('exp.EmployeeID <> :excludedExpertId', { excludedExpertId: Number(excludedExpertId) });

    if (employeeType) qb.andWhere('exp.EmployeeType = :employeeType', { employeeType });

    if (serviceId) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM dbo.EmployeeServices es WHERE es.EmployeeID = exp.EmployeeID AND es.ServiceID = :serviceId AND es.IsActive = 1)',
        { serviceId: Number(serviceId) }
      );
    }

    if (workDate) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM dbo.EmployeeWorkSchedules sch
          WHERE sch.EmployeeID = exp.EmployeeID
            AND sch.WorkDate = :workDate
            AND sch.ScheduleStatus IN ('Scheduled', 'Confirmed')
        )`,
        { workDate }
      );
    }

    qb.orderBy('exp.EmployeeID', 'ASC').take(3);
    const experts = await qb.getMany();
    return experts.map((e) => ({
      id: Number(e.EmployeeID),
      type: e.EmployeeType === 'Doctor' ? 'vet' : 'groomer',
      full_name: e.FullName,
      avatar: e.AvatarUrl || null,
    }));
  }

  async createMedicalRecord(recordData, manager = null) {
    const repo = this.getRepo(MedicalRecordEntity, manager);
    return await repo.save(repo.create(recordData));
  }
}

const expertRepositoryInstance = new ExpertRepository(AppDataSource);

export { expertRepositoryInstance, ExpertRepository };
export default expertRepositoryInstance;
