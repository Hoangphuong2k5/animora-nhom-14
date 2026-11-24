"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ConciergeBell,
  CreditCard,
  Phone,
  Scale,
  Search,
  Undo2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { TablePagination } from "@/components/ui/table-pagination";
import { ROUTES } from "@/constants/config.constant";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import {
  ADMIN_BOOKINGS_SYNC_EVENT,
  getDoctorWeightLogsForCustomerPet,
  syncCustomerBookingToExpertStore,
} from "@/utils/clinicalSync";
import {
  type ExtendedBooking,
  getBookingPaymentMeta,
  isBookingPaid,
} from "@/components/shared/operations/bookings/bookingsTypesAndData";
import { getWeightRangeLabel } from "@/data/serviceBookingData";
import {
  appendManualLedger,
  appendReceptionistAuditLog,
  appendServiceInvoice,
  applyWeightPriceDecision,
  checkInCustomerBooking,
  collectBookingPaymentAndIssueInvoice,
  createManualRefundOrCompensation,
  delayBookingBy30Minutes,
  dispatchReceptionistSync,
  evaluateCustomerViolationStatus,
  evaluateWeightPriceAdjustment,
  isBookingOverdue15Min,
  loadReceptionistBookings,
  markBookingNoShow,
  RECEPTIONIST_SYNC_EVENT,
  resolveDeclaredWeightKg,
  saveReceptionistBookings,
  type ManualRefundCompensationEntry,
  type ReceptionistAuditLogEntry,
  type ServiceInvoiceRecord,
  undoBookingNoShow,
} from "@/data/receptionistOpsData";
import { useReceptionistActor } from "@/hooks/receptionist/useReceptionistActor";
import { CounterActionModals } from "./modals/CounterActionModals";

const PAGE_SIZE = 10;

export function ReceptionistCounterWorkspace() {
  const { actorId, actorName } = useReceptionistActor();
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "all" | "waiting_checkin" | "in_clinic" | "unpaid" | "noshow"
  >("all");

  // Modal states
  const [undoNoShowTarget, setUndoNoShowTarget] =
    useState<ExtendedBooking | null>(null);
  const [undoNoShowReason, setUndoNoShowReason] = useState("");

  const [weightModalTarget, setWeightModalTarget] =
    useState<ExtendedBooking | null>(null);
  const [actualWeightInput, setActualWeightInput] = useState<string>("5.0");
  const [weightSource, setWeightSource] = useState<
    "vet_measured" | "counter_measured"
  >("vet_measured");
  const [weightDecisionReason, setWeightDecisionReason] = useState("");

  const [collectTarget, setCollectTarget] = useState<ExtendedBooking | null>(
    null
  );
  const [collectMethod, setCollectMethod] = useState<"cash" | "bank_transfer">(
    "cash"
  );
  const [collectNote, setCollectNote] = useState("");

  const [manualLedgerTarget, setManualLedgerTarget] =
    useState<ExtendedBooking | null>(null);
  const [manualKind, setManualKind] = useState<"refund" | "surcharge">(
    "refund"
  );
  const [manualAmount, setManualAmount] = useState<string>("100000");
  const [manualMethod, setManualMethod] = useState<"cash" | "vnpay" | "payos">(
    "cash"
  );
  const [manualReason, setManualReason] = useState("");

  const [previewInvoice, setPreviewInvoice] =
    useState<ServiceInvoiceRecord | null>(null);

  useEffect(() => {
    const syncBookings = () => setBookings(loadReceptionistBookings());
    syncBookings();
    window.addEventListener(ADMIN_BOOKINGS_SYNC_EVENT, syncBookings);
    window.addEventListener(RECEPTIONIST_SYNC_EVENT, syncBookings);
    return () => {
      window.removeEventListener(ADMIN_BOOKINGS_SYNC_EVENT, syncBookings);
      window.removeEventListener(RECEPTIONIST_SYNC_EVENT, syncBookings);
    };
  }, []);

  const persistUpdate = (
    nextBookings: ExtendedBooking[],
    auditEntry?: ReceptionistAuditLogEntry,
    ledgerEntry?: ManualRefundCompensationEntry,
    invoiceEntry?: ServiceInvoiceRecord
  ) => {
    setBookings(saveReceptionistBookings(nextBookings));
    if (auditEntry) appendReceptionistAuditLog(auditEntry);
    if (ledgerEntry) appendManualLedger(ledgerEntry);
    if (invoiceEntry) appendServiceInvoice(invoiceEntry);
    dispatchReceptionistSync();
  };

  const getLatestVetWeightForBooking = (b: ExtendedBooking): number | null => {
    if (typeof b.actualWeightKg === "number" && b.actualWeightKg > 0) {
      return b.actualWeightKg;
    }
    const vetLogs = getDoctorWeightLogsForCustomerPet(b.id, b.petName);
    const latest = vetLogs[vetLogs.length - 1];
    return latest && latest.kg > 0 ? latest.kg : null;
  };

  const handleCheckIn = (booking: ExtendedBooking) => {
    try {
      const { updatedBooking, auditLog } = checkInCustomerBooking({
        booking,
        actorId,
        actorName,
      });
      const next = bookings.map((b) =>
        b.id === booking.id ? ({ ...b, ...updatedBooking } as ExtendedBooking) : b
      );
      persistUpdate(next, auditLog);
      syncCustomerBookingToExpertStore(updatedBooking, actorName);
      toast.success(
        `Đã Check-in cho khách ${booking.fullName} (Bé ${booking.petName || "cưng"})!`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể check-in.");
    }
  };

  const handleDelay30Minutes = (booking: ExtendedBooking) => {
    const res = delayBookingBy30Minutes({
      booking,
      allBookings: bookings,
      actorId,
      actorName,
    });
    if (!res.ok || !res.updatedBooking) {
      toast.error(res.error || "Không thể dời 30 phút.");
      return;
    }
    const next = bookings.map((b) =>
      b.id === booking.id
        ? ({
            ...b,
            ...res.updatedBooking,
            staffName: res.updatedBooking?.doctorName || b.staffName,
          } as ExtendedBooking)
        : b
    );
    persistUpdate(next, res.auditLog);
    syncCustomerBookingToExpertStore(res.updatedBooking, actorName);
    toast.success(
      `Đã dời 30 phút sang khung ${res.updatedBooking.timeSlot}${
        res.reassignedStaffName ? ` (Tự gán sang ${res.reassignedStaffName})` : ""
      }!`
    );
  };

  const handleMarkNoShow = (booking: ExtendedBooking) => {
    try {
      const { updatedBooking, auditLog } = markBookingNoShow({
        booking,
        actorId,
        actorName,
      });
      const next = bookings.map((b) =>
        b.id === booking.id ? ({ ...b, ...updatedBooking } as ExtendedBooking) : b
      );
      persistUpdate(next, auditLog);
      syncCustomerBookingToExpertStore(updatedBooking, actorName);
      toast.warning(
        `Đã chuyển đơn ${booking.code || booking.id} sang "Không đến" và nhả slot!`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể đánh dấu Không đến."
      );
    }
  };

  const handleConfirmUndoNoShow = () => {
    if (!undoNoShowTarget) return;
    const res = undoBookingNoShow({
      booking: undoNoShowTarget,
      reason: undoNoShowReason,
      allBookings: bookings,
      actorId,
      actorName,
    });
    if (!res.ok || !res.updatedBooking) {
      toast.error(res.error || "Không thể hoàn tác Không đến.");
      return;
    }
    const next = bookings.map((b) =>
      b.id === undoNoShowTarget.id
        ? ({
            ...b,
            ...res.updatedBooking,
            staffName: res.updatedBooking?.doctorName || b.staffName,
          } as ExtendedBooking)
        : b
    );
    persistUpdate(next, res.auditLog);
    syncCustomerBookingToExpertStore(res.updatedBooking, actorName);
    setUndoNoShowTarget(null);
    setUndoNoShowReason("");
    toast.success(
      'Đã hoàn tác "Không đến", khôi phục ca về trạng thái "Đã đến" & ghi Audit Log!'
    );
  };

  const handleOpenWeightModal = (booking: ExtendedBooking) => {
    const vetKg = getLatestVetWeightForBooking(booking);
    const declaredKg = resolveDeclaredWeightKg(booking);
    setWeightModalTarget(booking);
    setActualWeightInput(String(vetKg ?? declaredKg));
    setWeightSource(vetKg ? "vet_measured" : "counter_measured");
    setWeightDecisionReason("");
  };

  const currentWeightQuote = useMemo(() => {
    if (!weightModalTarget) return null;
    const parsed = parseFloat(actualWeightInput.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    try {
      return evaluateWeightPriceAdjustment(weightModalTarget, parsed);
    } catch {
      return null;
    }
  }, [weightModalTarget, actualWeightInput]);

  const handleApplyWeightDecision = (customerAccepted: boolean) => {
    if (!weightModalTarget) return;
    const parsed = parseFloat(actualWeightInput.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Vui lòng nhập số cân nặng thực tế hợp lệ (> 0 kg).");
      return;
    }
    try {
      const res = applyWeightPriceDecision({
        booking: weightModalTarget,
        actualWeightKg: parsed,
        weightSource,
        customerAccepted,
        reason: weightDecisionReason,
        actorId,
        actorName,
      });
      const next = bookings.map((b) =>
        b.id === weightModalTarget.id
          ? ({
              ...b,
              ...res.updatedBooking,
              price: res.updatedBooking.estimatedPrice,
            } as ExtendedBooking)
          : b
      );
      persistUpdate(next, res.auditLog, res.manualLedgerEntry);
      syncCustomerBookingToExpertStore(res.updatedBooking, actorName);
      setWeightModalTarget(null);
      if (customerAccepted) {
        toast.success(
          `Đã xác nhận giá mới ${res.quote.newPrice.toLocaleString("vi-VN")}đ theo cân nặng thực tế ${res.quote.newWeightKg}kg!`
        );
      } else {
        toast.info(
          "Khách không đồng ý giá mới — Đã hủy dịch vụ miễn phí (0đ, 0 violation) và trả bé cho khách!"
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Lỗi điều chỉnh giá theo cân nặng."
      );
    }
  };

  const handleConfirmCollectPayment = () => {
    if (!collectTarget) return;
    try {
      const res = collectBookingPaymentAndIssueInvoice({
        booking: collectTarget,
        paymentMethod: collectMethod,
        note: collectNote,
        actorId,
        actorName,
      });
      const next = bookings.map((b) =>
        b.id === collectTarget.id
          ? ({
              ...b,
              ...res.updatedBooking,
              price: res.updatedBooking.estimatedPrice,
              paymentStatus: "paid",
            } as ExtendedBooking)
          : b
      );
      persistUpdate(next, res.auditLog, undefined, res.invoice);
      syncCustomerBookingToExpertStore(res.updatedBooking, actorName);
      setCollectTarget(null);
      setCollectNote("");
      setPreviewInvoice(res.invoice);
      toast.success(
        `Đã thu ${res.invoice.finalAmount.toLocaleString("vi-VN")}đ và xuất hóa đơn ${res.invoice.invoiceCode}!`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể thu tiền.");
    }
  };

  const handleConfirmManualLedger = () => {
    if (!manualLedgerTarget) return;
    try {
      const res = createManualRefundOrCompensation({
        bookingId: manualLedgerTarget.id,
        bookingCode: manualLedgerTarget.code || manualLedgerTarget.id,
        customerName: manualLedgerTarget.fullName,
        customerPhone: manualLedgerTarget.phone,
        kind: manualKind,
        amount: parseFloat(manualAmount),
        method: manualMethod,
        reason: manualReason,
        actorId,
        actorName,
      });
      persistUpdate(bookings, res.auditLog, res.entry);
      setManualLedgerTarget(null);
      setManualReason("");
      toast.success(
        `Đã ghi nhận phiếu ${
          manualKind === "refund" ? "Hoàn tiền" : "Thu bù"
        } ${res.entry.code} vào Audit Log!`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Vui lòng kiểm tra thông tin."
      );
    }
  };

  const counts = useMemo(() => {
    const waitingCheckin = bookings.filter(
      (b) => b.status === "Mới" || b.status === "Đã xác nhận" || !b.status
    ).length;
    const inClinic = bookings.filter(
      (b) => b.status === "Đã đến" || b.status === "Đang làm"
    ).length;
    const unpaid = bookings.filter(
      (b) =>
        b.status !== "Đã hủy" && b.status !== "Không đến" && !isBookingPaid(b)
    ).length;
    const noshow = bookings.filter((b) => b.status === "Không đến").length;
    return { waitingCheckin, inClinic, unpaid, noshow };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter((b) => {
      const status = b.status || "Mới";
      if (
        activeTab === "waiting_checkin" &&
        status !== "Mới" &&
        status !== "Đã xác nhận"
      ) {
        return false;
      }
      if (
        activeTab === "in_clinic" &&
        status !== "Đã đến" &&
        status !== "Đang làm"
      ) {
        return false;
      }
      if (
        activeTab === "unpaid" &&
        (status === "Đã hủy" || status === "Không đến" || isBookingPaid(b))
      ) {
        return false;
      }
      if (activeTab === "noshow" && status !== "Không đến") {
        return false;
      }
      if (!q) return true;
      return (
        b.fullName.toLowerCase().includes(q) ||
        b.phone.replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
        (b.petName && b.petName.toLowerCase().includes(q)) ||
        (b.code && b.code.toLowerCase().includes(q)) ||
        b.service.toLowerCase().includes(q)
      );
    });
  }, [bookings, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBookings = filteredBookings.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-[#6B1F2E] via-[#7E2537] to-[#9E354A] text-white p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold">
            <ConciergeBell className="w-3.5 h-3.5 text-[#FFD166]" />
            <span>Quầy Lễ Tân Animora v1.4 • Phiên làm việc: {actorName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white!">
            Bàn Tiếp Nhận, Check-in &amp; Thu Ngân Tại Quầy
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl">
            Lễ tân dùng phiên đăng nhập riêng để check-in khách đặt online, dời 30 phút trong thời
            gian ân hạn, xác nhận giá tự động theo cân nặng thực tế, thu tiền và xuất hóa đơn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href={ROUTES.RECEPTIONIST_BOOKING}
            className="px-4 py-2.5 rounded-xl bg-white text-[#6B1F2E] hover:bg-[#FFF4E8] font-extrabold text-xs inline-flex items-center gap-2 shadow-md transition-all"
          >
            <CalendarPlus className="w-4 h-4 text-[#FF7F6B]" />
            <span>Đặt lịch giúp khách tại quầy</span>
          </Link>
          <Link
            href={ROUTES.RECEPTIONIST_CUSTOMERS}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs inline-flex items-center gap-2 transition-all"
          >
            <UserCheck className="w-4 h-4 text-[#FFD166]" />
            <span>Khách vãng lai &amp; Tạo TK Web</span>
          </Link>
        </div>
      </div>

      {/* KPI Quick Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            id: "waiting_checkin" as const,
            label: "Chờ Check-in",
            count: counts.waitingCheckin,
            sub: "Khách hẹn trước sắp đến",
            color:
              "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
          },
          {
            id: "in_clinic" as const,
            label: "Đã đến / Đang phục vụ",
            count: counts.inClinic,
            sub: "Có thể đối chiếu cân thực tế",
            color:
              "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          },
          {
            id: "unpaid" as const,
            label: "Chờ thu tiền tại quầy",
            count: counts.unpaid,
            sub: 'Bấm "Đã thu" & xuất hóa đơn',
            color:
              "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
          },
          {
            id: "noshow" as const,
            label: "Không đến (>15 phút)",
            count: counts.noshow,
            sub: "Hỗ trợ hoàn tác kèm lý do & log",
            color:
              "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
          },
        ].map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              setActiveTab((prev) => (prev === card.id ? "all" : card.id));
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === card.id
                ? "ring-2 ring-[#6B1F2E] dark:ring-[#FF7F6B] bg-white dark:bg-card shadow-md"
                : "bg-white/90 dark:bg-card/90 border-zinc-200/80 dark:border-border hover:border-[#6B1F2E]/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 dark:text-muted-foreground">
                {card.label}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${card.color}`}
              >
                {card.count} ca
              </span>
            </div>
            <div className="text-2xl font-heading font-extrabold mt-1 text-zinc-900 dark:text-foreground">
              {card.count}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{card.sub}</div>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Gõ SĐT khách, tên khách, tên thú cưng hoặc mã lịch hẹn..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all" as const, label: `Tất cả (${bookings.length})` },
            {
              id: "waiting_checkin" as const,
              label: `Chờ Check-in (${counts.waitingCheckin})`,
            },
            { id: "in_clinic" as const, label: `Đã đến (${counts.inClinic})` },
            { id: "unpaid" as const, label: `Chờ thu tiền (${counts.unpaid})` },
            { id: "noshow" as const, label: `Không đến (${counts.noshow})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTab(t.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === t.id
                  ? "bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-zinc-950"
                  : "bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Counter Bookings List */}
      <div className="space-y-3">
        {paginatedBookings.map((b) => {
          const status = b.status || "Đã xác nhận";
          const paid = isBookingPaid(b);
          const paymentMeta = getBookingPaymentMeta(b);
          const price = b.adjustedPrice ?? b.estimatedPrice ?? b.price ?? 350000;
          const declaredKg = resolveDeclaredWeightKg(b);
          const vetKg = getLatestVetWeightForBooking(b);
          const violationInfo = evaluateCustomerViolationStatus(b.phone, bookings);
          const overdue15m = isBookingOverdue15Min(b);

          return (
            <div
              key={b.id}
              className="p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/15 dark:text-[#FF7F6B]">
                    {b.code || b.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      status === "Hoàn thành"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : status === "Đã đến" || status === "Đang làm"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        : status === "Không đến" || status === "Đã hủy"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-sky-500/10 text-sky-600 border-sky-500/20"
                    }`}
                  >
                    {status}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${paymentMeta.badgeClass}`}
                  >
                    {paymentMeta.badgeLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-muted-foreground">
                    Kênh:{" "}
                    {b.bookingChannel === "counter"
                      ? "Tại quầy (LT)"
                      : "Online (KH)"}
                  </span>
                  {overdue15m && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">
                      Quá 15p chưa Check-in
                    </span>
                  )}
                  {violationInfo.violationCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      {violationInfo.violationCount} Violation (90 ngày)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">
                      Khách hàng:
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-foreground">
                      {b.fullName}
                    </span>
                    <span className="text-zinc-500 ml-1.5 inline-flex items-center gap-0.5">
                      <Phone className="w-3 h-3 text-[#FF7F6B]" />
                      {b.phone}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[11px]">
                      Thú cưng &amp; Cân nặng:
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-foreground">
                      {b.petName || "Bé cưng"} ({b.petType})
                    </span>
                    <span className="text-zinc-500 block text-[11px]">
                      Khai báo: <strong>{declaredKg}kg</strong> (
                      {getWeightRangeLabel(b.weightRange, "vi")})
                      {vetKg && (
                        <span className="ml-1.5 text-amber-600 dark:text-amber-400 font-bold">
                          • Thực tế: {vetKg}kg
                        </span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[11px]">
                      Dịch vụ &amp; Giờ hẹn:
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-foreground">
                      {b.service} •{" "}
                      <strong className="text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {price.toLocaleString("vi-VN")}đ
                      </strong>
                    </span>
                    <span className="text-zinc-500 block text-[11px]">
                      {formatDateDdMmYyyy(b.date)} lúc{" "}
                      <strong>{b.timeSlot || "09:00"}</strong> •{" "}
                      {b.doctorName || b.staffName || "BS. Lê Huy Hoàng"}
                    </span>
                  </div>
                </div>

                {b.internalNote && (
                  <div className="text-[11px] text-zinc-500 dark:text-muted-foreground bg-zinc-50 dark:bg-muted/50 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-border">
                    Ghi chú quầy: {b.internalNote}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-border">
                {(status === "Mới" || status === "Đã xác nhận") && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCheckIn(b)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Khách đã đến</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelay30Minutes(b)}
                      className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/25 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Dời 30 phút</span>
                    </button>

                    {b.bookingMode !== "walk_in_now" && (
                      <button
                        type="button"
                        onClick={() => handleMarkNoShow(b)}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Không đến (&gt;15p)</span>
                      </button>
                    )}
                  </>
                )}

                {status === "Không đến" && (
                  <button
                    type="button"
                    onClick={() => {
                      setUndoNoShowTarget(b);
                      setUndoNoShowReason("");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Hoàn tác &quot;Không đến&quot;</span>
                  </button>
                )}

                {status !== "Đã hủy" && status !== "Không đến" && (
                  <button
                    type="button"
                    onClick={() => handleOpenWeightModal(b)}
                    className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/25 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Giá theo cân thực tế</span>
                  </button>
                )}

                {status !== "Đã hủy" && status !== "Không đến" && !paid && (
                  <button
                    type="button"
                    onClick={() => {
                      setCollectTarget(b);
                      setCollectMethod("cash");
                      setCollectNote("");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Đã thu &amp; Xuất HĐ</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setManualLedgerTarget(b);
                    setManualKind(
                      (b.differenceAmount || 0) > 0 ? "surcharge" : "refund"
                    );
                    setManualAmount(
                      String(Math.abs(b.differenceAmount || 100000))
                    );
                    setManualReason("");
                  }}
                  className="px-2.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted text-zinc-700 dark:text-foreground font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Hoàn/Bù</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredBookings.length > PAGE_SIZE && (
          <TablePagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <CounterActionModals
        undoNoShowTarget={undoNoShowTarget}
        undoNoShowReason={undoNoShowReason}
        onChangeUndoReason={setUndoNoShowReason}
        onCloseUndoNoShow={() => setUndoNoShowTarget(null)}
        onConfirmUndoNoShow={handleConfirmUndoNoShow}
        weightModalTarget={weightModalTarget}
        actualWeightInput={actualWeightInput}
        weightSource={weightSource}
        weightDecisionReason={weightDecisionReason}
        currentWeightQuote={currentWeightQuote}
        onChangeActualWeight={setActualWeightInput}
        onChangeWeightSource={setWeightSource}
        onChangeWeightReason={setWeightDecisionReason}
        onCloseWeightModal={() => setWeightModalTarget(null)}
        onApplyWeightDecision={handleApplyWeightDecision}
        collectTarget={collectTarget}
        collectMethod={collectMethod}
        collectNote={collectNote}
        onChangeCollectMethod={setCollectMethod}
        onChangeCollectNote={setCollectNote}
        onCloseCollect={() => setCollectTarget(null)}
        onConfirmCollect={handleConfirmCollectPayment}
        manualLedgerTarget={manualLedgerTarget}
        manualKind={manualKind}
        manualAmount={manualAmount}
        manualMethod={manualMethod}
        manualReason={manualReason}
        onChangeManualKind={setManualKind}
        onChangeManualAmount={setManualAmount}
        onChangeManualMethod={setManualMethod}
        onChangeManualReason={setManualReason}
        onCloseManualLedger={() => setManualLedgerTarget(null)}
        onConfirmManualLedger={handleConfirmManualLedger}
        previewInvoice={previewInvoice}
        onCloseInvoice={() => setPreviewInvoice(null)}
      />
    </div>
  );
}
