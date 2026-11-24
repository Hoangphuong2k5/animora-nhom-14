/**
 * Hằng số vai trò & trạng thái khớp với AnimoraDB_Complete_ver1_5_Clean.sql
 * Kèm bảng quy đổi tương thích ngược với các tên role ngắn ở route/API cũ.
 */
const DB_ROLES = {
  CUSTOMER: 'Customer',
  DOCTOR: 'Doctor',
  CARE_STAFF: 'CareStaff',
  MANAGER: 'Manager',
  ADMIN: 'Admin',
  SUPPLIER: 'Supplier',
  RECEPTIONIST: 'Receptionist',
};

// Chuẩn danh mục 7 Role theo Animora v1.4 (KH, BS, NVCS, LT, QL, AD, SUP)
const ROLES = {
  // Chuẩn DB (dbo.Roles)
  CUSTOMER: 'Customer',
  DOCTOR: 'Doctor',
  CARE_STAFF: 'CareStaff',
  MANAGER: 'Manager',
  ADMIN: 'Admin',
  SUPPLIER: 'Supplier',
  RECEPTIONIST: 'Receptionist',

  // Aliases tương thích ngược cho backend & unit tests
  STAFF: 'CareStaff',
  EXPERT: 'Doctor',
  WAREHOUSE: 'CareStaff',
  SUPPORT: 'CareStaff',

  // Lowercase aliases
  customer: 'Customer',
  doctor: 'Doctor',
  carestaff: 'CareStaff',
  manager: 'Manager',
  admin: 'Admin',
  supplier: 'Supplier',
  receptionist: 'Receptionist',
  lt: 'Receptionist',
  staff: 'CareStaff',
  expert: 'Doctor',
};

// Ánh xạ RoleID tương ứng trong dbo.Roles
const ROLE_IDS = {
  Customer: 1,
  Doctor: 2,
  CareStaff: 3,
  Manager: 4,
  Admin: 5,
  Supplier: 6,
  Receptionist: 7,

  // Aliases
  customer: 1,
  doctor: 2,
  carestaff: 3,
  manager: 4,
  admin: 5,
  supplier: 6,
  receptionist: 7,
  lt: 7,
  expert: 2,
  staff: 3,
};

const ROLE_NAMES = {
  1: 'Customer',
  2: 'Doctor',
  3: 'CareStaff',
  4: 'Manager',
  5: 'Admin',
  6: 'Supplier',
  7: 'Receptionist',
};

const ROLE_TO_DB_MAP = {
  customer: DB_ROLES.CUSTOMER,
  doctor: DB_ROLES.DOCTOR,
  vet: DB_ROLES.DOCTOR,
  expert: DB_ROLES.DOCTOR,
  care_staff: DB_ROLES.CARE_STAFF,
  carestaff: DB_ROLES.CARE_STAFF,
  groomer: DB_ROLES.CARE_STAFF,
  trainer: DB_ROLES.CARE_STAFF,
  staff: DB_ROLES.MANAGER,
  manager: DB_ROLES.MANAGER,
  warehouse: DB_ROLES.MANAGER,
  support: DB_ROLES.MANAGER,
  admin: DB_ROLES.ADMIN,
  supplier: DB_ROLES.SUPPLIER,
  receptionist: DB_ROLES.RECEPTIONIST,
  lt: DB_ROLES.RECEPTIONIST,
};

const DB_ROLE_TO_APP_MAP = {
  [DB_ROLES.CUSTOMER]: 'customer',
  [DB_ROLES.DOCTOR]: 'expert',
  [DB_ROLES.CARE_STAFF]: 'expert',
  [DB_ROLES.MANAGER]: 'manager',
  [DB_ROLES.ADMIN]: 'admin',
  [DB_ROLES.SUPPLIER]: 'supplier',
  [DB_ROLES.RECEPTIONIST]: 'receptionist',
};

// Giá trị hợp lệ theo CK_Users_AccountStatus
const DB_USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  LOCKED: 'Locked',
  PENDING: 'Pending',
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
  LOCKED: 'locked',
  DELETED: 'deleted',
  PENDING: 'pending',

  // Aliases PascalCase
  Active: 'Active',
  Inactive: 'Inactive',
  Locked: 'Locked',
  Pending: 'Pending',
};

const STATUS_TO_DB_MAP = {
  active: DB_USER_STATUS.ACTIVE,
  inactive: DB_USER_STATUS.INACTIVE,
  deleted: DB_USER_STATUS.INACTIVE,
  locked: DB_USER_STATUS.LOCKED,
  banned: DB_USER_STATUS.LOCKED,
  pending: DB_USER_STATUS.PENDING,
  Active: DB_USER_STATUS.ACTIVE,
  Inactive: DB_USER_STATUS.INACTIVE,
  Locked: DB_USER_STATUS.LOCKED,
  Pending: DB_USER_STATUS.PENDING,
};

const DB_STATUS_TO_APP_MAP = {
  [DB_USER_STATUS.ACTIVE]: 'active',
  [DB_USER_STATUS.INACTIVE]: 'inactive',
  [DB_USER_STATUS.LOCKED]: 'locked',
  [DB_USER_STATUS.PENDING]: 'pending',
};

const toDbRoleName = (role) => {
  if (!role) return DB_ROLES.CUSTOMER;
  const key = String(role).trim().toLowerCase();
  return ROLE_TO_DB_MAP[key] || role;
};

const toAppRoleName = (dbRoleName) => {
  if (!dbRoleName) return 'customer';
  return DB_ROLE_TO_APP_MAP[dbRoleName] || String(dbRoleName).toLowerCase();
};

const toDbAccountStatus = (status) => {
  if (!status) return DB_USER_STATUS.ACTIVE;
  const key = String(status).trim().toLowerCase();
  return STATUS_TO_DB_MAP[key] || DB_USER_STATUS.ACTIVE;
};

const toAppAccountStatus = (dbStatus) => {
  if (!dbStatus) return 'active';
  return DB_STATUS_TO_APP_MAP[dbStatus] || String(dbStatus).toLowerCase();
};

export {
  DB_ROLES,
  ROLES,
  ROLE_IDS,
  ROLE_NAMES,
  DB_USER_STATUS,
  USER_STATUS,
  toDbRoleName,
  toAppRoleName,
  toDbAccountStatus,
  toAppAccountStatus,
};
export default {
  DB_ROLES,
  ROLES,
  ROLE_IDS,
  ROLE_NAMES,
  DB_USER_STATUS,
  USER_STATUS,
  toDbRoleName,
  toAppRoleName,
  toDbAccountStatus,
  toAppAccountStatus,
};
