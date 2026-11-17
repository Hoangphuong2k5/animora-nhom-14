import { EntitySchema } from 'typeorm';

/**
 * Entities phân hệ Nhà cung cấp / Sản phẩm / PO / Kho - ánh xạ với AnimoraDB_Complete_ver1_5_Clean.sql
 */
const SupplierEntity = new EntitySchema({
  name: 'Supplier',
  tableName: 'SupplierProfiles',
  columns: {
    SupplierID: { type: 'bigint', primary: true, generated: 'increment' },
    UserID: { type: 'bigint', unique: true, nullable: false },
    SupplierName: { type: 'nvarchar', length: 200, nullable: false },
    ContactPerson: { type: 'nvarchar', length: 150, nullable: true },
    PhoneNumber: { type: 'nvarchar', length: 20, nullable: true },
    Email: { type: 'nvarchar', length: 255, nullable: true },
    Address: { type: 'nvarchar', length: 500, nullable: true },
    TaxCode: { type: 'nvarchar', length: 50, nullable: true },
    IsActive: { type: 'bit', default: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const SupplierProductEntity = new EntitySchema({
  name: 'SupplierProduct',
  tableName: 'SupplierProducts',
  columns: {
    SupplierProductID: { type: 'bigint', primary: true, generated: 'increment' },
    SupplierID: { type: 'bigint', nullable: false },
    ProductVariantID: { type: 'bigint', nullable: false },
    SupplierSKU: { type: 'nvarchar', length: 100, nullable: true },
    SupplierUnitPrice: { type: 'decimal', precision: 18, scale: 2, nullable: true },
    IsPreferredSupplier: { type: 'bit', default: false },
    AvailabilityStatus: { type: 'nvarchar', length: 20, default: 'Available' },
    AvailabilityUpdatedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const ProductCategoryEntity = new EntitySchema({
  name: 'ProductCategory',
  tableName: 'ProductCategories',
  columns: {
    ProductCategoryID: { type: 'int', primary: true, generated: 'increment' },
    CategoryName: { type: 'nvarchar', length: 150, unique: true, nullable: false },
    Description: { type: 'nvarchar', length: 500, nullable: true },
    IsActive: { type: 'bit', default: true },
  },
});

const ProductEntity = new EntitySchema({
  name: 'Product',
  tableName: 'Products',
  columns: {
    ProductID: { type: 'bigint', primary: true, generated: 'increment' },
    ProductCategoryID: { type: 'int', nullable: false },
    ProductName: { type: 'nvarchar', length: 250, nullable: false },
    Description: { type: 'nvarchar', length: 'MAX', nullable: true },
    BrandName: { type: 'nvarchar', length: 150, nullable: true },
    IsPrescriptionOnly: { type: 'bit', default: false },
    ProductStatus: { type: 'nvarchar', length: 30, default: 'Active' },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
    UpdatedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const ProductVariantEntity = new EntitySchema({
  name: 'ProductVariant',
  tableName: 'ProductVariants',
  columns: {
    ProductVariantID: { type: 'bigint', primary: true, generated: 'increment' },
    ProductID: { type: 'bigint', nullable: false },
    SKU: { type: 'nvarchar', length: 100, unique: true, nullable: false },
    VariantName: { type: 'nvarchar', length: 200, nullable: false },
    VariantAttributes: { type: 'nvarchar', length: 1000, nullable: true },
    UnitPrice: { type: 'decimal', precision: 18, scale: 2, nullable: false },
    CostPrice: { type: 'decimal', precision: 18, scale: 2, nullable: true },
    StockQuantity: { type: 'int', default: 0 },
    ReservedQuantity: { type: 'int', default: 0 },
    ReorderLevel: { type: 'int', default: 0 },
    IsBatchTracked: { type: 'bit', default: false },
    IsActive: { type: 'bit', default: true },
  },
});

const PurchaseOrderEntity = new EntitySchema({
  name: 'PurchaseOrder',
  tableName: 'PurchaseOrders',
  columns: {
    PurchaseOrderID: { type: 'bigint', primary: true, generated: 'increment' },
    SupplierID: { type: 'bigint', nullable: false },
    PurchaseOrderCode: { type: 'nvarchar', length: 50, unique: true, nullable: false },
    CreatedByUserID: { type: 'bigint', nullable: false },
    PurchaseOrderStatus: { type: 'nvarchar', length: 30, default: 'Draft' },
    OrderedAt: { type: 'datetime2', precision: 0, createDate: true },
    ExpectedDeliveryAt: { type: 'datetime2', precision: 0, nullable: true },
    TotalAmount: { type: 'decimal', precision: 18, scale: 2, default: 0 },
    Notes: { type: 'nvarchar', length: 1000, nullable: true },
    SupplierRespondedAt: { type: 'datetime2', precision: 0, nullable: true },
    SupplierResponseNote: { type: 'nvarchar', length: 1000, nullable: true },
    HasSupplierAdjustment: { type: 'bit', default: false },
    ShippedAt: { type: 'datetime2', precision: 0, nullable: true },
    DeliveryReference: { type: 'nvarchar', length: 150, nullable: true },
    PaymentStatus: { type: 'nvarchar', length: 20, default: 'Unpaid' },
    PaymentDueDate: { type: 'date', nullable: true },
    PayableAmount: { type: 'decimal', precision: 18, scale: 2, nullable: true },
    SupplierReconciliationID: { type: 'bigint', nullable: true },
  },
});

const PurchaseOrderItemEntity = new EntitySchema({
  name: 'PurchaseOrderItem',
  tableName: 'PurchaseOrderDetails',
  columns: {
    PurchaseOrderDetailID: { type: 'bigint', primary: true, generated: 'increment' },
    PurchaseOrderID: { type: 'bigint', nullable: false },
    ProductVariantID: { type: 'bigint', nullable: false },
    Quantity: { type: 'int', nullable: false },
    ConfirmedQuantity: { type: 'int', nullable: true },
    UnitCost: { type: 'decimal', precision: 18, scale: 2, nullable: false },
    LineTotal: { type: 'decimal', precision: 18, scale: 2, nullable: false },
  },
});

const PurchaseOrderStatusHistoryEntity = new EntitySchema({
  name: 'PurchaseOrderStatusHistory',
  tableName: 'PurchaseOrderStatusHistory',
  columns: {
    PurchaseOrderStatusHistoryID: { type: 'bigint', primary: true, generated: 'increment' },
    PurchaseOrderID: { type: 'bigint', nullable: false },
    OldStatus: { type: 'nvarchar', length: 30, nullable: true },
    NewStatus: { type: 'nvarchar', length: 30, nullable: false },
    ChangedByUserID: { type: 'bigint', nullable: false },
    ChangeNote: { type: 'nvarchar', length: 1000, nullable: true },
    ChangedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const GoodsReceiptEntity = new EntitySchema({
  name: 'GoodsReceipt',
  tableName: 'GoodsReceipts',
  columns: {
    GoodsReceiptID: { type: 'bigint', primary: true, generated: 'increment' },
    PurchaseOrderID: { type: 'bigint', nullable: false },
    GoodsReceiptCode: { type: 'nvarchar', length: 50, unique: true, nullable: false },
    ReceivedByUserID: { type: 'bigint', nullable: false },
    ReceivedAt: { type: 'datetime2', precision: 0, createDate: true },
    ReceiptNote: { type: 'nvarchar', length: 1000, nullable: true },
  },
});

const GoodsReceiptItemEntity = new EntitySchema({
  name: 'GoodsReceiptItem',
  tableName: 'GoodsReceiptDetails',
  columns: {
    GoodsReceiptDetailID: { type: 'bigint', primary: true, generated: 'increment' },
    GoodsReceiptID: { type: 'bigint', nullable: false },
    PurchaseOrderDetailID: { type: 'bigint', nullable: false },
    ReceivedQuantity: { type: 'int', nullable: false },
    AcceptedQuantity: { type: 'int', nullable: false },
    RejectedQuantity: { type: 'int', default: 0 },
    BatchNumber: { type: 'nvarchar', length: 100, nullable: true },
    ManufacturedDate: { type: 'date', nullable: true },
    ExpiryDate: { type: 'date', nullable: true },
    Notes: { type: 'nvarchar', length: 500, nullable: true },
  },
});

const InventoryBatchEntity = new EntitySchema({
  name: 'InventoryBatch',
  tableName: 'InventoryBatches',
  columns: {
    InventoryBatchID: { type: 'bigint', primary: true, generated: 'increment' },
    ProductVariantID: { type: 'bigint', nullable: false },
    GoodsReceiptDetailID: { type: 'bigint', nullable: true },
    BatchNumber: { type: 'nvarchar', length: 100, nullable: false },
    ManufacturedDate: { type: 'date', nullable: true },
    ExpiryDate: { type: 'date', nullable: true },
    ReceivedQuantity: { type: 'int', nullable: false },
    RemainingQuantity: { type: 'int', nullable: false },
    UnitCost: { type: 'decimal', precision: 18, scale: 2, nullable: true },
    BatchStatus: { type: 'nvarchar', length: 20, default: 'Active' },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const StockMovementEntity = new EntitySchema({
  name: 'StockMovement',
  tableName: 'InventoryTransactions',
  columns: {
    InventoryTransactionID: { type: 'bigint', primary: true, generated: 'increment' },
    ProductVariantID: { type: 'bigint', nullable: false },
    InventoryBatchID: { type: 'bigint', nullable: true },
    TransactionType: { type: 'nvarchar', length: 30, nullable: false }, // Import | Sale | Return | Adjustment | Damage
    QuantityChange: { type: 'int', nullable: false },
    ReferenceType: { type: 'nvarchar', length: 50, nullable: true },
    ReferenceID: { type: 'bigint', nullable: true },
    Notes: { type: 'nvarchar', length: 1000, nullable: true },
    CreatedByUserID: { type: 'bigint', nullable: false },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

export {
  SupplierEntity,
  SupplierProductEntity,
  ProductCategoryEntity,
  ProductEntity,
  ProductVariantEntity,
  PurchaseOrderEntity,
  PurchaseOrderItemEntity,
  PurchaseOrderStatusHistoryEntity,
  GoodsReceiptEntity,
  GoodsReceiptItemEntity,
  InventoryBatchEntity,
  StockMovementEntity,
};
export default {
  SupplierEntity,
  SupplierProductEntity,
  ProductCategoryEntity,
  ProductEntity,
  ProductVariantEntity,
  PurchaseOrderEntity,
  PurchaseOrderItemEntity,
  PurchaseOrderStatusHistoryEntity,
  GoodsReceiptEntity,
  GoodsReceiptItemEntity,
  InventoryBatchEntity,
  StockMovementEntity,
};
