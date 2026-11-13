const { EntitySchema } = require("typeorm");

const UserEntity = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: { type: "bigint", primary: true, generated: "increment" },
    email: { type: "nvarchar", length: 255, unique: true, nullable: false },
    password_hash: { type: "nvarchar", length: 255, nullable: false },
    full_name: { type: "nvarchar", length: 100, nullable: false },
    phone: { type: "nvarchar", length: 20, nullable: true },
    role: { type: "nvarchar", length: 20, default: "customer" },
    avatar: { type: "nvarchar", length: 255, nullable: true },
    status: { type: "nvarchar", length: 20, default: "active" },
    created_at: { type: "datetime2", precision: 0, createDate: true },
    updated_at: { type: "datetime2", precision: 0, updateDate: true },
  },
});

const AddressEntity = new EntitySchema({
  name: "Address",
  tableName: "addresses",
  columns: {
    id: { type: "bigint", primary: true, generated: "increment" },
    user_id: { type: "bigint", nullable: false },
    receiver_name: { type: "nvarchar", length: 100, nullable: false },
    phone: { type: "nvarchar", length: 20, nullable: false },
    street_address: { type: "nvarchar", length: 255, nullable: false },
    ward: { type: "nvarchar", length: 100, nullable: true },
    district: { type: "nvarchar", length: 100, nullable: true },
    city: { type: "nvarchar", length: 100, nullable: false },
    is_default: { type: "bit", default: false },
    created_at: { type: "datetime2", precision: 0, createDate: true },
    updated_at: { type: "datetime2", precision: 0, updateDate: true },
  },
});

const PasswordResetTokenEntity = new EntitySchema({
  name: "PasswordResetToken",
  tableName: "password_reset_tokens",
  columns: {
    id: { type: "bigint", primary: true, generated: "increment" },
    user_id: { type: "bigint", nullable: false },
    token_hash: { type: "nvarchar", length: 255, nullable: false },
    expires_at: { type: "datetime2", nullable: false },
    used: { type: "bit", default: false },
    created_at: { type: "datetime2", precision: 0, createDate: true },
  },
});

module.exports = {
  UserEntity,
  AddressEntity,
  PasswordResetTokenEntity,
};
