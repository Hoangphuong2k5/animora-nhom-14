import { EntitySchema } from 'typeorm';

const RoleEntity = new EntitySchema({
  name: 'Role',
  tableName: 'Roles',
  columns: {
    RoleID: { type: 'int', primary: true, generated: 'increment' },
    RoleName: { type: 'nvarchar', length: 50, unique: true, nullable: false },
    Description: { type: 'nvarchar', length: 255, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'Users',
  columns: {
    UserID: { type: 'bigint', primary: true, generated: 'increment' },
    RoleID: { type: 'int', nullable: false },
    Email: { type: 'nvarchar', length: 255, unique: true, nullable: false },
    PhoneNumber: { type: 'nvarchar', length: 20, nullable: true },
    PasswordHash: { type: 'nvarchar', length: 500, nullable: false },
    AccountStatus: { type: 'nvarchar', length: 30, default: 'Active' },
    IsEmailVerified: { type: 'bit', default: false },
    LastLoginAt: { type: 'datetime2', precision: 0, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
    UpdatedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const CustomerProfileEntity = new EntitySchema({
  name: 'CustomerProfile',
  tableName: 'CustomerProfiles',
  columns: {
    CustomerID: { type: 'bigint', primary: true, generated: 'increment' },
    UserID: { type: 'bigint', unique: true, nullable: false },
    FullName: { type: 'nvarchar', length: 150, nullable: false },
    DateOfBirth: { type: 'date', nullable: true },
    Gender: { type: 'nvarchar', length: 20, nullable: true },
    Address: { type: 'nvarchar', length: 500, nullable: true },
    AvatarUrl: { type: 'nvarchar', length: 1000, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const AddressEntity = new EntitySchema({
  name: 'Address',
  tableName: 'CustomerAddresses',
  columns: {
    CustomerAddressID: { type: 'bigint', primary: true, generated: 'increment' },
    CustomerID: { type: 'bigint', nullable: false },
    AddressLabel: { type: 'nvarchar', length: 50, nullable: true },
    RecipientName: { type: 'nvarchar', length: 150, nullable: false },
    RecipientPhoneNumber: { type: 'nvarchar', length: 20, nullable: false },
    AddressLine: { type: 'nvarchar', length: 500, nullable: false },
    Ward: { type: 'nvarchar', length: 150, nullable: true },
    District: { type: 'nvarchar', length: 150, nullable: true },
    Province: { type: 'nvarchar', length: 150, nullable: true },
    IsDefault: { type: 'bit', default: false },
    IsActive: { type: 'bit', default: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
    UpdatedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const PasswordResetTokenEntity = new EntitySchema({
  name: 'PasswordResetToken',
  tableName: 'PasswordResetTokens',
  columns: {
    PasswordResetTokenID: { type: 'bigint', primary: true, generated: 'increment' },
    UserID: { type: 'bigint', nullable: false },
    TokenHash: { type: 'nvarchar', length: 500, unique: true, nullable: false },
    ExpiresAt: { type: 'datetime2', precision: 0, nullable: false },
    UsedAt: { type: 'datetime2', precision: 0, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const UserSessionEntity = new EntitySchema({
  name: 'UserSession',
  tableName: 'UserSessions',
  columns: {
    UserSessionID: { type: 'bigint', primary: true, generated: 'increment' },
    UserID: { type: 'bigint', nullable: false },
    RefreshTokenHash: { type: 'nvarchar', length: 500, unique: true, nullable: false },
    DeviceInfo: { type: 'nvarchar', length: 300, nullable: true },
    IpAddress: { type: 'nvarchar', length: 45, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
    LastActiveAt: { type: 'datetime2', precision: 0, nullable: true },
    ExpiresAt: { type: 'datetime2', precision: 0, nullable: false },
    RevokedAt: { type: 'datetime2', precision: 0, nullable: true },
    RevokeReason: { type: 'nvarchar', length: 30, nullable: true },
  },
});

export {
  RoleEntity,
  UserEntity,
  CustomerProfileEntity,
  AddressEntity,
  PasswordResetTokenEntity,
  UserSessionEntity,
};
export default {
  RoleEntity,
  UserEntity,
  CustomerProfileEntity,
  AddressEntity,
  PasswordResetTokenEntity,
  UserSessionEntity,
};
