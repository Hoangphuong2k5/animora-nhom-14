function computeEffectiveVoucherStatus(voucher, now = new Date()) {
  const usedCount = Number(voucher.UsedCount ?? 0);
  const usageLimit =
    voucher.UsageLimit !== null && voucher.UsageLimit !== undefined
      ? Number(voucher.UsageLimit)
      : null;

  if (usageLimit !== null && usedCount >= usageLimit) {
    return 'exhausted';
  }

  const endAt = voucher.EndAt ? new Date(voucher.EndAt) : null;
  if (endAt && !Number.isNaN(endAt.getTime()) && endAt.getTime() < now.getTime()) {
    return 'expired';
  }

  const startAt = voucher.StartAt ? new Date(voucher.StartAt) : null;
  if (startAt && !Number.isNaN(startAt.getTime()) && startAt.getTime() > now.getTime()) {
    return voucher.IsActive ? 'upcoming' : 'paused';
  }

  return voucher.IsActive ? 'active' : 'paused';
}

function toVoucherDTO(voucher, now = new Date()) {
  if (!voucher) return null;
  return {
    id: Number(voucher.VoucherID),
    code: voucher.VoucherCode,
    name: voucher.VoucherName,
    discountType: voucher.DiscountType,
    discountValue: Number(voucher.DiscountValue),
    maxDiscount:
      voucher.MaximumDiscountAmount !== null && voucher.MaximumDiscountAmount !== undefined
        ? Number(voucher.MaximumDiscountAmount)
        : null,
    minOrderValue: Number(voucher.MinimumOrderAmount ?? 0),
    startAt: voucher.StartAt,
    endAt: voucher.EndAt,
    usageLimit:
      voucher.UsageLimit !== null && voucher.UsageLimit !== undefined
        ? Number(voucher.UsageLimit)
        : null,
    usedCount: Number(voucher.UsedCount ?? 0),
    isActive: Boolean(voucher.IsActive),
    effectiveStatus: computeEffectiveVoucherStatus(voucher, now),
    applicableScope: 'shop',
    createdAt: voucher.CreatedAt,
  };
}

function toVoucherUsageDTO(history) {
  if (!history) return null;
  return {
    id: Number(history.VoucherUsageHistoryID),
    voucherId: Number(history.VoucherID),
    customerId: Number(history.CustomerID),
    orderId: Number(history.OrderID),
    discountAmount: Number(history.DiscountAmount),
    usageStatus: history.UsageStatus,
    usedAt: history.UsedAt,
    revertedAt: history.RevertedAt ?? null,
  };
}

export { computeEffectiveVoucherStatus, toVoucherDTO, toVoucherUsageDTO };
export default { computeEffectiveVoucherStatus, toVoucherDTO, toVoucherUsageDTO };

