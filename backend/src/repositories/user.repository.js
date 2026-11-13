const { AppDataSource } = require('../config/data-source');
const { UserEntity, AddressEntity } = require('../entities/user.entity');
const { USER_STATUS } = require('../utils/constants');

const getUserRepo = (manager) => (manager ? manager.getRepository(UserEntity) : AppDataSource.getRepository(UserEntity));
const getAddressRepo = (manager) => (manager ? manager.getRepository(AddressEntity) : AppDataSource.getRepository(AddressEntity));

// User queries
const findById = async (id) => {
  return await getUserRepo().findOne({
    where: { id },
  });
};

const findByEmail = async (email) => {
  return await getUserRepo().findOne({
    where: { email: email.toLowerCase().trim() },
  });
};

const updateProfile = async (id, updateData, manager = null) => {
  const repo = getUserRepo(manager);
  await repo.update({ id }, updateData);
  return await findById(id);
};

// [ACC-08] Admin User Management queries
const findUsersPaginated = async ({ page = 1, limit = 10, search = '', role, status }) => {
  const repo = getUserRepo();
  const qb = repo.createQueryBuilder('u').select([
    'u.id',
    'u.email',
    'u.full_name',
    'u.phone',
    'u.role',
    'u.avatar',
    'u.status',
    'u.created_at',
    'u.updated_at',
  ]);

  if (search) {
    qb.andWhere('(u.email LIKE :search OR u.full_name LIKE :search OR u.phone LIKE :search)', {
      search: `%${search}%`,
    });
  }

  if (role) {
    qb.andWhere('u.role = :role', { role });
  }

  if (status) {
    qb.andWhere('u.status = :status', { status });
  } else {
    // Mặc định không hiển thị user đã bị xóa mềm trừ khi lọc rõ status='deleted'
    qb.andWhere('u.status != :deletedStatus', { deletedStatus: USER_STATUS.DELETED });
  }

  qb.orderBy('u.created_at', 'DESC');
  qb.skip((page - 1) * limit);
  qb.take(limit);

  const [items, totalItems] = await qb.getManyAndCount();
  return { items, totalItems };
};

const createUser = async (userData, manager = null) => {
  const repo = getUserRepo(manager);
  const newUser = repo.create({
    ...userData,
    email: userData.email.toLowerCase().trim(),
  });
  return await repo.save(newUser);
};

const updateUser = async (id, updateData, manager = null) => {
  const repo = getUserRepo(manager);
  await repo.update({ id }, updateData);
  return await findById(id);
};

const softDeleteUser = async (id, manager = null) => {
  const repo = getUserRepo(manager);
  await repo.update({ id }, { status: USER_STATUS.DELETED });
  return true;
};

// [ACC-05] Address queries
const findAddressesByUserId = async (userId) => {
  return await getAddressRepo().find({
    where: { user_id: userId },
    order: { is_default: 'DESC', created_at: 'DESC' },
  });
};

const findAddressById = async (id) => {
  return await getAddressRepo().findOne({
    where: { id },
  });
};

const clearDefaultAddresses = async (userId, exceptId = null, manager = null) => {
  const repo = getAddressRepo(manager);
  const qb = repo
    .createQueryBuilder()
    .update(AddressEntity)
    .set({ is_default: false })
    .where('user_id = :userId', { userId });

  if (exceptId) {
    qb.andWhere('id != :exceptId', { exceptId });
  }

  await qb.execute();
};

const countAddressesByUserId = async (userId) => {
  return await getAddressRepo().count({
    where: { user_id: userId },
  });
};

const createAddress = async (addressData, manager = null) => {
  const repo = getAddressRepo(manager);
  const newAddress = repo.create(addressData);
  return await repo.save(newAddress);
};

const updateAddress = async (id, addressData, manager = null) => {
  const repo = getAddressRepo(manager);
  await repo.update({ id }, addressData);
  return await findAddressById(id);
};

const deleteAddress = async (id, manager = null) => {
  const repo = getAddressRepo(manager);
  return await repo.delete({ id });
};

module.exports = {
  findById,
  findByEmail,
  updateProfile,
  findUsersPaginated,
  createUser,
  updateUser,
  softDeleteUser,
  findAddressesByUserId,
  findAddressById,
  countAddressesByUserId,
  clearDefaultAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
