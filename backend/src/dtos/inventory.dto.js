/**
 * Strongly-Typed DTO & Explicit Mappers cho phân hệ Nhà cung cấp, Đơn nhập PO & Tồn kho (AnimoraDB ver 1.5)
 */
const toSupplierDTO = (supEntity) => {
  if (!supEntity) return null;
  const isActive = supEntity.IsActive !== undefined ? Boolean(supEntity.IsActive) : supEntity.status === 'active';
  return Object.freeze({
    id: Number(supEntity.SupplierID ?? supEntity.id),
    user_id: Number(supEntity.UserID ?? supEntity.user_id),
    company_name: String(supEntity.SupplierName ?? supEntity.company_name ?? ''),
    contact_name: supEntity.ContactPerson ?? supEntity.contact_name ?? null,
    phone: supEntity.PhoneNumber ?? supEntity.phone ?? null,
    email: supEntity.Email ?? supEntity.email ?? null,
    address: supEntity.Address ?? supEntity.address ?? null,
    tax_code: supEntity.TaxCode ?? supEntity.tax_code ?? null,
    status: isActive ? 'active' : 'locked',
    is_active: isActive,
  });
};

const toSupplierPriceDTO = (priceEntity) => {
  if (!priceEntity) return null;
  return Object.freeze({
    id: Number(priceEntity.SupplierProductID ?? priceEntity.id),
    supplier_id: Number(priceEntity.SupplierID ?? priceEntity.supplier_id),
    product_variant_id: Number(priceEntity.ProductVariantID ?? priceEntity.product_variant_id),
    product_id: Number(priceEntity.ProductID ?? priceEntity.product_id ?? priceEntity.ProductVariantID),
    supplier_sku: priceEntity.SupplierSKU ?? null,
    price: Number(priceEntity.SupplierUnitPrice ?? priceEntity.price ?? 0),
    availability_status: priceEntity.AvailabilityStatus ?? 'Available',
    updated_at: priceEntity.AvailabilityUpdatedAt ?? priceEntity.updated_at ?? null,
    product_name: priceEntity.ProductName ?? priceEntity.product_name ?? null,
    variant_name: priceEntity.VariantName ?? null,
    sku: priceEntity.SKU ?? priceEntity.sku ?? null,
  });
};

const toPurchaseOrderItemDTO = (itemEntity) => {
  if (!itemEntity) return null;
  const qty = Number(itemEntity.Quantity ?? itemEntity.quantity);
  const unitCost = Number(itemEntity.UnitCost ?? itemEntity.unit_price ?? 0);
  return Object.freeze({
    id: Number(itemEntity.PurchaseOrderDetailID ?? itemEntity.id),
    po_id: Number(itemEntity.PurchaseOrderID ?? itemEntity.po_id),
    product_variant_id: Number(itemEntity.ProductVariantID ?? itemEntity.product_variant_id),
    product_id: Number(itemEntity.ProductID ?? itemEntity.product_id ?? itemEntity.ProductVariantID),
    name: String(itemEntity.ProductName ?? itemEntity.VariantName ?? itemEntity.name ?? ''),
    variant_name: itemEntity.VariantName ?? null,
    sku: itemEntity.SKU ?? itemEntity.sku ?? null,
    quantity: qty,
    confirmed_quantity:
      itemEntity.ConfirmedQuantity !== null && itemEntity.ConfirmedQuantity !== undefined
        ? Number(itemEntity.ConfirmedQuantity)
        : null,
    unit_price: unitCost,
    line_total: Number(itemEntity.LineTotal ?? qty * unitCost),
  });
};

const toPurchaseOrderDTO = (poEntity) => {
  if (!poEntity) return null;
  return Object.freeze({
    id: Number(poEntity.PurchaseOrderID ?? poEntity.id),
    code: String(poEntity.PurchaseOrderCode ?? poEntity.code),
    supplier_id: Number(poEntity.SupplierID ?? poEntity.supplier_id),
    total: Number(poEntity.TotalAmount ?? poEntity.total ?? 0),
    status: String(poEntity.app_status ?? poEntity.PurchaseOrderStatus ?? poEntity.status),
    db_status: String(poEntity.PurchaseOrderStatus ?? poEntity.status),
    expected_date: poEntity.ExpectedDeliveryAt ?? poEntity.expected_date ?? null,
    note: poEntity.Notes ?? poEntity.note ?? null,
    created_by: poEntity.CreatedByUserID ? Number(poEntity.CreatedByUserID) : poEntity.created_by ? Number(poEntity.created_by) : null,
    created_at: poEntity.OrderedAt ?? poEntity.created_at ?? null,
    payment_status: poEntity.PaymentStatus ?? 'Unpaid',
    supplier: poEntity.supplier ? toSupplierDTO(poEntity.supplier) : undefined,
    items: Array.isArray(poEntity.items) ? poEntity.items.map(toPurchaseOrderItemDTO) : [],
  });
};

const toGoodsReceiptItemDTO = (griEntity) => {
  if (!griEntity) return null;
  const qtyReceived = Number(griEntity.ReceivedQuantity ?? griEntity.qty_received);
  const qtyDamaged = Number(griEntity.RejectedQuantity ?? griEntity.qty_damaged ?? 0);
  const qtyAccepted = Number(griEntity.AcceptedQuantity ?? Math.max(0, qtyReceived - qtyDamaged));
  return Object.freeze({
    id: Number(griEntity.GoodsReceiptDetailID ?? griEntity.id),
    receipt_id: Number(griEntity.GoodsReceiptID ?? griEntity.receipt_id),
    po_item_id: Number(griEntity.PurchaseOrderDetailID ?? griEntity.po_item_id),
    product_variant_id: Number(griEntity.ProductVariantID ?? griEntity.product_variant_id),
    product_id: Number(griEntity.ProductID ?? griEntity.product_id ?? griEntity.ProductVariantID),
    batch_code: String(griEntity.BatchNumber ?? griEntity.batch_code ?? ''),
    expiry_date: griEntity.ExpiryDate ?? griEntity.expiry_date ?? null,
    qty_received: qtyReceived,
    qty_damaged: qtyDamaged,
    qty_accepted: qtyAccepted,
    unit_price: Number(griEntity.UnitCost ?? griEntity.unit_price ?? 0),
  });
};

const toGoodsReceiptDTO = (grEntity, poStatus = undefined) => {
  if (!grEntity) return null;
  return Object.freeze({
    id: Number(grEntity.GoodsReceiptID ?? grEntity.id),
    code: grEntity.GoodsReceiptCode ?? grEntity.code ?? null,
    po_id: Number(grEntity.PurchaseOrderID ?? grEntity.po_id),
    po_status: poStatus,
    received_by: grEntity.ReceivedByUserID ? Number(grEntity.ReceivedByUserID) : grEntity.received_by ? Number(grEntity.received_by) : null,
    received_at: grEntity.ReceivedAt ?? grEntity.received_at ?? null,
    note: grEntity.ReceiptNote ?? grEntity.note ?? null,
    items: Array.isArray(grEntity.items) ? grEntity.items.map(toGoodsReceiptItemDTO) : [],
  });
};

const toInventoryBatchDTO = (batchEntity) => {
  if (!batchEntity) return null;
  return Object.freeze({
    id: Number(batchEntity.InventoryBatchID ?? batchEntity.id),
    product_variant_id: Number(batchEntity.ProductVariantID ?? batchEntity.product_variant_id),
    product_id: Number(batchEntity.ProductID ?? batchEntity.product_id ?? batchEntity.ProductVariantID),
    product_name: batchEntity.ProductName ?? batchEntity.product_name ?? null,
    variant_name: batchEntity.VariantName ?? null,
    sku: batchEntity.SKU ?? batchEntity.sku ?? null,
    batch_code: String(batchEntity.BatchNumber ?? batchEntity.batch_code),
    receipt_item_id: batchEntity.GoodsReceiptDetailID ? Number(batchEntity.GoodsReceiptDetailID) : batchEntity.receipt_item_id ? Number(batchEntity.receipt_item_id) : null,
    received_quantity: Number(batchEntity.ReceivedQuantity ?? batchEntity.received_quantity ?? batchEntity.quantity ?? 0),
    quantity: Number(batchEntity.RemainingQuantity ?? batchEntity.quantity ?? 0),
    import_price:
      batchEntity.UnitCost !== null && batchEntity.UnitCost !== undefined
        ? Number(batchEntity.UnitCost)
        : batchEntity.import_price !== null && batchEntity.import_price !== undefined
          ? Number(batchEntity.import_price)
          : null,
    expiry_date: batchEntity.ExpiryDate ?? batchEntity.expiry_date ?? null,
    received_at: batchEntity.CreatedAt ?? batchEntity.received_at ?? null,
    status: String(batchEntity.BatchStatus ?? batchEntity.status ?? 'Active'),
  });
};

const toInventoryAdjustmentDTO = (adjEntity) => {
  if (!adjEntity) return null;
  return Object.freeze({
    id: Number(adjEntity.InventoryTransactionID ?? adjEntity.id),
    product_variant_id: Number(adjEntity.ProductVariantID ?? adjEntity.product_variant_id),
    batch_id: adjEntity.InventoryBatchID ? Number(adjEntity.InventoryBatchID) : null,
    change_qty: Number(adjEntity.QuantityChange ?? adjEntity.change_qty),
    reason: String(adjEntity.Notes ?? adjEntity.reason ?? ''),
    adjusted_by: adjEntity.CreatedByUserID ? Number(adjEntity.CreatedByUserID) : null,
    created_at: adjEntity.CreatedAt ?? adjEntity.created_at ?? null,
  });
};

export {
  toSupplierDTO,
  toSupplierPriceDTO,
  toPurchaseOrderItemDTO,
  toPurchaseOrderDTO,
  toGoodsReceiptItemDTO,
  toGoodsReceiptDTO,
  toInventoryBatchDTO,
  toInventoryAdjustmentDTO,
};
export default {
  toSupplierDTO,
  toSupplierPriceDTO,
  toPurchaseOrderItemDTO,
  toPurchaseOrderDTO,
  toGoodsReceiptItemDTO,
  toGoodsReceiptDTO,
  toInventoryBatchDTO,
  toInventoryAdjustmentDTO,
};
