import { AppDataSource } from '../config/data-source.js';
import {
  ServiceCategoryEntity,
  ServiceEntity,
  ServicePaymentMethodEntity,
} from '../entities/service.entity.js';
import { PaymentMethodEntity } from '../entities/booking.entity.js';

const getRepo = (entity, manager = null) =>
  manager ? manager.getRepository(entity) : AppDataSource.getRepository(entity);

const MEDICAL_CATEGORY_NAMES = ['Khám và điều trị', 'Tiêm phòng và tẩy giun'];

const inferServiceKind = (categoryName) => {
  if (!categoryName) return 'care';
  const lower = String(categoryName).toLowerCase();
  if (
    lower.includes('khám') ||
    lower.includes('điều trị') ||
    lower.includes('tiêm') ||
    lower.includes('tẩy giun') ||
    lower.includes('medical') ||
    lower.includes('y tế')
  ) {
    return 'medical';
  }
  return 'care';
};

const hydrateServiceRow = (row, allowPostpay = false) => {
  if (!row) return null;
  const id = Number(row.ServiceID ?? row.id);
  const categoryName = row.CategoryName ?? row.category ?? null;
  const serviceName = row.ServiceName ?? row.name;
  const price = Number(row.BasePrice ?? row.price ?? 0);
  const durationMin =
    row.EstimatedDurationMinutes !== undefined && row.EstimatedDurationMinutes !== null
      ? Number(row.EstimatedDurationMinutes)
      : row.duration_min ?? 60;
  const isActive = Boolean(row.IsActive ?? row.is_active ?? true);

  return {
    id,
    ServiceID: id,
    ServiceCategoryID: Number(row.ServiceCategoryID),
    name: serviceName,
    ServiceName: serviceName,
    description: row.Description ?? row.description ?? null,
    category: categoryName,
    CategoryName: categoryName,
    service_kind: inferServiceKind(categoryName),
    price,
    BasePrice: price,
    duration_min: durationMin,
    duration_minutes: durationMin,
    EstimatedDurationMinutes: durationMin,
    allow_postpay: Boolean(allowPostpay),
    allow_pay_later: Boolean(allowPostpay),
    is_active: isActive,
    IsActive: isActive,
    status: isActive ? 'active' : 'inactive',
    created_at: row.CreatedAt ?? row.created_at,
    CreatedAt: row.CreatedAt ?? row.created_at,
  };
};

const resolveCategoryId = async ({ serviceCategoryId, category, service_kind }, manager = null) => {
  const catRepo = getRepo(ServiceCategoryEntity, manager);

  if (serviceCategoryId) {
    const found = await catRepo.findOne({
      where: { ServiceCategoryID: Number(serviceCategoryId) },
    });
    if (found) return Number(found.ServiceCategoryID);
  }

  const targetName =
    category && String(category).trim()
      ? String(category).trim()
      : service_kind === 'medical'
        ? 'Khám và điều trị'
        : 'Spa và chải chuốt';

  let foundByName = await catRepo.findOne({ where: { CategoryName: targetName } });
  if (!foundByName) {
    foundByName = await catRepo.save(
      catRepo.create({
        CategoryName: targetName,
        Description: null,
        IsActive: true,
      })
    );
  }
  return Number(foundByName.ServiceCategoryID);
};

const findServicesPaginated = async ({
  page = 1,
  limit = 10,
  search = '',
  category,
  service_kind,
  is_active,
}) => {
  const qb = AppDataSource.createQueryBuilder()
    .select([
      's.ServiceID AS ServiceID',
      's.ServiceCategoryID AS ServiceCategoryID',
      's.ServiceName AS ServiceName',
      's.Description AS Description',
      's.BasePrice AS BasePrice',
      's.EstimatedDurationMinutes AS EstimatedDurationMinutes',
      's.IsActive AS IsActive',
      's.CreatedAt AS CreatedAt',
      'sc.CategoryName AS CategoryName',
    ])
    .from(ServiceEntity, 's')
    .leftJoin(ServiceCategoryEntity, 'sc', 'sc.ServiceCategoryID = s.ServiceCategoryID');

  if (search) {
    qb.andWhere('(s.ServiceName LIKE :search OR s.Description LIKE :search)', {
      search: `%${search}%`,
    });
  }

  if (category) {
    if (!Number.isNaN(Number(category))) {
      qb.andWhere('s.ServiceCategoryID = :categoryId', { categoryId: Number(category) });
    } else {
      qb.andWhere('sc.CategoryName = :categoryName', { categoryName: String(category).trim() });
    }
  }

  if (service_kind === 'medical') {
    qb.andWhere('sc.CategoryName IN (:...medicalCats)', { medicalCats: MEDICAL_CATEGORY_NAMES });
  } else if (service_kind === 'care') {
    qb.andWhere('(sc.CategoryName IS NULL OR sc.CategoryName NOT IN (:...medicalCats))', {
      medicalCats: MEDICAL_CATEGORY_NAMES,
    });
  }

  if (is_active !== undefined && is_active !== null) {
    qb.andWhere('s.IsActive = :isActive', { isActive: is_active ? 1 : 0 });
  }

  const totalItems = await qb.getCount();
  const rows = await qb
    .orderBy('s.CreatedAt', 'DESC')
    .offset((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .getRawMany();

  const serviceIds = rows.map((r) => Number(r.ServiceID));
  const postpaySet = new Set();
  if (serviceIds.length > 0) {
    const pmRows = await AppDataSource.createQueryBuilder()
      .select(['spm.ServiceID AS ServiceID'])
      .from(ServicePaymentMethodEntity, 'spm')
      .innerJoin(PaymentMethodEntity, 'pm', 'pm.PaymentMethodID = spm.PaymentMethodID')
      .where('spm.ServiceID IN (:...serviceIds)', { serviceIds })
      .andWhere('spm.IsActive = 1')
      .andWhere('pm.MethodCode = :cashCode', { cashCode: 'CASH' })
      .getRawMany();
    for (const r of pmRows) {
      postpaySet.add(Number(r.ServiceID));
    }
  }

  const items = rows.map((row) => hydrateServiceRow(row, postpaySet.has(Number(row.ServiceID))));
  return { items, totalItems };
};

const findById = async (id, manager = null) => {
  const qb = (manager ? manager.createQueryBuilder() : AppDataSource.createQueryBuilder())
    .select([
      's.ServiceID AS ServiceID',
      's.ServiceCategoryID AS ServiceCategoryID',
      's.ServiceName AS ServiceName',
      's.Description AS Description',
      's.BasePrice AS BasePrice',
      's.EstimatedDurationMinutes AS EstimatedDurationMinutes',
      's.IsActive AS IsActive',
      's.CreatedAt AS CreatedAt',
      'sc.CategoryName AS CategoryName',
    ])
    .from(ServiceEntity, 's')
    .leftJoin(ServiceCategoryEntity, 'sc', 'sc.ServiceCategoryID = s.ServiceCategoryID')
    .where('s.ServiceID = :id', { id: Number(id) });

  const row = await qb.getRawOne();
  if (!row) return null;

  const cashRow = await (manager ? manager.createQueryBuilder() : AppDataSource.createQueryBuilder())
    .select(['spm.ServicePaymentMethodID AS id'])
    .from(ServicePaymentMethodEntity, 'spm')
    .innerJoin(PaymentMethodEntity, 'pm', 'pm.PaymentMethodID = spm.PaymentMethodID')
    .where('spm.ServiceID = :serviceId', { serviceId: Number(id) })
    .andWhere('spm.IsActive = 1')
    .andWhere('pm.MethodCode = :cashCode', { cashCode: 'CASH' })
    .getRawOne();

  return hydrateServiceRow(row, Boolean(cashRow));
};

const findByName = async (name, manager = null) => {
  const row = await getRepo(ServiceEntity, manager).findOne({
    where: { ServiceName: name.trim() },
  });
  if (!row) return null;
  return await findById(row.ServiceID, manager);
};

const syncPostpayMethod = async (serviceId, allowPostpay, manager) => {
  if (allowPostpay === undefined) return;
  const cashMethod = await getRepo(PaymentMethodEntity, manager).findOne({
    where: { MethodCode: 'CASH' },
  });
  if (!cashMethod) return;

  const spmRepo = getRepo(ServicePaymentMethodEntity, manager);
  const existing = await spmRepo.findOne({
    where: { ServiceID: Number(serviceId), PaymentMethodID: Number(cashMethod.PaymentMethodID) },
  });

  if (existing) {
    await spmRepo.update(
      { ServicePaymentMethodID: Number(existing.ServicePaymentMethodID) },
      { IsActive: Boolean(allowPostpay) }
    );
  } else if (allowPostpay) {
    await spmRepo.save(
      spmRepo.create({
        ServiceID: Number(serviceId),
        PaymentMethodID: Number(cashMethod.PaymentMethodID),
        IsActive: true,
      })
    );
  }
};

const createService = async (serviceData, manager = null) => {
  const run = async (trxManager) => {
    const categoryId = await resolveCategoryId(
      {
        serviceCategoryId: serviceData.serviceCategoryId ?? serviceData.ServiceCategoryID,
        category: serviceData.category,
        service_kind: serviceData.service_kind,
      },
      trxManager
    );

    const repo = getRepo(ServiceEntity, trxManager);
    const saved = await repo.save(
      repo.create({
        ServiceCategoryID: categoryId,
        ServiceName: (serviceData.name ?? serviceData.ServiceName).trim(),
        Description: serviceData.description ?? serviceData.Description ?? null,
        BasePrice: Number(serviceData.price ?? serviceData.BasePrice),
        EstimatedDurationMinutes:
          serviceData.duration_min ??
          serviceData.duration_minutes ??
          serviceData.EstimatedDurationMinutes ??
          60,
        IsActive: serviceData.is_active !== undefined ? Boolean(serviceData.is_active) : true,
      })
    );

    await syncPostpayMethod(saved.ServiceID, serviceData.allow_postpay, trxManager);
    return await findById(saved.ServiceID, trxManager);
  };

  return manager ? await run(manager) : await AppDataSource.transaction(run);
};

const updateService = async (id, serviceData, manager = null) => {
  const serviceId = Number(id);
  const run = async (trxManager) => {
    const patch = {};
    if (serviceData.name !== undefined || serviceData.ServiceName !== undefined) {
      patch.ServiceName = (serviceData.name ?? serviceData.ServiceName).trim();
    }
    if (serviceData.description !== undefined || serviceData.Description !== undefined) {
      patch.Description = serviceData.description ?? serviceData.Description;
    }
    if (serviceData.price !== undefined || serviceData.BasePrice !== undefined) {
      patch.BasePrice = Number(serviceData.price ?? serviceData.BasePrice);
    }
    if (
      serviceData.duration_min !== undefined ||
      serviceData.duration_minutes !== undefined ||
      serviceData.EstimatedDurationMinutes !== undefined
    ) {
      patch.EstimatedDurationMinutes = Number(
        serviceData.duration_min ??
          serviceData.duration_minutes ??
          serviceData.EstimatedDurationMinutes
      );
    }
    if (serviceData.is_active !== undefined || serviceData.IsActive !== undefined) {
      patch.IsActive = Boolean(serviceData.is_active ?? serviceData.IsActive);
    }
    if (
      serviceData.serviceCategoryId !== undefined ||
      serviceData.ServiceCategoryID !== undefined ||
      serviceData.category !== undefined ||
      serviceData.service_kind !== undefined
    ) {
      patch.ServiceCategoryID = await resolveCategoryId(
        {
          serviceCategoryId: serviceData.serviceCategoryId ?? serviceData.ServiceCategoryID,
          category: serviceData.category,
          service_kind: serviceData.service_kind,
        },
        trxManager
      );
    }

    if (Object.keys(patch).length > 0) {
      await getRepo(ServiceEntity, trxManager).update({ ServiceID: serviceId }, patch);
    }

    if (serviceData.allow_postpay !== undefined) {
      await syncPostpayMethod(serviceId, serviceData.allow_postpay, trxManager);
    }

    return await findById(serviceId, trxManager);
  };

  return manager ? await run(manager) : await AppDataSource.transaction(run);
};

const deleteService = async (id, manager = null) => {
  return await getRepo(ServiceEntity, manager).update(
    { ServiceID: Number(id) },
    { IsActive: false }
  );
};

export {
  inferServiceKind,
  findServicesPaginated,
  findById,
  findByName,
  createService,
  updateService,
  deleteService,
};
export default {
  inferServiceKind,
  findServicesPaginated,
  findById,
  findByName,
  createService,
  updateService,
  deleteService,
};
