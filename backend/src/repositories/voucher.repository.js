import { AppDataSource } from '../config/data-source.js';
import { VoucherEntity, VoucherUsageHistoryEntity } from '../entities/voucher.entity.js';
import { CustomerProfileEntity } from '../entities/user.entity.js';

/**
 * VoucherRepository ánh xạ dbo.Vouchers, dbo.VoucherUsageHistory và dbo.Orders (AnimoraDB ver 1.5)
 */
class VoucherRepository {
  constructor(dataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  getRepo(entity, manager = null) {
    return manager ? manager.getRepository(entity) : this.dataSource.getRepository(entity);
  }

  async resolveCustomerByUserId(userId, manager = null) {
    return await this.getRepo(CustomerProfileEntity, manager).findOne({
      where: { UserID: Number(userId) },
    });
  }

  async findAll({ search } = {}, manager = null) {
    const qb = this.getRepo(VoucherEntity, manager)
      .createQueryBuilder('v')
      .orderBy('v.CreatedAt', 'DESC')
      .addOrderBy('v.VoucherID', 'DESC');

    if (search && String(search).trim()) {
      const kw = `%${String(search).trim().toLowerCase()}%`;
      qb.where('(LOWER(v.VoucherCode) LIKE :kw OR LOWER(v.VoucherName) LIKE :kw)', { kw });
    }

    return await qb.getMany();
  }

  async findById(voucherId, manager = null) {
    return await this.getRepo(VoucherEntity, manager).findOne({
      where: { VoucherID: Number(voucherId) },
    });
  }

  async findByCode(code, manager = null) {
    return await this.getRepo(VoucherEntity, manager).findOne({
      where: { VoucherCode: String(code).trim().toUpperCase() },
    });
  }

  async createVoucher(data, manager = null) {
    const repo = this.getRepo(VoucherEntity, manager);
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async updateVoucher(voucherId, patch, manager = null) {
    const repo = this.getRepo(VoucherEntity, manager);
    await repo.update({ VoucherID: Number(voucherId) }, patch);
    return await this.findById(voucherId, manager);
  }

  async deleteVoucher(voucherId, manager = null) {
    const repo = this.getRepo(VoucherEntity, manager);
    return await repo.delete({ VoucherID: Number(voucherId) });
  }

  async hasOrderReference(voucherId, manager = null) {
    const runner = manager || this.dataSource;
    const rows = await runner.query(
      `SELECT TOP 1 1 AS HasRef
       FROM dbo.Orders
       WHERE VoucherID = @0
       UNION ALL
       SELECT TOP 1 1 AS HasRef
       FROM dbo.VoucherUsageHistory
       WHERE VoucherID = @0`,
      [Number(voucherId)]
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async findActiveUsageByCustomer(voucherId, customerId, manager = null) {
    return await this.getRepo(VoucherUsageHistoryEntity, manager).findOne({
      where: {
        VoucherID: Number(voucherId),
        CustomerID: Number(customerId),
        UsageStatus: 'Used',
      },
    });
  }

  async findUsageByOrderId(orderId, manager = null) {
    return await this.getRepo(VoucherUsageHistoryEntity, manager).findOne({
      where: { OrderID: Number(orderId) },
    });
  }

  async findOrderById(orderId, manager = null) {
    const runner = manager || this.dataSource;
    const rows = await runner.query(
      `SELECT OrderID, CustomerID, OrderCode, VoucherID, SubtotalAmount, DiscountAmount, ShippingFee, TotalAmount, OrderStatus
       FROM dbo.Orders
       WHERE OrderID = @0`,
      [Number(orderId)]
    );
    return rows[0] || null;
  }

  async incrementUsedCountAtomically(voucherId, manager = null) {
    const runner = manager || this.dataSource;
    const rows = await runner.query(
      `UPDATE dbo.Vouchers
       SET UsedCount = UsedCount + 1
       OUTPUT INSERTED.VoucherID, INSERTED.UsedCount
       WHERE VoucherID = @0
         AND IsActive = 1
         AND (UsageLimit IS NULL OR UsedCount < UsageLimit)`,
      [Number(voucherId)]
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async decrementUsedCount(voucherId, manager = null) {
    const runner = manager || this.dataSource;
    const rows = await runner.query(
      `UPDATE dbo.Vouchers
       SET UsedCount = CASE WHEN UsedCount > 0 THEN UsedCount - 1 ELSE 0 END
       OUTPUT INSERTED.VoucherID, INSERTED.UsedCount
       WHERE VoucherID = @0`,
      [Number(voucherId)]
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async createUsageHistory(data, manager = null) {
    const repo = this.getRepo(VoucherUsageHistoryEntity, manager);
    return await repo.save(repo.create(data));
  }

  async markUsageReverted(historyId, manager = null) {
    const repo = this.getRepo(VoucherUsageHistoryEntity, manager);
    await repo.update(
      { VoucherUsageHistoryID: Number(historyId) },
      { UsageStatus: 'Reverted', RevertedAt: new Date() }
    );
    return await repo.findOne({
      where: { VoucherUsageHistoryID: Number(historyId) },
    });
  }

  async updateOrderVoucherTotals(
    orderId,
    { voucherId, discountAmount, totalAmount },
    manager = null
  ) {
    const runner = manager || this.dataSource;
    await runner.query(
      `UPDATE dbo.Orders
       SET VoucherID = @1,
           DiscountAmount = @2,
           TotalAmount = @3,
           UpdatedAt = SYSDATETIME()
       WHERE OrderID = @0`,
      [Number(orderId), voucherId !== null ? Number(voucherId) : null, Number(discountAmount), Number(totalAmount)]
    );
  }
}

const defaultVoucherRepository = new VoucherRepository();
export { defaultVoucherRepository, VoucherRepository };
export default defaultVoucherRepository;

