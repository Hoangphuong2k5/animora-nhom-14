import type { Booking, BookingStatus, BookingWeightRangeId } from "@/types";
import {
  estimateServicePrice,
  mapWeightStringToRangeId,
  resolveServiceBySlugOrName,
} from "@/data/serviceBookingData";
import {
  createAuditLogEntry,
  type ManualRefundCompensationEntry,
  type ReceptionistAuditLogEntry,
  type ServiceInvoiceRecord,
  type WeightPriceAdjustmentQuote,
} from "./types";

export function computeBookingEstimatedPriceSafe(booking: Booking): number {
  const extPrice = (booking as Booking & { price?: number }).price;
  if (typeof booking.adjustedPrice === "number" && booking.adjustedPrice > 0) {
    return booking.adjustedPrice;
  }
  if (typeof booking.estimatedPrice === "number" && booking.estimatedPrice > 0) {
    return booking.estimatedPrice;
  }
  if (typeof extPrice === "number" && extPrice > 0) {
    return extPrice;
  }
  const srv = resolveServiceBySlugOrName(booking.serviceSlug || booking.service);
  return estimateServicePrice(srv, booking.weightRange);
}

export function resolveDeclaredWeightKg(booking: Booking): number {
  if (typeof booking.declaredWeightKg === "number" && booking.declaredWeightKg > 0) {
    return booking.declaredWeightKg;
  }
  if (booking.petWeight) {
    const match = booking.petWeight.replace(",", ".").match(/(\d+(\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  switch (booking.weightRange) {
    case "under_5":
      return 3.5;
    case "5_to_10":
      return 7.5;
    case "10_to_20":
      return 14.0;
    case "over_20":
      return 24.0;
    default:
      return 4.0;
  }
}

/**
 * Mục 6: Hệ thống tự tính giá mới theo bảng giá và hạng cân. LT chỉ xác nhận, không nhập giá tay.
 */
export function evaluateWeightPriceAdjustment(
  booking: Booking,
  actualWeightKg: number
): WeightPriceAdjustmentQuote {
  if (!Number.isFinite(actualWeightKg) || actualWeightKg <= 0) {
    throw new Error("Cân nặng thực tế phải lớn hơn 0 kg.");
  }

  const service = resolveServiceBySlugOrName(
    booking.serviceSlug || booking.service
  );
  const oldWeightKg = resolveDeclaredWeightKg(booking);
  const oldWeightRange: BookingWeightRangeId =
    (booking.weightRange as BookingWeightRangeId) ||
    mapWeightStringToRangeId(`${oldWeightKg}`);
  const newWeightRange = mapWeightStringToRangeId(`${actualWeightKg}`);

  const oldPrice =
    booking.originalEstimatedPrice ||
    (service.dependsOnWeight
      ? estimateServicePrice(service, oldWeightRange)
      : computeBookingEstimatedPriceSafe(booking));

  const newPrice = service.dependsOnWeight
    ? estimateServicePrice(service, newWeightRange)
    : oldPrice;

  const differenceAmount = newPrice - oldPrice;
  const isPriceChanged = differenceAmount !== 0;
  const paymentTiming: "prepaid" | "postpaid" =
    booking.paymentTiming ||
    ((booking as Booking & { paymentMethod?: string }).paymentMethod === "online"
      ? "prepaid"
      : "postpaid");

  let financialAction: WeightPriceAdjustmentQuote["financialAction"] =
    "no_change";
  let financialSummary =
    "Hạng cân không đổi hoặc dịch vụ đồng giá — giữ nguyên giá ban đầu.";

  if (isPriceChanged) {
    if (paymentTiming === "postpaid") {
      financialAction = "postpaid_update";
      financialSummary = `Đơn trả sau: Hóa đơn xuất theo giá mới ${newPrice.toLocaleString(
        "vi-VN"
      )}đ (${differenceAmount > 0 ? "+" : ""}${differenceAmount.toLocaleString("vi-VN")}đ).`;
    } else if (differenceAmount > 0) {
      financialAction = "prepaid_surcharge";
      financialSummary = `Đơn trả trước (cân tăng): Cần thu bù phần chênh lệch +${differenceAmount.toLocaleString(
        "vi-VN"
      )}đ tại quầy.`;
    } else {
      financialAction = "prepaid_refund";
      financialSummary = `Đơn trả trước (cân giảm): Cần hoàn lại phần chênh lệch ${Math.abs(
        differenceAmount
      ).toLocaleString("vi-VN")}đ (thủ công).`;
    }
  }

  return {
    bookingId: booking.id,
    serviceName: service.name.vi,
    dependsOnWeight: service.dependsOnWeight,
    oldWeightKg,
    newWeightKg: Number(actualWeightKg.toFixed(2)),
    oldWeightRange,
    newWeightRange,
    oldPrice,
    newPrice,
    differenceAmount,
    isPriceChanged,
    paymentTiming,
    financialAction,
    financialSummary,
  };
}

/**
 * Mục 6:
 * - Khách đồng ý: cập nhật giá mới; trả trước cân tăng -> thu bù; trả trước cân giảm -> hoàn phần chênh.
 * - Không đồng ý: trả bé lại, hủy miễn phí 0đ, 0 violation, hoàn 100% nếu đã trả trước.
 */
export function applyWeightPriceDecision(params: {
  booking: Booking;
  actualWeightKg: number;
  weightSource: "vet_measured" | "counter_measured";
  customerAccepted: boolean;
  reason?: string;
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  updatedBooking: Booking;
  quote: WeightPriceAdjustmentQuote;
  manualLedgerEntry?: ManualRefundCompensationEntry;
  auditLog: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  const quote = evaluateWeightPriceAdjustment(
    params.booking,
    params.actualWeightKg
  );
  const sourceLabel =
    params.weightSource === "vet_measured"
      ? "Bác sĩ cân thực tế"
      : "Cân thực tế tại quầy Lễ tân";
  const resolvedReason =
    (params.reason || "").trim() ||
    (params.customerAccepted
      ? `Khách đồng ý điều chỉnh giá theo cân thực tế (${quote.oldWeightKg}kg -> ${quote.newWeightKg}kg)`
      : `Khách không đồng ý giá mới sau khi cân (${quote.oldPrice.toLocaleString(
          "vi-VN"
        )}đ -> ${quote.newPrice.toLocaleString("vi-VN")}đ) — Trả bé 0đ`);

  if (!params.customerAccepted) {
    const isPrepaidPaid =
      quote.paymentTiming === "prepaid" &&
      (params.booking.paymentState === "paid" ||
        (params.booking as Booking & { paymentStatus?: string }).paymentStatus ===
          "paid");

    const updatedBooking: Booking & {
      price?: number;
      paymentStatus?: "paid" | "unpaid";
    } = {
      ...params.booking,
      declaredWeightKg: quote.oldWeightKg,
      actualWeightKg: quote.newWeightKg,
      weightSource: params.weightSource,
      weightUpdatedBy: params.actorName,
      originalEstimatedPrice: quote.oldPrice,
      adjustedPrice: 0,
      estimatedPrice: 0,
      price: 0,
      weightAdjustmentStatus: "declined_returned",
      differenceAmount: 0,
      status: "Đã hủy",
      cancelledAt: now.toISOString(),
      cancelReason: resolvedReason,
      cancelWithoutPenalty: true,
      cancellationFee: 0,
      refundAmount: isPrepaidPaid ? quote.oldPrice : 0,
      paymentState: isPrepaidPaid ? "refunded" : "unpaid",
      internalNote: `Khách từ chối giá mới (${quote.newPrice.toLocaleString(
        "vi-VN"
      )}đ) sau khi cân thực tế ${quote.newWeightKg}kg — Trả bé lại, không tính tiền (0đ, 0 violation).`,
    };

    const manualLedgerEntry: ManualRefundCompensationEntry | undefined =
      isPrepaidPaid
        ? {
            id: `led-${now.getTime()}`,
            code: `REF-WT-${now.getTime().toString().slice(-6)}`,
            bookingId: params.booking.id,
            bookingCode: params.booking.code || params.booking.id,
            customerName: params.booking.fullName,
            customerPhone: params.booking.phone,
            kind: "refund",
            amount: quote.oldPrice,
            method: "cash",
            reason: `Hoàn 100% do khách không đồng ý giá mới sau khi cân thực tế (${quote.oldWeightKg}kg -> ${quote.newWeightKg}kg)`,
            processedBy: params.actorName,
            createdAt: now.toISOString(),
          }
        : undefined;

    const auditLog = createAuditLogEntry({
      action: "weight_price_decline",
      actionLabel: "Khách từ chối giá cân thực tế — Trả bé (0đ)",
      actorId: params.actorId,
      actorName: params.actorName,
      targetCode: params.booking.code || params.booking.id,
      customerName: params.booking.fullName,
      customerPhone: params.booking.phone,
      beforeState: `Cân cũ: ${quote.oldWeightKg}kg • Giá cũ: ${quote.oldPrice.toLocaleString(
        "vi-VN"
      )}đ`,
      afterState: `Cân mới: ${quote.newWeightKg}kg (${sourceLabel}) • Giá mới: ${quote.newPrice.toLocaleString(
        "vi-VN"
      )}đ • Khách từ chối -> Trả bé 0đ (0 violation${
        isPrepaidPaid
          ? `, hoàn 100% ${quote.oldPrice.toLocaleString("vi-VN")}đ`
          : ""
      })`,
      reason: resolvedReason,
      now,
    });

    return { updatedBooking, quote, manualLedgerEntry, auditLog };
  }

  const updatedBooking: Booking & { price?: number } = {
    ...params.booking,
    declaredWeightKg: quote.oldWeightKg,
    actualWeightKg: quote.newWeightKg,
    petWeight: `${quote.newWeightKg} kg`,
    weightRange: quote.newWeightRange,
    weightSource: params.weightSource,
    weightUpdatedBy: params.actorName,
    originalEstimatedPrice: quote.oldPrice,
    adjustedPrice: quote.newPrice,
    estimatedPrice: quote.newPrice,
    price: quote.newPrice,
    weightAdjustmentStatus: "accepted",
    differenceAmount: quote.differenceAmount,
    differenceSettled:
      quote.paymentTiming === "postpaid" || quote.differenceAmount === 0,
    internalNote: `Đã xác nhận cân thực tế ${quote.newWeightKg}kg (${sourceLabel}): ${quote.oldPrice.toLocaleString(
      "vi-VN"
    )}đ -> ${quote.newPrice.toLocaleString("vi-VN")}đ. ${quote.financialSummary}`,
  };

  let manualLedgerEntry: ManualRefundCompensationEntry | undefined;
  if (quote.paymentTiming === "prepaid" && quote.differenceAmount !== 0) {
    manualLedgerEntry = {
      id: `led-${now.getTime()}`,
      code: `${
        quote.differenceAmount > 0 ? "SUR" : "REF"
      }-WT-${now.getTime().toString().slice(-6)}`,
      bookingId: params.booking.id,
      bookingCode: params.booking.code || params.booking.id,
      customerName: params.booking.fullName,
      customerPhone: params.booking.phone,
      kind: quote.differenceAmount > 0 ? "surcharge" : "refund",
      amount: Math.abs(quote.differenceAmount),
      method: "cash",
      reason:
        quote.differenceAmount > 0
          ? `Thu bù chênh lệch cân nặng thực tế (${quote.oldWeightKg}kg -> ${quote.newWeightKg}kg)`
          : `Hoàn tiền chênh lệch do cân thực tế giảm (${quote.oldWeightKg}kg -> ${quote.newWeightKg}kg)`,
      processedBy: params.actorName,
      createdAt: now.toISOString(),
    };
    updatedBooking.differenceSettled = true;
  }

  const auditLog = createAuditLogEntry({
    action: "weight_price_adjust",
    actionLabel: "Điều chỉnh giá theo cân nặng thực tế",
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: params.booking.code || params.booking.id,
    customerName: params.booking.fullName,
    customerPhone: params.booking.phone,
    beforeState: `Cân cũ: ${quote.oldWeightKg}kg • Giá cũ: ${quote.oldPrice.toLocaleString(
      "vi-VN"
    )}đ`,
    afterState: `Cân mới: ${quote.newWeightKg}kg (${sourceLabel}) • Giá mới: ${quote.newPrice.toLocaleString(
      "vi-VN"
    )}đ (${quote.financialSummary})`,
    reason: resolvedReason,
    now,
  });

  return { updatedBooking, quote, manualLedgerEntry, auditLog };
}

export function collectBookingPaymentAndIssueInvoice(params: {
  booking: Booking;
  paymentMethod: "cash" | "bank_transfer" | "vnpay" | "payos";
  note?: string;
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  updatedBooking: Booking;
  invoice: ServiceInvoiceRecord;
  auditLog: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  const { booking } = params;

  if (booking.status === "Đã hủy" || booking.status === "Không đến") {
    throw new Error(
      `Không thể thu tiền dịch vụ cho đơn ở trạng thái "${booking.status}".`
    );
  }

  const finalPrice = computeBookingEstimatedPriceSafe(booking);
  const originalPrice = booking.originalEstimatedPrice || finalPrice;
  const dateCompact = now.toISOString().slice(0, 10).replace(/-/g, "");
  const invoiceCode =
    booking.invoiceCode ||
    `INV-${dateCompact}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  const nextStatus: BookingStatus =
    booking.status === "Đã đến" || booking.status === "Đang làm"
      ? "Hoàn thành"
      : booking.status || "Đã xác nhận";

  const updatedBooking: Booking & {
    price?: number;
    paymentStatus?: "paid" | "unpaid";
  } = {
    ...booking,
    status: nextStatus,
    completedAt:
      nextStatus === "Hoàn thành"
        ? booking.completedAt || now.toISOString()
        : booking.completedAt,
    paymentState: "paid",
    paymentStatus: "paid",
    estimatedPrice: finalPrice,
    price: finalPrice,
    differenceSettled: true,
    invoiceCode,
    invoiceIssuedAt: now.toISOString(),
    collectedByName: params.actorName,
    internalNote: `LT ${params.actorName} đã thu ${finalPrice.toLocaleString(
      "vi-VN"
    )}đ (${
      params.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"
    }) & xuất hóa đơn ${invoiceCode}`,
  };

  const invoice: ServiceInvoiceRecord = {
    id: `inv-${now.getTime()}`,
    invoiceCode,
    bookingId: booking.id,
    bookingCode: booking.code || booking.id,
    customerName: booking.fullName,
    customerPhone: booking.phone,
    petName: booking.petName || "Bé cưng",
    petSpecies: booking.petType,
    serviceName: booking.service,
    bookingChannel: booking.bookingChannel || "online",
    paymentTiming: booking.paymentTiming || "postpaid",
    paymentMethod: params.paymentMethod,
    originalPrice,
    declaredWeightKg: booking.declaredWeightKg,
    actualWeightKg: booking.actualWeightKg,
    weightDifferenceAmount: booking.differenceAmount || 0,
    finalAmount: finalPrice,
    issuedBy: params.actorName,
    issuedAt: now.toISOString(),
    note: params.note?.trim() || undefined,
  };

  const auditLog = createAuditLogEntry({
    action: "payment_collect",
    actionLabel: 'Thu tiền ("Đã thu") & Xuất hóa đơn',
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: booking.code || booking.id,
    customerName: booking.fullName,
    customerPhone: booking.phone,
    beforeState: "Chưa thanh toán tại quầy",
    afterState: `Đã thu ${finalPrice.toLocaleString("vi-VN")}đ (${
      params.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"
    }) • Hóa đơn: ${invoiceCode}`,
    reason: params.note?.trim() || "Thu tiền dịch vụ tại quầy",
    now,
  });

  return { updatedBooking, invoice, auditLog };
}

export function createManualRefundOrCompensation(params: {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  kind: "refund" | "surcharge";
  amount: number;
  method: "cash" | "vnpay" | "payos" | "bank_transfer";
  reason: string;
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  entry: ManualRefundCompensationEntry;
  auditLog: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    throw new Error("Số tiền hoàn/bù phải lớn hơn 0đ.");
  }
  const cleanReason = (params.reason || "").trim();
  if (cleanReason.length < 3) {
    throw new Error("Bắt buộc nhập lý do hoàn hoặc bù tiền thủ công.");
  }

  const entry: ManualRefundCompensationEntry = {
    id: `led-${now.getTime()}`,
    code: `${params.kind === "refund" ? "REF" : "SUR"}-${now
      .getTime()
      .toString()
      .slice(-6)}`,
    bookingId: params.bookingId,
    bookingCode: params.bookingCode,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    kind: params.kind,
    amount: Math.round(params.amount),
    method: params.method,
    reason: cleanReason,
    processedBy: params.actorName,
    createdAt: now.toISOString(),
  };

  const auditLog = createAuditLogEntry({
    action: "manual_refund_compensation",
    actionLabel:
      params.kind === "refund"
        ? "Ghi nhận Hoàn tiền thủ công"
        : "Ghi nhận Thu bù tiền thủ công",
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: params.bookingCode,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    beforeState: `Đơn ${params.bookingCode}`,
    afterState: `${
      params.kind === "refund" ? "Hoàn trả khách" : "Thu bù từ khách"
    }: ${entry.amount.toLocaleString(
      "vi-VN"
    )}đ qua ${params.method.toUpperCase()} (Mã phiếu: ${entry.code})`,
    reason: cleanReason,
    now,
  });

  return { entry, auditLog };
}
