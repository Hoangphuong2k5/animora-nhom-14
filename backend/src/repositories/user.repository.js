import { AppDataSource } from '../config/data-source.js';
import {
  RoleEntity,
  UserEntity,
  CustomerProfileEntity,
  AddressEntity,
  RescueStationProfileEntity,
} from '../entities/user.entity.js';
import { ExpertEntity } from '../entities/expert.entity.js';
import { SupplierEntity } from '../entities/inventory.entity.js';
import {
  hydrateUser,
  createUser as authCreateUser,
  findRoleByName,
} from './auth.repository.js';
import {
  DB_ROLES,
  DB_USER_STATUS,
  toDbRoleName,
  toAppRoleName,
  toDbAccountStatus,
  toAppAccountStatus,
} from '../utils/constants.js';

const getRepo = (entity, manager = null) =>
  manager ? manager.getRepository(entity) : AppDataSource.getRepository(entity);

const formatAddress = (addr, userId = null) => {
  if (!addr) return null;
  const id = Number(addr.CustomerAddressID);
  return {
    id,
    CustomerAddressID: id,
    customer_id: Number(addr.CustomerID),
    CustomerID: Number(addr.CustomerID),
    user_id: userId ? Number(userId) : undefined,
    address_label: addr.AddressLabel || null,
    receiver_name: addr.RecipientName,
    receiverName: addr.RecipientName,
    phone: addr.RecipientPhoneNumber,
    street_address: addr.AddressLine,
    streetAddress: addr.AddressLine,
    ward: addr.Ward || null,
    district: addr.District || null,
    city: addr.Province || '',
    province: addr.Province || '',
    is_default: Boolean(addr.IsDefault),
    isDefault: Boolean(addr.IsDefault),
    is_active: Boolean(addr.IsActive),
    created_at: addr.CreatedAt,
    updated_at: addr.UpdatedAt,
  };
};

const ensureCustomerProfile = async (userId, manager = null) => {
  const cpRepo = getRepo(CustomerProfileEntity, manager);
  let profile = await cpRepo.findOne({ where: { UserID: Number(userId) } });
  if (profile) return profile;

  const user = await getRepo(UserEntity, manager).findOne({ where: { UserID: Number(userId) } });
  if (!user) return null;

  profile = await cpRepo.save(
    cpRepo.create({
      UserID: Number(userId),
      FullName: user.Email.split('@')[0],
    })
  );
  return profile;
};

// User queries
const findById = async (id, manager = null) => {
  const userRow = await getRepo(UserEntity, manager).findOne({
    where: { UserID: Number(id) },
  });
  return await hydrateUser(userRow, manager);
};

const findByEmail = async (email, manager = null) => {
  const userRow = await getRepo(UserEntity, manager).findOne({
    where: { Email: email.toLowerCase().trim() },
  });
  return await hydrateUser(userRow, manager);
};

const updateProfile = async (id, updateData, manager = null) => {
  const userId = Number(id);
  const run = async (trxManager) => {
    const userRepo = getRepo(UserEntity, trxManager);
    const userRow = await userRepo.findOne({ where: { UserID: userId } });
    if (!userRow) return null;

    const userPatch = { UpdatedAt: new Date() };
    if (updateData.phone !== undefined) userPatch.PhoneNumber = updateData.phone;
    await userRepo.update({ UserID: userId }, userPatch);

    const fullName = updateData.full_name ?? updateData.fullName;
    const avatar = updateData.avatar;

    if (fullName !== undefined || avatar !== undefined) {
      const cpRepo = getRepo(CustomerProfileEntity, trxManager);
      const cp = await cpRepo.findOne({ where: { UserID: userId } });
      if (cp) {
        const patch = {};
        if (fullName !== undefined) patch.FullName = fullName;
        if (avatar !== undefined) patch.AvatarUrl = avatar;
        if (Object.keys(patch).length > 0) await cpRepo.update({ UserID: userId }, patch);
      }

      const epRepo = getRepo(ExpertEntity, trxManager);
      const ep = await epRepo.findOne({ where: { UserID: userId } });
      if (ep) {
        const patch = {};
        if (fullName !== undefined) patch.FullName = fullName;
        if (avatar !== undefined) patch.AvatarUrl = avatar;
        if (Object.keys(patch).length > 0) await epRepo.update({ UserID: userId }, patch);
      }

      if (fullName !== undefined) {
        const spRepo = getRepo(SupplierEntity, trxManager);
        const sp = await spRepo.findOne({ where: { UserID: userId } });
        if (sp) await spRepo.update({ UserID: userId }, { SupplierName: fullName });

        const rpRepo = getRepo(RescueStationProfileEntity, trxManager);
        const rp = await rpRepo.findOne({ where: { UserID: userId } });
        if (rp) await rpRepo.update({ UserID: userId }, { StationName: fullName });
      }
    }

    return await findById(userId, trxManager);
  };

  return manager ? await run(manager) : await AppDataSource.transaction(run);
};

// [ACC-08] Admin User Management queries
const findUsersPaginated = async ({ page = 1, limit = 10, search = '', role, status }) => {
  const qb = AppDataSource.createQueryBuilder()
    .select([
      'u.UserID AS UserID',
      'u.RoleID AS RoleID',
      'r.RoleName AS RoleName',
      'u.Email AS Email',
      'u.PhoneNumber AS PhoneNumber',
      'u.AccountStatus AS AccountStatus',
      'u.IsEmailVerified AS IsEmailVerified',
      'u.LastLoginAt AS LastLoginAt',
      'u.CreatedAt AS CreatedAt',
      'u.UpdatedAt AS UpdatedAt',
      'COALESCE(cp.FullName, ep.FullName, sp.SupplierName, rp.StationName, u.Email) AS FullName',
      'COALESCE(cp.AvatarUrl, ep.AvatarUrl) AS AvatarUrl',
    ])
    .from(UserEntity, 'u')
    .innerJoin(RoleEntity, 'r', 'r.RoleID = u.RoleID')
    .leftJoin(CustomerProfileEntity, 'cp', 'cp.UserID = u.UserID')
    .leftJoin(ExpertEntity, 'ep', 'ep.UserID = u.UserID')
    .leftJoin(SupplierEntity, 'sp', 'sp.UserID = u.UserID')
    .leftJoin(RescueStationProfileEntity, 'rp', 'rp.UserID = u.UserID');

  if (search) {
    qb.andWhere(
      '(u.Email LIKE :search OR u.PhoneNumber LIKE :search OR cp.FullName LIKE :search OR ep.FullName LIKE :search OR sp.SupplierName LIKE :search)',
      { search: `%${search}%` }
    );
  }

  if (role) {
    qb.andWhere('r.RoleName = :roleName', { roleName: toDbRoleName(role) });
  }

  if (status) {
    qb.andWhere('u.AccountStatus = :accountStatus', { accountStatus: toDbAccountStatus(status) });
  } else {
    qb.andWhere('u.AccountStatus != :inactiveStatus', {
      inactiveStatus: DB_USER_STATUS.INACTIVE,
    });
  }

  const totalItems = await qb.getCount();
  const rows = await qb
    .orderBy('u.CreatedAt', 'DESC')
    .offset((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .getRawMany();

  const items = rows.map((row) => ({
    id: Number(row.UserID),
    UserID: Number(row.UserID),
    RoleID: Number(row.RoleID),
    email: row.Email,
    phone: row.PhoneNumber || null,
    full_name: row.FullName,
    fullName: row.FullName,
    role: toAppRoleName(row.RoleName),
    dbRole: row.RoleName,
    avatar: row.AvatarUrl || null,
    status: toAppAccountStatus(row.AccountStatus),
    accountStatus: row.AccountStatus,
    created_at: row.CreatedAt,
    updated_at: row.UpdatedAt,
  }));

  return { items, totalItems };
};

const createUser = async (userData, manager = null) => {
  return await authCreateUser(userData, manager);
};

const updateUser = async (id, updateData, manager = null) => {
  const userId = Number(id);
  const run = async (trxManager) => {
    const userRepo = getRepo(UserEntity, trxManager);
    const existing = await userRepo.findOne({ where: { UserID: userId } });
    if (!existing) return null;

    const userPatch = { UpdatedAt: new Date() };
    if (updateData.phone !== undefined) userPatch.PhoneNumber = updateData.phone;
    if (updateData.status !== undefined) {
      userPatch.AccountStatus = toDbAccountStatus(updateData.status);
    }
    if (updateData.role !== undefined) {
      const roleRow = await findRoleByName(updateData.role, trxManager);
      if (roleRow) {
        userPatch.RoleID = Number(roleRow.RoleID);
      }
    }

    await userRepo.update({ UserID: userId }, userPatch);
    await updateProfile(userId, updateData, trxManager);
    return await findById(userId, trxManager);
  };

  return manager ? await run(manager) : await AppDataSource.transaction(run);
};

const softDeleteUser = async (id, manager = null) => {
  await getRepo(UserEntity, manager).update(
    { UserID: Number(id) },
    { AccountStatus: DB_USER_STATUS.INACTIVE, UpdatedAt: new Date() }
  );
  return true;
};

// [ACC-05] Address queries (CustomerAddresses via CustomerProfiles)
const findAddressesByUserId = async (userId, manager = null) => {
  const profile = await getRepo(CustomerProfileEntity, manager).findOne({
    where: { UserID: Number(userId) },
  });
  if (!profile) return [];

  const rows = await getRepo(AddressEntity, manager).find({
    where: { CustomerID: Number(profile.CustomerID), IsActive: true },
    order: { IsDefault: 'DESC', CreatedAt: 'DESC' },
  });
  return rows.map((row) => formatAddress(row, userId));
};

const findAddressById = async (id, manager = null) => {
  const row = await getRepo(AddressEntity, manager).findOne({
    where: { CustomerAddressID: Number(id), IsActive: true },
  });
  if (!row) return null;

  const profile = await getRepo(CustomerProfileEntity, manager).findOne({
    where: { CustomerID: Number(row.CustomerID) },
  });
  return formatAddress(row, profile ? Number(profile.UserID) : null);
};

const clearDefaultAddresses = async (userId, exceptId = null, manager = null) => {
  const profile = await getRepo(CustomerProfileEntity, manager).findOne({
    where: { UserID: Number(userId) },
  });
  if (!profile) return;

  const qb = getRepo(AddressEntity, manager)
    .createQueryBuilder()
    .update(AddressEntity)
    .set({ IsDefault: false, UpdatedAt: new Date() })
    .where('CustomerID = :customerId', { customerId: Number(profile.CustomerID) })
    .andWhere('IsActive = 1');

  if (exceptId) {
    qb.andWhere('CustomerAddressID != :exceptId', { exceptId: Number(exceptId) });
  }

  await qb.execute();
};

const countAddressesByUserId = async (userId, manager = null) => {
  const profile = await getRepo(CustomerProfileEntity, manager).findOne({
    where: { UserID: Number(userId) },
  });
  if (!profile) return 0;

  return await getRepo(AddressEntity, manager).count({
    where: { CustomerID: Number(profile.CustomerID), IsActive: true },
  });
};

const createAddress = async (addressData, manager = null) => {
  const userId = Number(addressData.user_id ?? addressData.userId);
  const profile = await ensureCustomerProfile(userId, manager);
  if (!profile) {
    throw new Error('Không tìm thấy hồ sơ khách hàng để tạo địa chỉ');
  }

  const repo = getRepo(AddressEntity, manager);
  const saved = await repo.save(
    repo.create({
      CustomerID: Number(profile.CustomerID),
      AddressLabel: addressData.addressLabel || addressData.address_label || null,
      RecipientName: addressData.receiver_name ?? addressData.receiverName,
      RecipientPhoneNumber: addressData.phone,
      AddressLine: addressData.street_address ?? addressData.streetAddress,
      Ward: addressData.ward || null,
      District: addressData.district || null,
      Province: addressData.city ?? addressData.province ?? null,
      IsDefault: Boolean(addressData.is_default ?? addressData.isDefault),
      IsActive: true,
    })
  );
  return formatAddress(saved, userId);
};

const updateAddress = async (id, addressData, manager = null) => {
  const patch = { UpdatedAt: new Date() };
  if (addressData.receiver_name !== undefined || addressData.receiverName !== undefined) {
    patch.RecipientName = addressData.receiver_name ?? addressData.receiverName;
  }
  if (addressData.phone !== undefined) patch.RecipientPhoneNumber = addressData.phone;
  if (addressData.street_address !== undefined || addressData.streetAddress !== undefined) {
    patch.AddressLine = addressData.street_address ?? addressData.streetAddress;
  }
  if (addressData.ward !== undefined) patch.Ward = addressData.ward;
  if (addressData.district !== undefined) patch.District = addressData.district;
  if (addressData.city !== undefined || addressData.province !== undefined) {
    patch.Province = addressData.city ?? addressData.province;
  }
  if (addressData.is_default !== undefined || addressData.isDefault !== undefined) {
    patch.IsDefault = Boolean(addressData.is_default ?? addressData.isDefault);
  }
  if (addressData.addressLabel !== undefined || addressData.address_label !== undefined) {
    patch.AddressLabel = addressData.addressLabel ?? addressData.address_label;
  }

  await getRepo(AddressEntity, manager).update({ CustomerAddressID: Number(id) }, patch);
  return await findAddressById(id, manager);
};

const deleteAddress = async (id, manager = null) => {
  return await getRepo(AddressEntity, manager).update(
    { CustomerAddressID: Number(id) },
    { IsActive: false, IsDefault: false, UpdatedAt: new Date() }
  );
};

export {
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
export default {
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
