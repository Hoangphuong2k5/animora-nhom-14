import crypto from 'crypto';
import dayjs from 'dayjs';
import { AppDataSource } from '../config/data-source.js';
import {
  SupplierEntity,
  SupplierProductEntity,
  ProductEntity,
  ProductVariantEntity,
  PurchaseOrderEntity,
  PurchaseOrderItemEntity,
  PurchaseOrderStatusHistoryEntity,
  GoodsReceiptEntity,
  GoodsReceiptItemEntity,
  InventoryBatchEntity,
  StockMovementEntity,
} from '../entities/inventory.entity.js';

const generateDocumentCode = (prefix) =>
  `${prefix}-${dayjs().format('YYYYMMDD')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const PO_STATUS_TO_DB = {
  draft: 'Draft',
  sent: 'Sent',
  confirmed: 'Accepted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  shipping: 'Shipping',
  partially_received: 'PartiallyReceived',
  partiallyreceived: 'PartiallyReceived',
  received: 'Received',
  cancelled: 'Cancelled',
};

const PO_STATUS_TO_APP = {
  Draft: 'draft',
  Sent: 'sent',
  Accepted: 'confirmed',
  Rejected: 'rejected',
  Shipping: 'shipping',
  PartiallyReceived: 'partially_received',
  Received: 'received',
  Cancelled: 'cancelled',
};

const toDbPoStatus = (status) => {
  if (!status) return 'Sent';
  const key = String(status).trim().toLowerCase();
  return PO_STATUS_TO_DB[key] || status;
};

const toAppPoStatus = (dbStatus) => {
  if (!dbStatus) return 'draft';
  return PO_STATUS_TO_APP[dbStatus] || String(dbStatus).toLowerCase();
};

/**
 * InventoryRepository ánh xạ 100% với AnimoraDB_Complete_ver1_5_Clean.sql
 */
class InventoryRepository {
  constructor(dataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  getManager(queryRunner = null) {
    return queryRunner ? queryRunner.manager : this.dataSource.manager;
  }

  // ==================== SUP-01 / SUP-02 / SUP-03: SUPPLIER PROFILES & PRICES ====================

  async createSupplier(data, queryRunner = null) {
    const repo = this.getManager(queryRunner).getRepository(SupplierEntity);
    const entity = repo.create({
      UserID: Number(data.user_id ?? data.UserID),
      SupplierName: data.company_name ?? data.SupplierName,
      ContactPerson: data.contact_name ?? data.ContactPerson ?? null,
      PhoneNumber: data.phone ?? data.PhoneNumber ?? null,
      Email: data.email ?? data.Email ?? null,
      Address: data.address ?? data.Address ?? null,
      TaxCode: data.tax_code ?? data.TaxCode ?? null,
      IsActive: true,
    });
    return await repo.save(entity);
  }

  async findSupplierById(id, queryRunner = null) {
    return await this.getManager(queryRunner).getRepository(SupplierEntity).findOne({
      where: { SupplierID: Number(id) },
    });
  }

  async findSupplierByUserId(userId, queryRunner = null) {
    return await this.getManager(queryRunner).getRepository(SupplierEntity).findOne({
      where: { UserID: Number(userId) },
    });
  }

  async updateSupplier(id, updateData, queryRunner = null) {
    const repo = this.getManager(queryRunner).getRepository(SupplierEntity);
    const patch = {};
    if (updateData.company_name !== undefined || updateData.SupplierName !== undefined) {
      patch.SupplierName = updateData.company_name ?? updateData.SupplierName;
    }
    if (updateData.contact_name !== undefined || updateData.ContactPerson !== undefined) {
      patch.ContactPerson = updateData.contact_name ?? updateData.ContactPerson;
    }
    if (updateData.phone !== undefined || updateData.PhoneNumber !== undefined) {
      patch.PhoneNumber = updateData.phone ?? updateData.PhoneNumber;
    }
    if (updateData.email !== undefined || updateData.Email !== undefined) {
      patch.Email = updateData.email ?? updateData.Email;
    }
    if (updateData.address !== undefined || updateData.Address !== undefined) {
      patch.Address = updateData.address ?? updateData.Address;
    }
    if (updateData.tax_code !== undefined || updateData.TaxCode !== undefined) {
      patch.TaxCode = updateData.tax_code ?? updateData.TaxCode;
    }
    if (updateData.status !== undefined) {
      patch.IsActive = updateData.status === 'active';
    }
    if (updateData.IsActive !== undefined) {
      patch.IsActive = Boolean(updateData.IsActive);
    }

    if (Object.keys(patch).length > 0) {
      await repo.update({ SupplierID: Number(id) }, patch);
    }
    return await this.findSupplierById(id, queryRunner);
  }

  async findSuppliers({ status, keyword, after_id, page = 1, limit = 20 }) {
    const qb = this.dataSource
      .getRepository(SupplierEntity)
      .createQueryBuilder('s');

    if (status) {
      qb.andWhere('s.IsActive = :isActive', { isActive: status === 'active' ? 1 : 0 });
    }
    if (keyword) {
      qb.andWhere('(s.SupplierName LIKE :kw OR s.Email LIKE :kw OR s.PhoneNumber LIKE :kw)', {
        kw: `${keyword}%`,
      });
    }

    const total = await qb.getCount();

    if (after_id) {
      qb.andWhere('s.SupplierID < :afterId', { afterId: Number(after_id) });
      qb.orderBy('s.SupplierID', 'DESC').take(Number(limit));
    } else {
      qb.orderBy('s.SupplierID', 'DESC')
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit));
    }

    const items = await qb.getMany();
    const nextCursor = items.length > 0 ? Number(items[items.length - 1].SupplierID) : null;

    return { items, total, page: Number(page), limit: Number(limit), nextCursor };
  }

  /**
   * Resolve ProductVariant từ product_variant_id hoặc product_id (ưu tiên khớp ProductVariantID trước)
   */
  async resolveVariant(idOrVariantId, queryRunner = null) {
    const manager = this.getManager(queryRunner);
    const idNum = Number(idOrVariantId);

    const byVariant = await manager
      .createQueryBuilder()
      .select([
        'pv.ProductVariantID AS ProductVariantID',
        'pv.ProductID AS ProductID',
        'pv.SKU AS SKU',
        'pv.VariantName AS VariantName',
        'pv.UnitPrice AS UnitPrice',
        'pv.StockQuantity AS StockQuantity',
        'p.ProductName AS ProductName',
      ])
      .from(ProductVariantEntity, 'pv')
      .innerJoin(ProductEntity, 'p', 'p.ProductID = pv.ProductID')
      .where('pv.ProductVariantID = :id AND pv.IsActive = 1', { id: idNum })
      .getRawOne();
    if (byVariant) return byVariant;

    return await manager
      .createQueryBuilder()
      .select([
        'pv.ProductVariantID AS ProductVariantID',
        'pv.ProductID AS ProductID',
        'pv.SKU AS SKU',
        'pv.VariantName AS VariantName',
        'pv.UnitPrice AS UnitPrice',
        'pv.StockQuantity AS StockQuantity',
        'p.ProductName AS ProductName',
      ])
      .from(ProductVariantEntity, 'pv')
      .innerJoin(ProductEntity, 'p', 'p.ProductID = pv.ProductID')
      .where('pv.ProductID = :id AND pv.IsActive = 1', { id: idNum })
      .orderBy('pv.ProductVariantID', 'ASC')
      .getRawOne();
  }

  async findProductsByIds(ids, queryRunner = null) {
    if (!ids || ids.length === 0) return [];
    const results = [];
    for (const rawId of ids) {
      const resolved = await this.resolveVariant(rawId, queryRunner);
      if (resolved) results.push(resolved);
    }
    return results;
  }

  async upsertSupplierPrice(supplierId, productOrVariantId, price, supplierSku = null, queryRunner = null) {
    const manager = this.getManager(queryRunner);
    const variant = await this.resolveVariant(productOrVariantId, queryRunner);
    const variantId = Number(variant.ProductVariantID);
    const repo = manager.getRepository(SupplierProductEntity);

    const existing = await repo.findOne({
      where: { SupplierID: Number(supplierId), ProductVariantID: variantId },
    });

    if (existing) {
      await repo.update(
        { SupplierProductID: Number(existing.SupplierProductID) },
        {
          SupplierUnitPrice: Number(price),
          SupplierSKU: supplierSku ?? existing.SupplierSKU,
          AvailabilityUpdatedAt: new Date(),
        }
      );
    } else {
      await repo.save(
        repo.create({
          SupplierID: Number(supplierId),
          ProductVariantID: variantId,
          SupplierSKU: supplierSku,
          SupplierUnitPrice: Number(price),
          AvailabilityStatus: 'Available',
          AvailabilityUpdatedAt: new Date(),
        })
      );
    }

    const rows = await manager.query(
      `SELECT sp.SupplierProductID, sp.SupplierID, sp.ProductVariantID, pv.ProductID,
              p.ProductName, pv.VariantName, pv.SKU, sp.SupplierSKU, sp.SupplierUnitPrice,
              sp.AvailabilityStatus, sp.AvailabilityUpdatedAt
       FROM dbo.SupplierProducts sp
       INNER JOIN dbo.ProductVariants pv ON pv.ProductVariantID = sp.ProductVariantID
       INNER JOIN dbo.Products p ON p.ProductID = pv.ProductID
       WHERE sp.SupplierID = @0 AND sp.ProductVariantID = @1`,
      [Number(supplierId), variantId]
    );
    return rows[0] || null;
  }

  async findSupplierPrices(supplierId) {
    return await this.dataSource.query(
      `SELECT sp.SupplierProductID, sp.SupplierID, sp.ProductVariantID, pv.ProductID,
              p.ProductName, pv.VariantName, pv.SKU, sp.SupplierSKU, sp.SupplierUnitPrice,
              sp.AvailabilityStatus, sp.AvailabilityUpdatedAt
       FROM dbo.SupplierProducts sp
       INNER JOIN dbo.ProductVariants pv ON pv.ProductVariantID = sp.ProductVariantID
       INNER JOIN dbo.Products p ON p.ProductID = pv.ProductID
       WHERE sp.SupplierID = @0
       ORDER BY sp.AvailabilityUpdatedAt DESC`,
      [Number(supplierId)]
    );
  }

  // ==================== PUR-01..04: PURCHASE ORDERS ====================

  async createPurchaseOrderHeader(data, queryRunner) {
    const repo = this.getManager(queryRunner).getRepository(PurchaseOrderEntity);
    const po = repo.create({
      PurchaseOrderCode: generateDocumentCode('PO'),
      SupplierID: Number(data.supplier_id),
      CreatedByUserID: Number(data.created_by),
      PurchaseOrderStatus: toDbPoStatus(data.status || 'sent'),
      TotalAmount: Number(data.total),
      ExpectedDeliveryAt: data.expected_date || null,
      Notes: data.note || null,
    });
    return await repo.save(po);
  }

  async bulkInsertPurchaseOrderItems(poId, items, queryRunner) {
    const repo = this.getManager(queryRunner).getRepository(PurchaseOrderItemEntity);
    const entities = [];
    for (const item of items) {
      const variantId = Number(item.product_variant_id ?? item.product_id);
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unit_price);
      entities.push(
        repo.create({
          PurchaseOrderID: Number(poId),
          ProductVariantID: variantId,
          Quantity: quantity,
          UnitCost: unitCost,
          LineTotal: Math.round(quantity * unitCost * 100) / 100,
        })
      );
    }
    return await repo.save(entities);
  }

  async findPurchaseOrderItemsByPoIds(poIds, queryRunner = null) {
    if (!poIds || poIds.length === 0) return [];
    const manager = this.getManager(queryRunner);
    return await manager
      .createQueryBuilder()
      .select([
        'pod.PurchaseOrderDetailID AS PurchaseOrderDetailID',
        'pod.PurchaseOrderID AS PurchaseOrderID',
        'pod.ProductVariantID AS ProductVariantID',
        'pod.Quantity AS Quantity',
        'pod.ConfirmedQuantity AS ConfirmedQuantity',
        'pod.UnitCost AS UnitCost',
        'pod.LineTotal AS LineTotal',
        'pv.ProductID AS ProductID',
        'pv.VariantName AS VariantName',
        'pv.SKU AS SKU',
        'p.ProductName AS ProductName',
      ])
      .from(PurchaseOrderItemEntity, 'pod')
      .innerJoin(ProductVariantEntity, 'pv', 'pv.ProductVariantID = pod.ProductVariantID')
      .innerJoin(ProductEntity, 'p', 'p.ProductID = pv.ProductID')
      .where('pod.PurchaseOrderID IN (:...poIds)', { poIds: poIds.map(Number) })
      .orderBy('pod.PurchaseOrderDetailID', 'ASC')
      .getRawMany();
  }

  async findPurchaseOrderById(poId, queryRunner = null) {
    const manager = this.getManager(queryRunner);
    const po = await manager.getRepository(PurchaseOrderEntity).findOne({
      where: { PurchaseOrderID: Number(poId) },
    });
    if (!po) return null;

    const [supplier, items] = await Promise.all([
      this.findSupplierById(po.SupplierID, queryRunner),
      this.findPurchaseOrderItemsByPoIds([po.PurchaseOrderID], queryRunner),
    ]);

    return {
      ...po,
      id: Number(po.PurchaseOrderID),
      app_status: toAppPoStatus(po.PurchaseOrderStatus),
      supplier: supplier || null,
      items,
    };
  }

  async findPurchaseOrders({ supplier_id, status, after_id, page = 1, limit = 20 }) {
    const qb = this.dataSource.getRepository(PurchaseOrderEntity).createQueryBuilder('po');

    if (supplier_id) {
      qb.andWhere('po.SupplierID = :supplierId', { supplierId: Number(supplier_id) });
    }
    if (status) {
      qb.andWhere('po.PurchaseOrderStatus = :status', { status: toDbPoStatus(status) });
    }

    const total = await qb.getCount();

    if (after_id) {
      qb.andWhere('po.PurchaseOrderID < :afterId', { afterId: Number(after_id) });
      qb.orderBy('po.PurchaseOrderID', 'DESC').take(Number(limit));
    } else {
      qb.orderBy('po.PurchaseOrderID', 'DESC')
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit));
    }

    const pos = await qb.getMany();
    if (pos.length === 0) {
      return { items: [], total, page: Number(page), limit: Number(limit), nextCursor: null };
    }

    const poIds = pos.map((p) => Number(p.PurchaseOrderID));
    const supplierIds = [...new Set(pos.map((p) => Number(p.SupplierID)))];

    const [allItems, suppliers] = await Promise.all([
      this.findPurchaseOrderItemsByPoIds(poIds),
      this.dataSource
        .getRepository(SupplierEntity)
        .createQueryBuilder('s')
        .where('s.SupplierID IN (:...supplierIds)', { supplierIds })
        .getMany(),
    ]);

    const itemsByPoId = new Map();
    for (const item of allItems) {
      const key = Number(item.PurchaseOrderID);
      const list = itemsByPoId.get(key) || [];
      list.push(item);
      itemsByPoId.set(key, list);
    }

    const supplierById = new Map(suppliers.map((s) => [Number(s.SupplierID), s]));

    const enriched = pos.map((po) => ({
      ...po,
      id: Number(po.PurchaseOrderID),
      app_status: toAppPoStatus(po.PurchaseOrderStatus),
      supplier: supplierById.get(Number(po.SupplierID)) || null,
      items: itemsByPoId.get(Number(po.PurchaseOrderID)) || [],
    }));

    const nextCursor =
      enriched.length > 0 ? Number(enriched[enriched.length - 1].PurchaseOrderID) : null;
    return { items: enriched, total, page: Number(page), limit: Number(limit), nextCursor };
  }

  async updatePurchaseOrderStatus(poId, newStatus, changedByUserId = null, queryRunner = null) {
    const manager = this.getManager(queryRunner);
    const repo = manager.getRepository(PurchaseOrderEntity);
    const current = await repo.findOne({ where: { PurchaseOrderID: Number(poId) } });
    const dbStatus = toDbPoStatus(newStatus);

    const patch = { PurchaseOrderStatus: dbStatus };
    if (dbStatus === 'Accepted' || dbStatus === 'Rejected') {
      patch.SupplierRespondedAt = new Date();
    }
    if (dbStatus === 'Shipping') {
      patch.ShippedAt = new Date();
    }

    await repo.update({ PurchaseOrderID: Number(poId) }, patch);

    if (changedByUserId && current) {
      const historyRepo = manager.getRepository(PurchaseOrderStatusHistoryEntity);
      await historyRepo.save(
        historyRepo.create({
          PurchaseOrderID: Number(poId),
          OldStatus: current.PurchaseOrderStatus,
          NewStatus: dbStatus,
          ChangedByUserID: Number(changedByUserId),
        })
      );
    }

    return await this.findPurchaseOrderById(poId, queryRunner);
  }

  // ==================== INV-01..04: GOODS RECEIPTS, BATCHES, TRANSACTIONS & FEFO ====================

  async createGoodsReceiptHeader(data, queryRunner) {
    const repo = this.getManager(queryRunner).getRepository(GoodsReceiptEntity);
    const gr = repo.create({
      PurchaseOrderID: Number(data.po_id),
      GoodsReceiptCode: generateDocumentCode('GR'),
      ReceivedByUserID: Number(data.received_by),
      ReceivedAt: new Date(),
      ReceiptNote: data.note || null,
    });
    return await repo.save(gr);
  }

  async bulkCreateGoodsReceiptItems(grId, poId, items, queryRunner) {
    const repo = this.getManager(queryRunner).getRepository(GoodsReceiptItemEntity);
    const poItems = await this.findPurchaseOrderItemsByPoIds([poId], queryRunner);
    const poItemByVariantId = new Map(poItems.map((pi) => [Number(pi.ProductVariantID), pi]));
    const poItemByProductId = new Map(poItems.map((pi) => [Number(pi.ProductID), pi]));

    const entities = items.map((item) => {
      const key = Number(item.product_variant_id ?? item.product_id);
      const poItem = poItemByVariantId.get(key) || poItemByProductId.get(key);
      const qtyReceived = Number(item.qty_received);
      const qtyDamaged = Number(item.qty_damaged || 0);
      const qtyAccepted = Math.max(0, qtyReceived - qtyDamaged);

      return repo.create({
        GoodsReceiptID: Number(grId),
        PurchaseOrderDetailID: Number(poItem.PurchaseOrderDetailID),
        ReceivedQuantity: qtyReceived,
        AcceptedQuantity: qtyAccepted,
        RejectedQuantity: qtyDamaged,
        BatchNumber: item.batch_code,
        ExpiryDate: item.expiry_date || null,
      });
    });

    const saved = await repo.save(entities);
    return saved.map((row, idx) => {
      const key = Number(items[idx].product_variant_id ?? items[idx].product_id);
      const poItem = poItemByVariantId.get(key) || poItemByProductId.get(key);
      return {
        ...row,
        ProductVariantID: Number(poItem.ProductVariantID),
        ProductID: Number(poItem.ProductID),
        UnitCost: Number(poItem.UnitCost),
      };
    });
  }

  async bulkCreateInventoryBatches(batchesData, queryRunner) {
    if (!batchesData || batchesData.length === 0) return [];
    const repo = this.getManager(queryRunner).getRepository(InventoryBatchEntity);
    const entities = batchesData.map((data) =>
      repo.create({
        ProductVariantID: Number(data.product_variant_id),
        GoodsReceiptDetailID: data.receipt_item_id ? Number(data.receipt_item_id) : null,
        BatchNumber: data.batch_code,
        ExpiryDate: data.expiry_date || null,
        ReceivedQuantity: Number(data.quantity),
        RemainingQuantity: Number(data.quantity),
        UnitCost: data.import_price !== undefined ? Number(data.import_price) : null,
        BatchStatus: 'Active',
      })
    );
    return await repo.save(entities);
  }

  async bulkCreateStockMovements(movementsData, queryRunner) {
    if (!movementsData || movementsData.length === 0) return [];
    const repo = this.getManager(queryRunner).getRepository(StockMovementEntity);
    const entities = movementsData.map((data) =>
      repo.create({
        ProductVariantID: Number(data.product_variant_id),
        InventoryBatchID: data.batch_id ? Number(data.batch_id) : null,
        TransactionType: data.transaction_type,
        QuantityChange: Number(data.quantity_change),
        ReferenceType: data.reference_type || null,
        ReferenceID: data.reference_id ? Number(data.reference_id) : null,
        Notes: data.notes || null,
        CreatedByUserID: Number(data.created_by),
      })
    );
    return await repo.save(entities);
  }

  async incrementVariantStock(productVariantId, deltaQty, queryRunner) {
    const manager = this.getManager(queryRunner);
    await manager.query(
      `UPDATE dbo.ProductVariants
       SET StockQuantity = StockQuantity + @0
       WHERE ProductVariantID = @1`,
      [Number(deltaQty), Number(productVariantId)]
    );
  }

  async getCumulativeReceivedByPoId(poId, queryRunner) {
    const manager = this.getManager(queryRunner);
    return await manager.query(
      `SELECT pod.ProductVariantID, SUM(grd.AcceptedQuantity) AS TotalAccepted
       FROM dbo.GoodsReceiptDetails grd
       INNER JOIN dbo.GoodsReceipts gr ON gr.GoodsReceiptID = grd.GoodsReceiptID
       INNER JOIN dbo.PurchaseOrderDetails pod ON pod.PurchaseOrderDetailID = grd.PurchaseOrderDetailID
       WHERE gr.PurchaseOrderID = @0
       GROUP BY pod.ProductVariantID`,
      [Number(poId)]
    );
  }

  async findGoodsReceiptItemsByGrIds(grIds, queryRunner = null) {
    if (!grIds || grIds.length === 0) return [];
    const manager = this.getManager(queryRunner);
    return await manager
      .createQueryBuilder()
      .select([
        'grd.GoodsReceiptDetailID AS GoodsReceiptDetailID',
        'grd.GoodsReceiptID AS GoodsReceiptID',
        'grd.PurchaseOrderDetailID AS PurchaseOrderDetailID',
        'grd.ReceivedQuantity AS ReceivedQuantity',
        'grd.AcceptedQuantity AS AcceptedQuantity',
        'grd.RejectedQuantity AS RejectedQuantity',
        'grd.BatchNumber AS BatchNumber',
        'grd.ExpiryDate AS ExpiryDate',
        'pod.ProductVariantID AS ProductVariantID',
        'pod.UnitCost AS UnitCost',
        'pv.ProductID AS ProductID',
        'pv.SKU AS SKU',
        'p.ProductName AS ProductName',
      ])
      .from(GoodsReceiptItemEntity, 'grd')
      .innerJoin(
        PurchaseOrderItemEntity,
        'pod',
        'pod.PurchaseOrderDetailID = grd.PurchaseOrderDetailID'
      )
      .innerJoin(ProductVariantEntity, 'pv', 'pv.ProductVariantID = pod.ProductVariantID')
      .innerJoin(ProductEntity, 'p', 'p.ProductID = pv.ProductID')
      .where('grd.GoodsReceiptID IN (:...grIds)', { grIds: grIds.map(Number) })
      .orderBy('grd.GoodsReceiptDetailID', 'ASC')
      .getRawMany();
  }

  async findGoodsReceiptById(grId, queryRunner = null) {
    const manager = this.getManager(queryRunner);
    const gr = await manager.getRepository(GoodsReceiptEntity).findOne({
      where: { GoodsReceiptID: Number(grId) },
    });
    if (!gr) return null;

    const items = await this.findGoodsReceiptItemsByGrIds([gr.GoodsReceiptID], queryRunner);
    return { ...gr, items };
  }

  async findGoodsReceipts({ po_id, page = 1, limit = 20 }) {
    const qb = this.dataSource.getRepository(GoodsReceiptEntity).createQueryBuilder('gr');
    if (po_id) {
      qb.andWhere('gr.PurchaseOrderID = :poId', { poId: Number(po_id) });
    }

    const total = await qb.getCount();
    const receipts = await qb
      .orderBy('gr.ReceivedAt', 'DESC')
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .getMany();

    if (receipts.length === 0) {
      return { items: [], total, page: Number(page), limit: Number(limit) };
    }

    const grIds = receipts.map((r) => Number(r.GoodsReceiptID));
    const allItems = await this.findGoodsReceiptItemsByGrIds(grIds);

    const itemsByGrId = new Map();
    for (const item of allItems) {
      const key = Number(item.GoodsReceiptID);
      const list = itemsByGrId.get(key) || [];
      list.push(item);
      itemsByGrId.set(key, list);
    }

    const enriched = receipts.map((gr) => ({
      ...gr,
      items: itemsByGrId.get(Number(gr.GoodsReceiptID)) || [],
    }));

    return { items: enriched, total, page: Number(page), limit: Number(limit) };
  }

  async findInventoryBatches({ product_id, product_variant_id, expiring_within_days, page = 1, limit = 20 }) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'ib.InventoryBatchID AS InventoryBatchID',
        'ib.ProductVariantID AS ProductVariantID',
        'pv.ProductID AS ProductID',
        'p.ProductName AS ProductName',
        'pv.VariantName AS VariantName',
        'pv.SKU AS SKU',
        'ib.BatchNumber AS BatchNumber',
        'ib.GoodsReceiptDetailID AS GoodsReceiptDetailID',
        'ib.ReceivedQuantity AS ReceivedQuantity',
        'ib.RemainingQuantity AS RemainingQuantity',
        'ib.UnitCost AS UnitCost',
        'ib.ExpiryDate AS ExpiryDate',
        'ib.CreatedAt AS CreatedAt',
        'ib.BatchStatus AS BatchStatus',
      ])
      .from(InventoryBatchEntity, 'ib')
      .innerJoin(ProductVariantEntity, 'pv', 'pv.ProductVariantID = ib.ProductVariantID')
      .innerJoin(ProductEntity, 'p', 'p.ProductID = pv.ProductID')
      .where("ib.BatchStatus = N'Active' AND ib.RemainingQuantity > 0");

    if (product_variant_id) {
      qb.andWhere('ib.ProductVariantID = :variantId', { variantId: Number(product_variant_id) });
    } else if (product_id) {
      qb.andWhere('(pv.ProductID = :productId OR ib.ProductVariantID = :productId)', {
        productId: Number(product_id),
      });
    }

    if (expiring_within_days) {
      const targetDate = new Date();
      targetDate.setUTCDate(targetDate.getUTCDate() + Number(expiring_within_days));
      const targetStr = targetDate.toISOString().slice(0, 10);
      qb.andWhere('ib.ExpiryDate IS NOT NULL AND ib.ExpiryDate <= :targetStr', { targetStr });
    }

    const total = await qb.getCount();
    const items = await qb
      .orderBy('CASE WHEN ib.ExpiryDate IS NULL THEN 1 ELSE 0 END', 'ASC')
      .addOrderBy('ib.ExpiryDate', 'ASC')
      .addOrderBy('ib.InventoryBatchID', 'ASC')
      .offset((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .getRawMany();

    return { items, total, page: Number(page), limit: Number(limit) };
  }

  async findBatchByIdForUpdate(batchId, queryRunner) {
    const rows = await queryRunner.manager.query(
      `SELECT ib.InventoryBatchID, ib.ProductVariantID, pv.ProductID, ib.BatchNumber,
              ib.RemainingQuantity, ib.ExpiryDate, ib.BatchStatus
       FROM dbo.InventoryBatches ib WITH (UPDLOCK, ROWLOCK)
       INNER JOIN dbo.ProductVariants pv ON pv.ProductVariantID = ib.ProductVariantID
       WHERE ib.InventoryBatchID = @0`,
      [Number(batchId)]
    );
    return rows[0] || null;
  }

  async findAvailableBatchesForFefoWithLock(productVariantId, queryRunner) {
    const todayStr = new Date().toISOString().slice(0, 10);
    return await queryRunner.manager.query(
      `SELECT InventoryBatchID, ProductVariantID, BatchNumber, RemainingQuantity, ExpiryDate
       FROM dbo.InventoryBatches WITH (UPDLOCK, ROWLOCK)
       WHERE ProductVariantID = @0
         AND BatchStatus = N'Active'
         AND RemainingQuantity > 0
         AND (ExpiryDate IS NULL OR ExpiryDate >= @1)
       ORDER BY
         CASE WHEN ExpiryDate IS NULL THEN 1 ELSE 0 END ASC,
         ExpiryDate ASC,
         InventoryBatchID ASC`,
      [Number(productVariantId), todayStr]
    );
  }

  async updateBatchRemainingQty(batchId, newRemainingQty, queryRunner) {
    await queryRunner.manager.query(
      `UPDATE dbo.InventoryBatches
       SET RemainingQuantity = @0,
           BatchStatus = CASE WHEN @0 = 0 THEN N'Depleted' ELSE N'Active' END
       WHERE InventoryBatchID = @1`,
      [Number(newRemainingQty), Number(batchId)]
    );
  }
}

const defaultInventoryRepository = new InventoryRepository(AppDataSource);

export { defaultInventoryRepository, InventoryRepository, toAppPoStatus, toDbPoStatus };
export default defaultInventoryRepository;
