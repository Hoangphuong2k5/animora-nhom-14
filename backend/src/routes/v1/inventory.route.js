import express from 'express';
import inventoryController from '../../controllers/inventory.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createSupplierSchema,
  updateSupplierSchema,
  lockSupplierSchema,
  supplierQuerySchema,
  upsertSupplierPriceSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
  supplierRespondPoSchema,
  supplierShippingStatusSchema,
  poQuerySchema,
  createGoodsReceiptSchema,
  batchQuerySchema,
  adjustInventorySchema,
  allocateFefoSchema,
} from '../../validators/inventory.validator.js';

const router = express.Router();

// ==================== SUP-01 / SUP-02 / SUP-03: SUPPLIERS ====================
router.get(
  '/suppliers',
  authenticate,
  authorize('admin', 'warehouse'),
  validate(supplierQuerySchema, 'query'),
  inventoryController.listSuppliers
);

router.get(
  '/suppliers/:id',
  authenticate,
  authorize('admin', 'warehouse', 'supplier'),
  inventoryController.getSupplierById
);

router.post(
  '/suppliers',
  authenticate,
  authorize('admin'),
  validate(createSupplierSchema),
  inventoryController.createSupplier
);

router.put(
  '/suppliers/:id',
  authenticate,
  authorize('admin', 'supplier'),
  validate(updateSupplierSchema),
  inventoryController.updateSupplier
);

router.patch(
  '/suppliers/:id/status',
  authenticate,
  authorize('admin'),
  validate(lockSupplierSchema),
  inventoryController.lockOrUnlockSupplier
);

// SUP-03: Supplier Quoted Prices
router.get(
  '/suppliers/:id/prices',
  authenticate,
  authorize('admin', 'warehouse', 'supplier'),
  inventoryController.getSupplierPrices
);

router.put(
  '/suppliers/:id/prices',
  authenticate,
  authorize('admin', 'supplier'),
  validate(upsertSupplierPriceSchema),
  inventoryController.upsertSupplierPrice
);

// ==================== PUR-01..04: PURCHASE ORDERS ====================
router.get(
  '/purchase-orders',
  authenticate,
  authorize('admin', 'warehouse', 'supplier'),
  validate(poQuerySchema, 'query'),
  inventoryController.listPurchaseOrders
);

router.get(
  '/purchase-orders/:id',
  authenticate,
  authorize('admin', 'warehouse', 'supplier'),
  inventoryController.getPurchaseOrderById
);

router.post(
  '/purchase-orders',
  authenticate,
  authorize('admin', 'warehouse'),
  validate(createPurchaseOrderSchema),
  inventoryController.createPurchaseOrder
);

router.patch(
  '/purchase-orders/:id/status',
  authenticate,
  authorize('admin', 'warehouse', 'supplier'),
  validate(updatePurchaseOrderStatusSchema),
  inventoryController.updatePurchaseOrderStatus
);

// PUR-02: Supplier confirm or reject PO
router.patch(
  '/purchase-orders/:id/respond',
  authenticate,
  authorize('supplier', 'admin'),
  validate(supplierRespondPoSchema),
  inventoryController.supplierRespondPurchaseOrder
);

// PUR-03: Supplier update delivery status to shipping
router.patch(
  '/purchase-orders/:id/shipping',
  authenticate,
  authorize('supplier', 'admin'),
  validate(supplierShippingStatusSchema),
  inventoryController.supplierUpdateShippingStatus
);

// ==================== INV-01 / INV-02: GOODS RECEIPTS ====================
router.get(
  '/goods-receipts',
  authenticate,
  authorize('admin', 'warehouse'),
  inventoryController.listGoodsReceipts
);

router.post(
  '/goods-receipts',
  authenticate,
  authorize('admin', 'warehouse'),
  validate(createGoodsReceiptSchema),
  inventoryController.createGoodsReceipt
);

// ==================== INV-03 / INV-04: ADJUSTMENTS, BATCHES & FEFO ====================
router.post(
  '/adjustments',
  authenticate,
  authorize('admin', 'warehouse'),
  validate(adjustInventorySchema),
  inventoryController.adjustInventory
);

router.get(
  '/batches',
  authenticate,
  authorize('admin', 'warehouse'),
  validate(batchQuerySchema, 'query'),
  inventoryController.listInventoryBatches
);

router.post(
  '/batches/allocate-fefo',
  authenticate,
  authorize('admin', 'warehouse'),
  validate(allocateFefoSchema),
  inventoryController.allocateStockFefo
);

export default router;
