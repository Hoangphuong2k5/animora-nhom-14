const { AppDataSource } = require('../config/data-source');
const { ServiceEntity } = require('../entities/service.entity');

const getRepo = (manager) =>
  manager ? manager.getRepository(ServiceEntity) : AppDataSource.getRepository(ServiceEntity);

const findServicesPaginated = async ({
  page = 1,
  limit = 10,
  search = '',
  category,
  service_kind,
  is_active,
}) => {
  const repo = getRepo();
  const qb = repo.createQueryBuilder('s');

  if (search) {
    qb.andWhere('(s.name LIKE :search OR s.description LIKE :search)', {
      search: `%${search}%`,
    });
  }

  if (category) {
    qb.andWhere('s.category = :category', { category });
  }

  if (service_kind) {
    qb.andWhere('s.service_kind = :service_kind', { service_kind });
  }

  if (is_active !== undefined && is_active !== null) {
    qb.andWhere('s.is_active = :is_active', { is_active: is_active ? 1 : 0 });
  }

  qb.orderBy('s.created_at', 'DESC');
  qb.skip((page - 1) * limit);
  qb.take(limit);

  const [items, totalItems] = await qb.getManyAndCount();
  return { items, totalItems };
};

const findById = async (id) => {
  return await getRepo().findOne({
    where: { id },
  });
};

const findByName = async (name) => {
  return await getRepo().findOne({
    where: { name: name.trim() },
  });
};

const createService = async (serviceData, manager = null) => {
  const repo = getRepo(manager);
  const newService = repo.create(serviceData);
  return await repo.save(newService);
};

const updateService = async (id, serviceData, manager = null) => {
  const repo = getRepo(manager);
  await repo.update({ id }, serviceData);
  return await findById(id);
};

const deleteService = async (id, manager = null) => {
  const repo = getRepo(manager);
  return await repo.delete({ id });
};

module.exports = {
  findServicesPaginated,
  findById,
  findByName,
  createService,
  updateService,
  deleteService,
};
