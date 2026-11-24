"use client";

import React, { useEffect, useState } from "react";
import { CalendarCheck, Plus, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import {
  ADMIN_BOOKINGS_SYNC_EVENT,
  syncCustomerBookingToExpertStore,
} from "@/utils/clinicalSync";
import type { BookingStatus } from "@/types";
import { ServiceConfigTab } from "@/components/manager/bookings/ServiceConfigTab";
import { assessCancellation, parseBookingStart } from "@/data/managerOpsData";
import {
  ASSIGNABLE_STAFF_OPTIONS,
  BOOKINGS_SEED_VERSION,
  buildDefaultBookings,
  CANCEL_REASON_OPTIONS,
  type ExtendedBooking,
  isBookingFinalized,
  isBookingPaid,
  matchesBookingWeekFilter,
  sortBookingsByNearestTime,
} from "./bookingsTypesAndData";
import { BookingsFilterBar } from "./BookingsFilterBar";
import { BookingsTable, type BookingSortKey } from "./BookingsTable";
import { BookingDetailDrawer } from "./BookingDetailDrawer";
import { BookingsModals } from "./BookingsModals";

export type { ExtendedBooking };

export interface BookingsWorkspaceProps {
  mode?: "manager" | "readonly";
}

/** Shared Bookings & Services workspace for Manager (interactive) and Admin (read-only). */
export function BookingsWorkspace({ mode = "manager" }: BookingsWorkspaceProps) {
  const isReadOnly = mode === "readonly";
  const [mainTab, setMainTab] = useState<"bookings" | "services">("bookings");
  const [addServiceSignal, setAddServiceSignal] = useState(0);
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [filterStaff, setFilterStaff] = useState<string>("all");
  const [filterTimeSlot, setFilterTimeSlot] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<BookingSortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 5;

  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReasonOption, setCancelReasonOption] = useState<string>(
    CANCEL_REASON_OPTIONS[0]
  );
  const [cancelReason, setCancelReason] = useState("");
  const [applyHalfFee, setApplyHalfFee] = useState(false);
  const [isCancelFeeApplicable, setIsCancelFeeApplicable] = useState(false);
  const [cancelAssessmentNotice, setCancelAssessmentNotice] = useState<string>("");

  const handleToggleSort = (key: BookingSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const params = new URLSearchParams(window.location.search);
      if (params.get("status") === "pending") {
        setMainTab("bookings");
        setFilterStatus("Mới");
      }

      const seedVer = safeGetStorage<string>("animora_bookings_seed_version_v2", "");
      const saved = safeGetStorage<ExtendedBooking[]>("animora_bookings_v2", []);
      if (
        Array.isArray(saved) &&
        saved.length > 0 &&
        seedVer === BOOKINGS_SEED_VERSION
      ) {
        setBookings(sortBookingsByNearestTime(saved));
      } else {
        const seeded = sortBookingsByNearestTime(buildDefaultBookings());
        setBookings(seeded);
        safeSetStorage("animora_bookings_v2", seeded);
        safeSetStorage("animora_bookings_seed_version_v2", BOOKINGS_SEED_VERSION);
      }
    });

    const handleExternalSync = () => {
      const latest = safeGetStorage<ExtendedBooking[]>("animora_bookings_v2", []);
      if (!Array.isArray(latest) || latest.length === 0) return;
      const sorted = sortBookingsByNearestTime(latest);
      setBookings(sorted);
      setSelectedBooking((prev) =>
        prev ? sorted.find((b) => b.id === prev.id) || prev : null
      );
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "animora_bookings_v2") {
        handleExternalSync();
      }
    };

    window.addEventListener(ADMIN_BOOKINGS_SYNC_EVENT, handleExternalSync);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      cancelled = true;
      window.removeEventListener(ADMIN_BOOKINGS_SYNC_EVENT, handleExternalSync);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const saveBookings = (updated: ExtendedBooking[]) => {
    if (isReadOnly) return;
    const sorted = sortBookingsByNearestTime(updated);
    setBookings(sorted);
    safeSetStorage("animora_bookings_v2", sorted);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(ADMIN_BOOKINGS_SYNC_EVENT));
    }
  };

  const syncBookingToExpert = (booking: ExtendedBooking) => {
    const staffLower = (booking.staffName || "").toLowerCase();
    const matchedStaff = ASSIGNABLE_STAFF_OPTIONS.find((s) => {
      const pureName = s.name.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
      return staffLower && (staffLower.includes(pureName) || pureName.includes(staffLower));
    });
    const resolvedDoctorId =
      booking.doctorId ||
      matchedStaff?.id ||
      (staffLower.includes("thùy") || staffLower.includes("thu hà")
        ? "exp-spa-01"
        : staffLower.includes("tuấn anh")
          ? "exp-spa-02"
          : staffLower.includes("toàn")
            ? "exp-vet-02"
            : staffLower.includes("phương")
              ? "exp-vet-03"
              : "exp-vet-01");

    syncCustomerBookingToExpertStore(
      {
        ...booking,
        doctorId: resolvedDoctorId,
        paymentState: booking.paymentStatus === "paid" ? "paid" : booking.paymentState,
      },
      "Quản lý"
    );
  };

  const handleConfirmCounterPayment = (id: string) => {
    if (isReadOnly) return;
    let targetUpdated: ExtendedBooking | undefined;
    const updated = bookings.map((b) => {
      if (b.id === id) {
        targetUpdated = {
          ...b,
          paymentStatus: "paid",
          paymentState: "paid",
          internalNote: `Đã xác nhận thu tiền tại quầy lúc ${new Date().toLocaleTimeString(
            "vi-VN",
            { hour: "2-digit", minute: "2-digit" }
          )}`,
        };
        return targetUpdated;
      }
      return b;
    });

    saveBookings(updated);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(targetUpdated || null);
    }
    if (targetUpdated) syncBookingToExpert(targetUpdated);
    toast.success("Đã xác nhận thu tiền tại quầy thành công!");
  };

  const handleUpdateStatus = (
    id: string,
    newStatus: BookingStatus,
    extra?: Partial<ExtendedBooking>
  ) => {
    if (isReadOnly) return;
    // Animora v1.4: Vòng đời là Đang làm -> Hoàn thành -> Lễ tân thu tiền (Đã thu) & xuất hóa đơn.
    // Không chặn chuyển Hoàn thành với đơn trả sau chưa thu tiền.
    let targetUpdated: ExtendedBooking | undefined;
    const updated = bookings.map((b) => {
      if (b.id === id) {
        targetUpdated = {
          ...b,
          status: newStatus,
          ...(newStatus === "Đã xác nhận" ? { confirmedAt: new Date().toISOString() } : {}),
          ...(newStatus === "Hoàn thành" ? { completedAt: new Date().toISOString() } : {}),
          ...(newStatus === "Đã hủy" ? { cancelledAt: new Date().toISOString() } : {}),
          ...extra,
        };
        return targetUpdated;
      }
      return b;
    });

    saveBookings(updated);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(targetUpdated || null);
    }
    if (targetUpdated) syncBookingToExpert(targetUpdated);

    const statusText =
      newStatus === "Đã xác nhận"
        ? "Đã duyệt lịch hẹn thành công!"
        : newStatus === "Hoàn thành"
          ? "Đã đánh dấu hoàn thành dịch vụ!"
          : "Đã hủy lịch hẹn.";
    toast.success(statusText);
  };

  const handleReassignStaff = (id: string, staffId: string) => {
    if (isReadOnly) return;
    const staff = ASSIGNABLE_STAFF_OPTIONS.find((s) => s.id === staffId);
    if (!staff) return;
    let targetUpdated: ExtendedBooking | undefined;
    const updated = bookings.map((b) => {
      if (b.id === id) {
        targetUpdated = {
          ...b,
          doctorId: staff.id,
          staffName: staff.name,
          internalNote: `Điều phối sang ${staff.name}`,
        };
        return targetUpdated;
      }
      return b;
    });
    saveBookings(updated);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(targetUpdated || null);
    }
    if (targetUpdated) syncBookingToExpert(targetUpdated);
    toast.success(`Đã điều phối lịch cho ${staff.name}`);
  };

  const handleOpenCancelModal = (booking: ExtendedBooking) => {
    if (isReadOnly) return;
    if (isBookingFinalized(booking)) {
      toast.error("Lịch hẹn đã bàn giao hoặc kết thúc, không thể hủy lịch.");
      return;
    }
    setSelectedBooking(booking);
    const bookingDate = parseBookingStart(booking.date, booking.timeSlot);
    const assessment = assessCancellation(bookingDate);
    const hasCancelFee = assessment.feePercent > 0;
    setIsCancelFeeApplicable(hasCancelFee);
    setApplyHalfFee(hasCancelFee);
    setCancelAssessmentNotice(
      `Lịch hẹn còn cách ${
        assessment.hoursBefore === Infinity ? "N/A" : assessment.hoursBefore.toFixed(1)
      }h. ${assessment.label}`
    );
    setCancelReasonOption(CANCEL_REASON_OPTIONS[0]);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (isReadOnly || !selectedBooking) return;
    if (isBookingFinalized(selectedBooking)) {
      toast.error("Lịch hẹn đã bàn giao hoặc kết thúc, không thể hủy lịch.");
      setCancelModalOpen(false);
      return;
    }
    if (cancelReasonOption === "Khác" && !cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy lịch!");
      return;
    }
    const price = selectedBooking.price || 300000;
    const fee = applyHalfFee ? Math.round(price * 0.3) : 0;
    const resolvedReason =
      cancelReasonOption === "Khác" ? cancelReason.trim() : cancelReasonOption;

    handleUpdateStatus(selectedBooking.id, "Đã hủy", {
      cancelReason: resolvedReason,
      cancellationFee: fee,
    });

    setCancelModalOpen(false);
    setCancelReasonOption(CANCEL_REASON_OPTIONS[0]);
    setCancelReason("");
    setApplyHalfFee(false);
    setIsCancelFeeApplicable(false);
  };

  const handleReschedule = () => {
    if (isReadOnly || !selectedBooking) return;
    if (isBookingFinalized(selectedBooking)) {
      toast.error("Lịch hẹn đã bàn giao hoặc kết thúc, không thể đổi lịch.");
      setIsRescheduleModalOpen(false);
      return;
    }
    if (!newDate) {
      toast.error("Vui lòng chọn ngày mới!");
      return;
    }

    let targetUpdated: ExtendedBooking | undefined;
    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        targetUpdated = {
          ...b,
          date: newDate,
          timeSlot: newTime || b.timeSlot,
          internalNote: `Đổi lịch từ ${formatDateDdMmYyyy(b.date)} sang ${formatDateDdMmYyyy(
            newDate
          )} (${newTime || b.timeSlot})`,
        };
        return targetUpdated;
      }
      return b;
    });

    saveBookings(updated);
    if (selectedBooking) setSelectedBooking(targetUpdated || null);
    if (targetUpdated) syncBookingToExpert(targetUpdated);
    setIsRescheduleModalOpen(false);
    toast.success(
      `Đã dời lịch sang ${formatDateDdMmYyyy(newDate)} lúc ${newTime || "giờ cũ"}!`
    );
  };

  const handleResetData = () => {
    if (isReadOnly) return;
    saveBookings(buildDefaultBookings());
    safeSetStorage("animora_bookings_seed_version_v2", BOOKINGS_SEED_VERSION);
    toast.info("Đã khôi phục dữ liệu mẫu ban đầu.");
  };

  const serviceOptions = Array.from(
    new Set(bookings.map((b) => (b.service || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "vi"));

  const staffOptions = Array.from(
    new Set([
      ...ASSIGNABLE_STAFF_OPTIONS.map((s) => s.name),
      ...bookings.map((b) => (b.staffName || "").trim()).filter(Boolean),
    ])
  ).sort((a, b) => a.localeCompare(b, "vi"));

  const hasActiveFilters =
    filterService !== "all" ||
    filterStaff !== "all" ||
    filterTimeSlot !== "all" ||
    filterPayment !== "all";

  const bookingsMatchingBaseFilters = bookings.filter((b) => {
    const matchService =
      filterService === "all"
        ? true
        : (b.service || "").trim().toLowerCase() === filterService.toLowerCase();

    const matchStaff =
      filterStaff === "all"
        ? true
        : (b.staffName || "").trim().toLowerCase() === filterStaff.toLowerCase();

    const matchTimeSlot = matchesBookingWeekFilter(b.date, filterTimeSlot);

    const isPaid = isBookingPaid(b);
    const isOnline = b.paymentMethod === "online" || b.paymentTiming === "prepaid";
    const matchPayment =
      filterPayment === "all"
        ? true
        : filterPayment === "online"
          ? isOnline
          : filterPayment === "counter"
            ? !isOnline
            : filterPayment === "paid"
              ? isPaid
              : !isPaid;

    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      b.fullName.toLowerCase().includes(query) ||
      b.phone.includes(query) ||
      (b.petName && b.petName.toLowerCase().includes(query)) ||
      (b.code && b.code.toLowerCase().includes(query)) ||
      (b.staffName && b.staffName.toLowerCase().includes(query)) ||
      b.service.toLowerCase().includes(query);

    return matchService && matchStaff && matchTimeSlot && matchPayment && matchSearch;
  });

  const baseFilteredBookings = sortBookingsByNearestTime(
    bookingsMatchingBaseFilters.filter((b) =>
      filterStatus === "all"
        ? true
        : filterStatus === "Mới"
          ? b.status === "Mới" || !b.status
          : b.status === filterStatus
    )
  );

  const filteredBookings = sortKey
    ? [...baseFilteredBookings].sort((a, b) => {
        const dir = sortOrder === "asc" ? 1 : -1;
        const valA =
          sortKey === "code"
            ? a.code || a.id || ""
            : sortKey === "client"
              ? a.fullName || ""
              : sortKey === "pet"
                ? a.petName || ""
                : `${a.date || ""}T${(a.timeSlot || "00:00").slice(0, 5)}`;
        const valB =
          sortKey === "code"
            ? b.code || b.id || ""
            : sortKey === "client"
              ? b.fullName || ""
              : sortKey === "pet"
                ? b.petName || ""
                : `${b.date || ""}T${(b.timeSlot || "00:00").slice(0, 5)}`;
        return valA.localeCompare(valB, "vi") * dir;
      })
    : baseFilteredBookings;

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBookings = filteredBookings.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            {isReadOnly ? "Tra Cứu Đặt Lịch & Dịch Vụ" : "Quản Lý Lịch Hẹn & Dịch Vụ"}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isReadOnly
              ? "Tra cứu trạng thái ca hẹn, chính sách hủy và tiến độ hồ sơ chăm sóc"
              : "Điều phối ca hẹn, duyệt lịch trực tuyến, áp dụng chính sách hủy và cấu hình biểu phí dịch vụ"}
          </p>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={handleResetData}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted transition-colors text-zinc-600 dark:text-muted-foreground cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Dữ liệu mẫu</span>
          </button>
        )}
      </div>

      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1.5 bg-white dark:bg-card border border-zinc-200/80 dark:border-border p-1.5 rounded-2xl shadow-sm w-fit">
            <button
              type="button"
              onClick={() => setMainTab("bookings")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mainTab === "bookings"
                  ? "bg-[#6B1F2E] text-white shadow-sm dark:bg-primary dark:text-primary-foreground"
                  : "bg-zinc-50/80 dark:bg-muted/40 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted"
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Lịch Hẹn &amp; Điều Phối Ca</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  mainTab === "bookings"
                    ? "bg-white/20 text-white dark:bg-black/15 dark:text-primary-foreground"
                    : "bg-zinc-200/80 text-zinc-700 dark:bg-muted dark:text-muted-foreground"
                }`}
              >
                {bookings.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMainTab("services")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mainTab === "services"
                  ? "bg-[#6B1F2E] text-white shadow-sm dark:bg-primary dark:text-primary-foreground"
                  : "bg-zinc-50/80 dark:bg-muted/40 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Cấu Hình Dịch Vụ &amp; Thanh Toán</span>
            </button>
          </div>

          {mainTab === "services" && (
            <button
              type="button"
              onClick={() => setAddServiceSignal((n) => n + 1)}
              className="px-4 py-2.5 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm dịch vụ mới</span>
            </button>
          )}
        </div>
      )}

      {!isReadOnly && mainTab === "services" ? (
        <ServiceConfigTab addSignal={addServiceSignal} />
      ) : (
        <>
          <BookingsFilterBar
            bookingsMatchingBaseFilters={bookingsMatchingBaseFilters}
            searchQuery={searchQuery}
            onChangeSearch={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            filterStatus={filterStatus}
            onChangeStatus={(s) => {
              setFilterStatus(s);
              setCurrentPage(1);
            }}
            filterService={filterService}
            onChangeService={(s) => {
              setFilterService(s);
              setCurrentPage(1);
            }}
            filterStaff={filterStaff}
            onChangeStaff={(s) => {
              setFilterStaff(s);
              setCurrentPage(1);
            }}
            filterTimeSlot={filterTimeSlot}
            onChangeTimeSlot={(slot) => {
              setFilterTimeSlot(slot);
              setCurrentPage(1);
            }}
            filterPayment={filterPayment}
            onChangePayment={(p) => {
              setFilterPayment(p);
              setCurrentPage(1);
            }}
            serviceOptions={serviceOptions}
            staffOptions={staffOptions}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={() => {
              setFilterService("all");
              setFilterStaff("all");
              setFilterTimeSlot("all");
              setFilterPayment("all");
              setCurrentPage(1);
            }}
          />

          <BookingsTable
            readOnly={isReadOnly}
            totalFilteredCount={filteredBookings.length}
            bookings={paginatedBookings}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onToggleSort={handleToggleSort}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onSelectBooking={setSelectedBooking}
            onQuickConfirm={undefined}
          />
        </>
      )}

      <BookingDetailDrawer
        readOnly={isReadOnly}
        selectedBooking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onReassignStaff={isReadOnly ? undefined : handleReassignStaff}
        onConfirmCounterPayment={undefined}
        onUpdateStatus={undefined}
        onOpenReschedule={
          isReadOnly
            ? undefined
            : (booking) => {
                setNewDate(booking.date);
                setNewTime(booking.timeSlot || "09:00 - 10:30");
                setIsRescheduleModalOpen(true);
              }
        }
        onOpenCancel={isReadOnly ? undefined : handleOpenCancelModal}
      />

      {!isReadOnly && (
        <BookingsModals
          selectedBooking={selectedBooking}
          isRescheduleModalOpen={isRescheduleModalOpen}
          setIsRescheduleModalOpen={setIsRescheduleModalOpen}
          newDate={newDate}
          setNewDate={setNewDate}
          newTime={newTime}
          setNewTime={setNewTime}
          onConfirmReschedule={handleReschedule}
          cancelModalOpen={cancelModalOpen}
          setCancelModalOpen={setCancelModalOpen}
          cancelAssessmentNotice={cancelAssessmentNotice}
          cancelReasonOption={cancelReasonOption}
          setCancelReasonOption={setCancelReasonOption}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          isCancelFeeApplicable={isCancelFeeApplicable}
          applyHalfFee={applyHalfFee}
          setApplyHalfFee={setApplyHalfFee}
          onConfirmCancel={handleConfirmCancel}
        />
      )}
    </div>
  );
}
