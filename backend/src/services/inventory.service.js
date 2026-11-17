import { AppDataSource } from '../config/data-source.js';
import defaultInventoryRepository, { toAppPoStatus } from '../repositories/inventory.repository.js';
import { AppError } from '../utils/apiResponse.js';
import { cacheService } from '../utils/cache.service.js';
import {
  toSupplierDTO as toSupplierDto,
  toSupplierPriceDTO as toSupplierPriceDto,
  toPurchaseOrderDTO as toPurchaseOrderDto,
  toGoodsReceiptDTO as toGoodsReceiptDto,
  toInventoryBatchDTO as toInventoryBatchDto,
} from '../dtos/inventory.dto.js';

const ALLOWED_PO_TRANSITIONS = Object.freeze({
  draft: ['sent', 'cancelled'],
  sent: ['confirmed', 'accepted', 'rejected', 'cancelled'],
  confirmed: ['shipping', 'partially_received', 'received', 'cancelled'],
  accepted: ['shipping', 'partially_received', 'received', 'cancelled'],
  shipping: ['partially_received', 'received'],
  partially_received: ['received'],
  rejected: [],
  received: [],
  cancelled: [],
});

/**
 * InventoryService ánh xạ với AnimoraDB_Complete_ver1_5_Clean.sql
 */
class InventoryService {
  constructor(
    inventoryRepository = defaultInventoryRepository,
    dataSource = AppDataSource,
    cache = cacheService
  ) {
    this.inventoryRepository = inventoryRepository;
    this.dataSource = dataSource;
    this.cache = cache;
  }

  // ==================== SUP-01 / SUP-02 / SUP-03: SUPPLIER MANAGEMENT ====================

  async createSupplier(payload) {
    const supplier = await this.inventoryRepository.createSupplier(payload);
    this.cache.emitInvalidation('suppliers:');
    return toSupplierDto(supplier);
  }

  async updateSupplier(supplierId, payload, currentUser = null) {
    const existing = await this.inventoryRepository.findSupplierById(supplierId);
    if (!existing) {
      throw new AppError('Không tìm thấy nhà cung cấp', 404, 'SUPPLIER_NOT_FOUND');
    }
    this.verifySupplierOwnershipIfSupplierRole(existing, currentUser);

    const updated = await this.inventoryRepository.updateSupplier(supplierId, payload);
    this.cache.emitInvalidation('suppliers:');
    return toSupplierDto(updated);
  }

  async updateSupplierStatus(supplierId, status) {
    const existing = await this.inventoryRepository.findSupplierById(supplierId);
    if (!existing) {
      throw new AppError('Không tìm thấy nhà cung cấp', 404, 'SUPPLIER_NOT_FOUND');
    }
    const updated = await this.inventoryRepository.updateSupplier(supplierId, { status });
    this.cache.emitInvalidation('suppliers:');
    return toSupplierDto(updated);
  }

  async listSuppliers(query) {
    const result = await this.inventoryRepository.findSuppliers(query);
    return {
      ...result,
      items: result.items.map(toSupplierDto),
    };
  }

  async getSupplierById(supplierId) {
    const supplier = await this.inventoryRepository.findSupplierById(supplierId);
    if (!supplier) {
      throw new AppError('Không tìm thấy nhà cung cấp', 404, 'SUPPLIER_NOT_FOUND');
    }
    return toSupplierDto(supplier);
  }

  async upsertSupplierPrice(supplierId, payload, currentUser) {
    const supplier = await this.inventoryRepository.findSupplierById(supplierId);
    if (!supplier) {
      throw new AppError('Không tìm thấy nhà cung cấp', 404, 'SUPPLIER_NOT_FOUND');
    }
    this.verifySupplierOwnershipIfSupplierRole(supplier, currentUser);

    const targetId = payload.product_variant_id ?? payload.product_id;
    const variants = await this.inventoryRepository.findProductsByIds([targetId]);
    if (variants.length === 0) {
      throw new AppError('Sản phẩm / biến thể không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    }

    const row = await this.inventoryRepository.upsertSupplierPrice(
      supplierId,
      variants[0].ProductVariantID,
      payload.price,
      payload.supplier_sku || null
    );
    return toSupplierPriceDto(row);
  }

  async getSupplierPrices(supplierId) {
    const supplier = await this.inventoryRepository.findSupplierById(supplierId);
    if (!supplier) {
      throw new AppError('Không tìm thấy nhà cung cấp', 404, 'SUPPLIER_NOT_FOUND');
    }
    const rows = await this.inventoryRepository.findSupplierPrices(supplierId);
    return rows.map(toSupplierPriceDto);
  }

  verifySupplierOwnershipIfSupplierRole(supplier, currentUser) {
    if (
      currentUser &&
      (currentUser.role === 'supplier' || currentUser.dbRole === 'Supplier') &&
      Number(supplier.UserID ?? supplier.user_id) !== Number(currentUser.id)
    ) {
      throw new AppError(
        'Bạn không có quyền thao tác trên nhà cung cấp khác (ABAC Violation)',
        403,
        'FORBIDDEN_SUPPLIER_OWNERSHIP'
      );
    }
  }

  // ==================== PUR-01..04: PURCHASE ORDERS ====================

  async createPurchaseOrder(createdByUserId, payload) {
    const supplier = await this.inventoryRepository.findSupplierById(payload.supplier_id);
    if (!supplier) {
      throw new AppError('Nhà cung cấp không tồn tại', 404, 'SUPPLIER_NOT_FOUND');
    }
    if (!supplier.IsActive) {
      throw new AppError(
        'Nhà cung cấp đang bị khóa, không thể tạo đơn đặt hàng (PO)',
        400,
        'SUPPLIER_LOCKED'
      );
    }

    const resolvedItems = [];
    for (const item of payload.items) {
      const targetId = item.product_variant_id ?? item.product_id;
      const variant = await this.inventoryRepository.resolveVariant(targetId);
      if (!variant) {
        throw new AppError(
          `Sản phẩm / biến thể #${targetId} không tồn tại`,
          400,
          'PRODUCT_NOT_FOUND'
        );
      }
      resolvedItems.push({
        ...item,
        product_variant_id: Number(variant.ProductVariantID),
      });
    }

    const totalAmount = resolvedItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const poHeader = await this.inventoryRepository.createPurchaseOrderHeader(
        {
          supplier_id: payload.supplier_id,
          created_by: createdByUserId,
          status: payload.status || 'sent',
          expected_date: payload.expected_date || null,
          note: payload.note || null,
          total: Math.round(totalAmount * 100) / 100,
        },
        queryRunner
      );

      const poId = Number(poHeader.PurchaseOrderID ?? poHeader.id);
      await this.inventoryRepository.bulkInsertPurchaseOrderItems(
        poId,
        resolvedItems,
        queryRunner
      );

      await queryRunner.commitTransaction();
      const created = await this.inventoryRepository.findPurchaseOrderById(poId);
      return toPurchaseOrderDto(created);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPurchaseOrderById(poId) {
    const po = await this.inventoryRepository.findPurchaseOrderById(poId);
    if (!po) {
      throw new AppError('Không tìm thấy đơn đặt hàng (PO)', 404, 'PO_NOT_FOUND');
    }
    return toPurchaseOrderDto(po);
  }

  async listPurchaseOrders(query) {
    const result = await this.inventoryRepository.findPurchaseOrders(query);
    return {
      ...result,
      items: result.items.map(toPurchaseOrderDto),
    };
  }

  async updatePurchaseOrderStatus(poId, newStatus, currentUser = null) {
    const po = await this.inventoryRepository.findPurchaseOrderById(poId);
    if (!po) {
      throw new AppError('Không tìm thấy đơn đặt hàng (PO)', 404, 'PO_NOT_FOUND');
    }

    if (currentUser && (currentUser.role === 'supplier' || currentUser.dbRole === 'Supplier')) {
      const supplier = await this.inventoryRepository.findSupplierById(po.SupplierID);
      this.verifySupplierOwnershipIfSupplierRole(supplier, currentUser);
    }

    const currentAppStatus = toAppPoStatus(po.PurchaseOrderStatus);
    const allowedNext = ALLOWED_PO_TRANSITIONS[currentAppStatus] || [];
    if (!allowedNext.includes(String(newStatus).toLowerCase())) {
      throw new AppError(
        `Không thể chuyển trạng thái PO từ '${currentAppStatus}' sang '${newStatus}'`,
        400,
        'INVALID_PO_STATUS_TRANSITION'
      );
    }

    const updated = await this.inventoryRepository.updatePurchaseOrderStatus(
      poId,
      newStatus,
      currentUser?.id || null
    );
    return toPurchaseOrderDto(updated);
  }

  // ==================== INV-01 / INV-02: GOODS RECEIPT & BATCH CREATION ====================

  async createGoodsReceipt(receivedByUserId, payload) {
    const po = await this.inventoryRepository.findPurchaseOrderById(payload.po_id);
    if (!po) {
      throw new AppError('Không tìm thấy đơn đặt hàng (PO)', 404, 'PO_NOT_FOUND');
    }

    this.validatePoReceivableStatus(po);
    this.validateGrItemsAgainstPo(po, payload.items);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const grHeader = await this.inventoryRepository.createGoodsReceiptHeader(
        { po_id: payload.po_id, received_by: receivedByUserId, note: payload.note },
        queryRunner
      );

      const grId = Number(grHeader.GoodsReceiptID ?? grHeader.id);
      const savedGrItems = await this.inventoryRepository.bulkCreateGoodsReceiptItems(
        grId,
        payload.po_id,
        payload.items,
        queryRunner
      );

      await this.processBatchesAndStockForGr(grId, savedGrItems, receivedByUserId, queryRunner);
      const newPoStatus = await this.resolvePoReceiptStatus(po, queryRunner);
      await this.inventoryRepository.updatePurchaseOrderStatus(
        po.PurchaseOrderID,
        newPoStatus,
        receivedByUserId,
        queryRunner
      );

      await queryRunner.commitTransaction();
      const createdGr = await this.inventoryRepository.findGoodsReceiptById(grId);
      return toGoodsReceiptDto(createdGr, newPoStatus);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  validatePoReceivableStatus(po) {
    const appStatus = toAppPoStatus(po.PurchaseOrderStatus);
    const receivableStatuses = ['sent', 'confirmed', 'shipping', 'partially_received'];
    if (!receivableStatuses.includes(appStatus)) {
      throw new AppError(
        `PO đang ở trạng thái '${appStatus}', không thể tạo phiếu nhập kho (GR)`,
        400,
        'PO_NOT_RECEIVABLE'
      );
    }
  }

  validateGrItemsAgainstPo(po, items) {
    const variantSet = new Set(po.items.map((i) => Number(i.ProductVariantID)));
    const productSet = new Set(po.items.map((i) => Number(i.ProductID)));

    for (const item of items) {
      const targetId = Number(item.product_variant_id ?? item.product_id);
      if (!variantSet.has(targetId) && !productSet.has(targetId)) {
        throw new AppError(
          `Sản phẩm #${targetId} không nằm trong đơn đặt hàng PO #${po.PurchaseOrderID}`,
          400,
          'PRODUCT_NOT_IN_PO'
        );
      }
    }
  }

  async processBatchesAndStockForGr(grId, savedGrItems, receivedByUserId, queryRunner) {
    const usableItems = savedGrItems.filter((item) => Number(item.AcceptedQuantity) > 0);
    if (usableItems.length === 0) return;

    const batchesPayload = usableItems.map((item) => ({
      product_variant_id: item.ProductVariantID,
      batch_code: item.BatchNumber,
      receipt_item_id: item.GoodsReceiptDetailID,
      quantity: Number(item.AcceptedQuantity),
      import_price: item.UnitCost,
      expiry_date: item.ExpiryDate || null,
    }));

    const createdBatches = await this.inventoryRepository.bulkCreateInventoryBatches(
      batchesPayload,
      queryRunner
    );

    const movementsPayload = createdBatches.map((batch) => ({
      product_variant_id: Number(batch.ProductVariantID),
      batch_id: Number(batch.InventoryBatchID),
      transaction_type: 'Import',
      quantity_change: Number(batch.ReceivedQuantity),
      reference_type: 'GoodsReceipt',
      reference_id: grId,
      created_by: receivedByUserId,
    }));

    await this.inventoryRepository.bulkCreateStockMovements(movementsPayload, queryRunner);

    for (const batch of createdBatches) {
      await this.inventoryRepository.incrementVariantStock(
        batch.ProductVariantID,
        batch.ReceivedQuantity,
        queryRunner
      );
    }
  }

  async resolvePoReceiptStatus(po, queryRunner) {
    const cumulativeRows = await this.inventoryRepository.getCumulativeReceivedByPoId(
      po.PurchaseOrderID,
      queryRunner
    );
    const receivedMap = new Map(
      cumulativeRows.map((r) => [Number(r.ProductVariantID), Number(r.TotalAccepted)])
    );

    const isFullyReceived = po.items.every(
      (poItem) => (receivedMap.get(Number(poItem.ProductVariantID)) || 0) >= Number(poItem.Quantity)
    );
    return isFullyReceived ? 'received' : 'partially_received';
  }

  async listGoodsReceipts(query) {
    const result = await this.inventoryRepository.findGoodsReceipts(query);
    return {
      ...result,
      items: result.items.map((gr) => toGoodsReceiptDto(gr)),
    };
  }

  // ==================== INV-03: INVENTORY ADJUSTMENT ====================

  async adjustInventory(adjustedByUserId, payload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lockedBatch = await this.inventoryRepository.findBatchByIdForUpdate(
        payload.batch_id,
        queryRunner
      );

      const requestedId = Number(payload.product_variant_id ?? payload.product_id);
      if (
        !lockedBatch ||
        (Number(lockedBatch.ProductVariantID) !== requestedId &&
          Number(lockedBatch.ProductID) !== requestedId)
      ) {
        throw new AppError(
          'Không tìm thấy lô hàng (batch) khớp với sản phẩm yêu cầu',
          404,
          'BATCH_NOT_FOUND'
        );
      }

      const newRemaining = Number(lockedBatch.RemainingQuantity) + Number(payload.change_qty);
      if (newRemaining < 0) {
        throw new AppError(
          `Số lượng tồn trong lô '${lockedBatch.BatchNumber}' (${lockedBatch.RemainingQuantity}) không đủ để giảm ${Math.abs(payload.change_qty)}`,
          400,
          'INSUFFICIENT_BATCH_STOCK'
        );
      }

      await this.inventoryRepository.updateBatchRemainingQty(
        lockedBatch.InventoryBatchID,
        newRemaining,
        queryRunner
      );
      await this.inventoryRepository.incrementVariantStock(
        lockedBatch.ProductVariantID,
        payload.change_qty,
        queryRunner
      );

      const [movement] = await this.inventoryRepository.bulkCreateStockMovements(
        [
          {
            product_variant_id: Number(lockedBatch.ProductVariantID),
            batch_id: Number(lockedBatch.InventoryBatchID),
            transaction_type: 'Adjustment',
            quantity_change: Number(payload.change_qty),
            reference_type: 'ManualAdjustment',
            reference_id: null,
            notes: payload.reason,
            created_by: adjustedByUserId,
          },
        ],
        queryRunner
      );

      await queryRunner.commitTransaction();
      return {
        adjustment_id: Number(movement.InventoryTransactionID),
        product_variant_id: Number(lockedBatch.ProductVariantID),
        product_id: Number(lockedBatch.ProductID),
        batch_id: Number(lockedBatch.InventoryBatchID),
        batch_code: lockedBatch.BatchNumber,
        previous_remaining_qty: Number(lockedBatch.RemainingQuantity),
        change_qty: Number(payload.change_qty),
        new_remaining_qty: newRemaining,
        reason: payload.reason,
        created_at: movement.CreatedAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== INV-04: FEFO BATCH LISTING & STOCK ALLOCATION ====================

  async listInventoryBatches(query) {
    const result = await this.inventoryRepository.findInventoryBatches(query);
    return {
      ...result,
      items: result.items.map(toInventoryBatchDto),
    };
  }

  async allocateStockFefo(payload, actorUserId = 1) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const allocations = [];
      for (const reqItem of payload.items) {
        const targetId = reqItem.product_variant_id ?? reqItem.product_id;
        const variant = await this.inventoryRepository.resolveVariant(targetId, queryRunner);
        if (!variant) {
          throw new AppError(`Không tìm thấy biến thể sản phẩm #${targetId}`, 404, 'PRODUCT_NOT_FOUND');
        }
        const itemAllocations = await this.allocateSingleVariantFefo(
          Number(variant.ProductVariantID),
          Number(reqItem.quantity),
          payload.order_id,
          actorUserId,
          queryRunner
        );
        allocations.push(...itemAllocations);
      }

      await queryRunner.commitTransaction();
      return { order_id: payload.order_id || null, allocations };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async allocateSingleVariantFefo(productVariantId, quantity, orderId, actorUserId, queryRunner) {
    let remainingToDeduct = Number(quantity);

    const batches = await this.inventoryRepository.findAvailableBatchesForFefoWithLock(
      productVariantId,
      queryRunner
    );
    const totalAvailable = batches.reduce((sum, b) => sum + Number(b.RemainingQuantity), 0);

    if (totalAvailable < remainingToDeduct) {
      throw new AppError(
        `Biến thể #${productVariantId} không đủ tồn kho khả dụng (cần ${remainingToDeduct}, còn ${totalAvailable})`,
        409,
        'INSUFFICIENT_FEFO_STOCK'
      );
    }

    const allocations = [];
    const movementsPayload = [];

    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;
      const takeQty = Math.min(Number(batch.RemainingQuantity), remainingToDeduct);
      const newRemaining = Number(batch.RemainingQuantity) - takeQty;

      await this.inventoryRepository.updateBatchRemainingQty(
        batch.InventoryBatchID,
        newRemaining,
        queryRunner
      );
      movementsPayload.push({
        product_variant_id: productVariantId,
        batch_id: Number(batch.InventoryBatchID),
        transaction_type: 'Sale',
        quantity_change: -takeQty,
        reference_type: orderId ? 'Order' : 'FefoAllocation',
        reference_id: orderId || null,
        created_by: actorUserId,
      });

      allocations.push({
        product_variant_id: productVariantId,
        batch_id: Number(batch.InventoryBatchID),
        batch_code: batch.BatchNumber,
        expiry_date: batch.ExpiryDate,
        deducted_qty: takeQty,
        remaining_in_batch: newRemaining,
      });
      remainingToDeduct -= takeQty;
    }

    await this.inventoryRepository.bulkCreateStockMovements(movementsPayload, queryRunner);
    await this.inventoryRepository.incrementVariantStock(
      productVariantId,
      -Number(quantity),
      queryRunner
    );

    return allocations;
  }
}

const defaultInventoryService = new InventoryService();

export { defaultInventoryService, InventoryService };
export default defaultInventoryService;
