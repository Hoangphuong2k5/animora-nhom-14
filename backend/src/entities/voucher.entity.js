import { EntitySchema } from 'typeorm';

/**
 * Entities phân hệ Voucher & Khuyến mãi Shop - khớp AnimoraDB_Complete_ver1_5_Clean.sql
 */
const VoucherEntity = new EntitySchema({
  name: 'Voucher',
  tableName: 'Vouchers',
  columns: {
    VoucherID: { type: 'bigint', primary: true, generated: 'increment' },
    VoucherCode: { type: 'nvarchar', length: 50, unique: true, nullable: false },
    VoucherName: { type: 'nvarchar', length: 150, nullable: false },
    DiscountType: { type: 'nvarchar', length: 20, nullable: false },
    DiscountValue: { type: 'decimal', precision: 18, scale: 2, nullable: false },
    MaximumDiscountAmount: { type: 'decimal', precision: 18, scale: 2, nullable: true },
    MinimumOrderAmount: { type: 'decimal', precision: 18, scale: 2, default: 0, nullable: false },
    StartAt: { type: 'datetime2', precision: 0, nullable: false },
    EndAt: { type: 'datetime2', precision: 0, nullable: false },
    UsageLimit: { type: 'int', nullable: true },
    UsedCount: { type: 'int', default: 0, nullable: false },
    IsActive: { type: 'bit', default: true, nullable: false },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const VoucherUsageHistoryEntity = new EntitySchema({
  name: 'VoucherUsageHistory',
  tableName: 'VoucherUsageHistory',
  columns: {
    VoucherUsageHistoryID: { type: 'bigint', primary: true, generated: 'increment' },
    VoucherID: { type: 'bigint', nullable: false },
    CustomerID: { type: 'bigint', nullable: false },
    OrderID: { type: 'bigint', nullable: false, unique: true },
    DiscountAmount: { type: 'decimal', precision: 18, scale: 2, nullable: false },
    UsageStatus: { type: 'nvarchar', length: 20, default: 'Used', nullable: false },
    UsedAt: { type: 'datetime2', precision: 0, createDate: true },
    RevertedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

export { VoucherEntity, VoucherUsageHistoryEntity };
export default { VoucherEntity, VoucherUsageHistoryEntity };

