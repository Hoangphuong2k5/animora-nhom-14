import { AppDataSource } from '../config/data-source.js';
import {
  RoleEntity,
  UserEntity,
  CustomerProfileEntity,
  PasswordResetTokenEntity,
  RescueStationProfileEntity,
} from '../entities/user.entity.js';
import { ExpertEntity } from '../entities/expert.entity.js';
import { SupplierEntity } from '../entities/inventory.entity.js';
import {
  DB_ROLES,
  toDbRoleName,
  toAppRoleName,
  toDbAccountStatus,
  toAppAccountStatus,
} from '../utils/constants.js';

const getRepo = (entity, manager = null) =>
  manager ? manager.getRepository(entity) : AppDataSource.getRepository(entity);

const runInTransaction = async (manager, work) => {
  if (manager) return await work(manager);
  return await AppDataSource.transaction(work);
};

const hydrateUser = async (userRow, manager = null) => {
  if (!userRow) return null;

  const userId = Number(userRow.UserID);
  const [roleRow, customerProfile, employeeProfile, supplierProfile, stationProfile] =
    await Promise.all([
      getRepo(RoleEntity, manager).findOne({ where: { RoleID: Number(userRow.RoleID) } }),
      getRepo(CustomerProfileEntity, manager).findOne({ where: { UserID: userId } }),
      getRepo(ExpertEntity, manager).findOne({ where: { UserID: userId } }),
      getRepo(SupplierEntity, manager).findOne({ where: { UserID: userId } }),
      getRepo(RescueStationProfileEntity, manager).findOne({ where: { UserID: userId } }),
    ]);

  const dbRole = roleRow?.RoleName || DB_ROLES.CUSTOMER;
  const fullName =
    customerProfile?.FullName ||
    employeeProfile?.FullName ||
    supplierProfile?.SupplierName ||
    stationProfile?.StationName ||
    userRow.Email.split('@')[0];
  const avatar = customerProfile?.AvatarUrl || employeeProfile?.AvatarUrl || null;

  return {
    id: userId,
    UserID: userId,
    RoleID: Number(userRow.RoleID),
    email: userRow.Email,
    phone: userRow.PhoneNumber || null,
    password_hash: userRow.PasswordHash,
    full_name: fullName,
    fullName,
    role: toAppRoleName(dbRole),
    dbRole,
    avatar,
    status: toAppAccountStatus(userRow.AccountStatus),
    accountStatus: userRow.AccountStatus,
    is_email_verified: Boolean(userRow.IsEmailVerified),
    customer_id: customerProfile ? Number(customerProfile.CustomerID) : null,
    employee_id: employeeProfile ? Number(employeeProfile.EmployeeID) : null,
    supplier_id: supplierProfile ? Number(supplierProfile.SupplierID) : null,
    rescue_station_id: stationProfile ? Number(stationProfile.RescueStationID) : null,
    created_at: userRow.CreatedAt,
    updated_at: userRow.UpdatedAt,
  };
};

const findByEmail = async (email, manager = null) => {
  const userRow = await getRepo(UserEntity, manager).findOne({
    where: { Email: email.toLowerCase().trim() },
  });
  return await hydrateUser(userRow, manager);
};

const findById = async (id, manager = null) => {
  const userRow = await getRepo(UserEntity, manager).findOne({
    where: { UserID: Number(id) },
  });
  return await hydrateUser(userRow, manager);
};

const findRoleByName = async (roleName, manager = null) => {
  const targetName = toDbRoleName(roleName);
  return await getRepo(RoleEntity, manager).findOne({
    where: { RoleName: targetName },
  });
};

const createProfileForRole = async (dbRole, userRow, userData, manager) => {
  const userId = Number(userRow.UserID);
  const fullName = (userData.fullName || userData.full_name || userRow.Email.split('@')[0]).trim();
  const avatar = userData.avatar || null;

  if (dbRole === DB_ROLES.CUSTOMER) {
    const repo = getRepo(CustomerProfileEntity, manager);
    await repo.save(
      repo.create({
        UserID: userId,
        FullName: fullName,
        AvatarUrl: avatar,
      })
    );
  } else if (dbRole === DB_ROLES.DOCTOR || dbRole === DB_ROLES.CARE_STAFF) {
    const repo = getRepo(ExpertEntity, manager);
    await repo.save(
      repo.create({
        UserID: userId,
        FullName: fullName,
        EmployeeType: dbRole === DB_ROLES.DOCTOR ? 'Doctor' : 'CareStaff',
        EmploymentType: dbRole === DB_ROLES.DOCTOR ? 'FullTime' : userData.employmentType || 'FullTime',
        AvatarUrl: avatar,
        IsActive: true,
      })
    );
  } else if (dbRole === DB_ROLES.SUPPLIER) {
    const repo = getRepo(SupplierEntity, manager);
    await repo.save(
      repo.create({
        UserID: userId,
        SupplierName: fullName,
        PhoneNumber: userRow.PhoneNumber || null,
        Email: userRow.Email,
        IsActive: true,
      })
    );
  } else if (dbRole === DB_ROLES.RESCUE_STATION) {
    const repo = getRepo(RescueStationProfileEntity, manager);
    await repo.save(
      repo.create({
        UserID: userId,
        StationName: fullName,
        PhoneNumber: userRow.PhoneNumber || null,
        Email: userRow.Email,
        IsActive: true,
      })
    );
  }
};

const createUser = async (userData, manager = null) => {
  return await runInTransaction(manager, async (trxManager) => {
    const dbRole = toDbRoleName(userData.role || DB_ROLES.CUSTOMER);
    const roleRow = await findRoleByName(dbRole, trxManager);
    if (!roleRow) {
      throw new Error(`Role "${dbRole}" does not exist in dbo.Roles`);
    }

    const userRepo = getRepo(UserEntity, trxManager);
    const savedUser = await userRepo.save(
      userRepo.create({
        RoleID: Number(roleRow.RoleID),
        Email: userData.email.toLowerCase().trim(),
        PhoneNumber: userData.phone || null,
        PasswordHash: userData.password_hash || userData.PasswordHash,
        AccountStatus: toDbAccountStatus(userData.status || 'Active'),
        IsEmailVerified: Boolean(userData.isEmailVerified ?? userData.is_email_verified ?? false),
      })
    );

    await createProfileForRole(dbRole, savedUser, userData, trxManager);
    return await hydrateUser(savedUser, trxManager);
  });
};

const updatePassword = async (id, passwordHash, manager = null) => {
  const repo = getRepo(UserEntity, manager);
  await repo.update(
    { UserID: Number(id) },
    { PasswordHash: passwordHash, UpdatedAt: new Date() }
  );
  return true;
};

const updateLastLogin = async (id, manager = null) => {
  const repo = getRepo(UserEntity, manager);
  await repo.update({ UserID: Number(id) }, { LastLoginAt: new Date() });
  return true;
};

// [ACC-07] Password reset tokens (AnimoraDB: PasswordResetTokens)
const createPasswordResetToken = async ({ userId, tokenHash, expiresAt }, manager = null) => {
  const repo = getRepo(PasswordResetTokenEntity, manager);
  const tokenRecord = repo.create({
    UserID: Number(userId),
    TokenHash: tokenHash,
    ExpiresAt: expiresAt,
    UsedAt: null,
  });
  const saved = await repo.save(tokenRecord);
  return {
    ...saved,
    id: Number(saved.PasswordResetTokenID),
    user_id: Number(saved.UserID),
    token_hash: saved.TokenHash,
    expires_at: saved.ExpiresAt,
    used_at: saved.UsedAt,
  };
};

const findValidResetToken = async (tokenHash, manager = null) => {
  const repo = getRepo(PasswordResetTokenEntity, manager);
  const record = await repo
    .createQueryBuilder('token')
    .where('token.TokenHash = :tokenHash', { tokenHash })
    .andWhere('token.UsedAt IS NULL')
    .andWhere('token.ExpiresAt > :now', { now: new Date() })
    .getOne();

  if (!record) return null;
  return {
    ...record,
    id: Number(record.PasswordResetTokenID),
    user_id: Number(record.UserID),
    token_hash: record.TokenHash,
    expires_at: record.ExpiresAt,
    used_at: record.UsedAt,
  };
};

const markTokenUsed = async (tokenId, manager = null) => {
  const repo = getRepo(PasswordResetTokenEntity, manager);
  await repo.update({ PasswordResetTokenID: Number(tokenId) }, { UsedAt: new Date() });
  return true;
};

export {
  hydrateUser,
  findByEmail,
  findById,
  findRoleByName,
  createUser,
  updatePassword,
  updateLastLogin,
  createPasswordResetToken,
  findValidResetToken,
  markTokenUsed,
};
export default {
  hydrateUser,
  findByEmail,
  findById,
  findRoleByName,
  createUser,
  updatePassword,
  updateLastLogin,
  createPasswordResetToken,
  findValidResetToken,
  markTokenUsed,
};
