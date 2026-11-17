import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { Booking, BookingStatus } from "@/types";
import { createLiveSeededServiceBookings } from "@/data/serviceBookingData";
import {
  ADMIN_BOOKINGS_SYNC_EVENT,
  confirmCareServiceResultInStores,
} from "@/utils/clinicalSync";

export const ADMIN_RESCHEDULE_SLOTS = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "13:30 - 15:00",
  "15:00 - 16:30",
  "16:30 - 18:00",
];

export interface ExtendedBooking extends Booking {
  staffName?: string;
  price?: number;
  paymentMethod?: "online" | "counter";
  paymentStatus?: "paid" | "unpaid";
  cancellationFee?: number;
  prescription?: string;
}

const TEAM_SPECIALIST_NAMES = [
  "BS. Lê Huy Hoàng",
  "Phan Thị Đình Thùy",
  "BS. Nguyễn Thúc Hoàng Phương",
  "Nguyễn Văn Tuấn Anh",
  "BS. Ngô Phước Toàn",
];

function createSeededAdminBookings(includePrescription = true): ExtendedBooking[] {
  return createLiveSeededServiceBookings().map((b, i) => ({
    ...b,
    staffName: TEAM_SPECIALIST_NAMES[i % TEAM_SPECIALIST_NAMES.length],
    price: b.service.includes("Spa")
      ? 350000
      : b.service.includes("Khám")
      ? 300000
      : 250000,
    paymentMethod: (i % 3 === 0 ? "counter" : "online") as "counter" | "online",
    paymentStatus: (i % 4 === 0 ? "unpaid" : "paid") as "unpaid" | "paid",
    ...(includePrescription && i % 2 === 0
      ? {
          prescription:
            "Vitamin B-Complex 1 viên/ngày x 7 ngày. Giữ ấm vết mổ.",
        }
      : {}),
  }));
}

/**
 * Manages Admin Bookings list, filters, drawer selection, status transitions,
 * rescheduling, and cancellation with optional 50% penalty fee.
 */
export function useAdminBookings() {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [filterStaff, setFilterStaff] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(
    null
  );
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [applyHalfFee, setApplyHalfFee] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadFromStorage = () => {
      if (cancelled) return;
      const saved = safeGetStorage<ExtendedBooking[]>("animora_bookings_v2", []);
      if (Array.isArray(saved) && saved.length > 0) {
        setBookings(saved);
        setSelectedBooking((prev) =>
          prev ? saved.find((b) => b.id === prev.id) || prev : null
        );
      } else {
        const seeded = createSeededAdminBookings(true);
        setBookings(seeded);
        safeSetStorage("animora_bookings_v2", seeded);
      }
    };

    queueMicrotask(loadFromStorage);
    window.addEventListener(ADMIN_BOOKINGS_SYNC_EVENT, loadFromStorage);
    return () => {
      cancelled = true;
      window.removeEventListener(ADMIN_BOOKINGS_SYNC_EVENT, loadFromStorage);
    };
  }, []);

  const saveBookings = (updated: ExtendedBooking[]) => {
    setBookings(updated);
    safeSetStorage("animora_bookings_v2", updated);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("animora_bookings_sync"));
    }
  };

  const handleUpdateStatus = (
    id: string,
    newStatus: BookingStatus,
    extra?: Partial<ExtendedBooking>
  ) => {
    const updated = bookings.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          status: newStatus,
          ...(newStatus === "Đã xác nhận"
            ? { confirmedAt: new Date().toISOString() }
            : {}),
          ...(newStatus === "Hoàn thành"
            ? { completedAt: new Date().toISOString() }
            : {}),
          ...(newStatus === "Đã hủy"
            ? { cancelledAt: new Date().toISOString() }
            : {}),
          ...extra,
        };
      }
      return b;
    });

    saveBookings(updated);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(updated.find((b) => b.id === id) || null);
    }

    const statusText =
      newStatus === "Đã xác nhận"
        ? "Đã duyệt lịch hẹn thành công!"
        : newStatus === "Hoàn thành"
        ? "Đã đánh dấu hoàn thành dịch vụ!"
        : "Đã hủy lịch hẹn.";
    toast.success(statusText);
  };

  const handleConfirmCancel = () => {
    if (!selectedBooking) return;
    const price = selectedBooking.price || 300000;
    const fee = applyHalfFee ? Math.round(price * 0.5) : 0;

    handleUpdateStatus(selectedBooking.id, "Đã hủy", {
      cancelReason:
        cancelReason ||
        (applyHalfFee
          ? "Hủy sát giờ hẹn (dưới 3h) - Áp dụng phạt 50%"
          : "Khách yêu cầu hủy"),
      cancellationFee: fee,
    });

    setCancelModalOpen(false);
    setCancelReason("");
    setApplyHalfFee(false);
  };

  const handleReschedule = () => {
    if (!selectedBooking || !newDate) {
      toast.error("Vui lòng chọn ngày mới!");
      return;
    }

    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          date: newDate,
          timeSlot: newTime || b.timeSlot,
          internalNote: `Đổi lịch từ ${b.date} sang ${newDate} (${newTime || b.timeSlot})`,
        };
      }
      return b;
    });

    saveBookings(updated);
    if (selectedBooking) {
      setSelectedBooking(updated.find((b) => b.id === selectedBooking.id) || null);
    }
    setIsRescheduleModalOpen(false);
    toast.success(`Đã dời lịch sang ${newDate} lúc ${newTime || "giờ cũ"}!`);
  };

  const handleConfirmCareService = (id: string, note?: string) => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return;
    const nowIso = new Date().toISOString().slice(0, 16);
    const finalNote =
      note?.trim() || "Đã kiểm tra và xác nhận kết quả dịch vụ đạt chuẩn bàn giao.";

    const updated = bookings.map((b) =>
      b.id === id
        ? {
            ...b,
            careStage: b.careStage || ("ready_handover" as const),
            managerConfirmedAt: nowIso,
            managerConfirmedBy: "Manager",
            managerConfirmNote: finalNote,
          }
        : b
    );
    saveBookings(updated);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(updated.find((b) => b.id === id) || null);
    }

    confirmCareServiceResultInStores(
      target.code || target.id,
      "Manager",
      finalNote
    );
    toast.success("Đã xác nhận trạng thái/kết quả dịch vụ và đồng bộ tới nhân viên!");
  };

  const handleResetData = () => {
    const seeded = createSeededAdminBookings(false);
    saveBookings(seeded);
    toast.info("Đã khôi phục dữ liệu mẫu ban đầu.");
  };

  const openRescheduleForSelected = () => {
    if (!selectedBooking) return;
    setNewDate(selectedBooking.date);
    setNewTime(selectedBooking.timeSlot || "09:00 - 10:30");
    setIsRescheduleModalOpen(true);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "Mới"
          ? b.status === "Mới" || !b.status
          : b.status === filterStatus;

      const matchService =
        filterService === "all"
          ? true
          : b.service.toLowerCase().includes(filterService.toLowerCase());

      const matchStaff =
        filterStaff === "all"
          ? true
          : (b.staffName || "").toLowerCase().includes(filterStaff.toLowerCase());

      const matchPayment =
        filterPayment === "all" ? true : b.paymentMethod === filterPayment;

      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        b.fullName.toLowerCase().includes(query) ||
        b.phone.includes(query) ||
        (b.petName && b.petName.toLowerCase().includes(query)) ||
        (b.code && b.code.toLowerCase().includes(query)) ||
        b.service.toLowerCase().includes(query);

      return (
        matchStatus &&
        matchService &&
        matchStaff &&
        matchPayment &&
        matchSearch
      );
    });
  }, [
    bookings,
    filterStatus,
    filterService,
    filterStaff,
    filterPayment,
    searchQuery,
  ]);

  return {
    bookings,
    filteredBookings,
    filterStatus,
    setFilterStatus,
    filterService,
    setFilterService,
    filterStaff,
    setFilterStaff,
    filterPayment,
    setFilterPayment,
    searchQuery,
    setSearchQuery,
    selectedBooking,
    setSelectedBooking,
    isRescheduleModalOpen,
    setIsRescheduleModalOpen,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    cancelModalOpen,
    setCancelModalOpen,
    cancelReason,
    setCancelReason,
    applyHalfFee,
    setApplyHalfFee,
    handleUpdateStatus,
    handleConfirmCancel,
    handleReschedule,
    handleConfirmCareService,
    handleResetData,
    openRescheduleForSelected,
  };
}

