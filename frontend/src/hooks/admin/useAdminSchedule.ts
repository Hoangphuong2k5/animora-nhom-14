import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import {
  AggregatedShiftRequest,
  assignManagerShiftToExpert,
  EXPERT_SYNC_EVENT,
  readAllExpertShiftRequests,
  updateExpertShiftRequestDecision,
} from "@/utils/clinicalSync";
import {
  checkShiftConflict,
  DAYS_OF_WEEK,
  INITIAL_SHIFTS,
  ShiftSlot,
  STAFF_PROFILES,
  TIME_SLOTS,
} from "@/components/admin/schedule/scheduleData";

/** Manages weekly staff schedule matrix, shift assignment, and leave/OT request approvals. */
export function useAdminSchedule() {
  const [shifts, setShifts] = useState<ShiftSlot[]>(INITIAL_SHIFTS);
  const [filterStaff, setFilterStaff] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [targetDay, setTargetDay] = useState(0);
  const [targetSlot, setTargetSlot] = useState(TIME_SLOTS[0]);
  const [targetStaff, setTargetStaff] = useState(STAFF_PROFILES[0].id);
  const [targetType, setTargetType] = useState<
    "booked" | "free" | "leave" | "rotational_off"
  >("free");
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const [staffRequests, setStaffRequests] = useState<AggregatedShiftRequest[]>(
    []
  );
  const [requestRoleFilter, setRequestRoleFilter] = useState<
    "all" | "care" | "vet" | "pending"
  >("all");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const syncAllStores = () => {
      setStaffRequests(readAllExpertShiftRequests());
      const saved = safeGetStorage<ShiftSlot[]>("animora_schedule_shifts_v2", []);
      if (Array.isArray(saved) && saved.length > 0) {
        setShifts(saved);
      }
    };
    queueMicrotask(syncAllStores);
    window.addEventListener(EXPERT_SYNC_EVENT, syncAllStores);
    return () => window.removeEventListener(EXPERT_SYNC_EVENT, syncAllStores);
  }, []);

  const handleReviewStaffRequest = (
    expertId: string,
    reqId: string,
    staffName: string,
    decision: "approved" | "rejected"
  ) => {
    const note = reviewNotes[reqId];
    updateExpertShiftRequestDecision(expertId, reqId, decision, note);
    setStaffRequests(readAllExpertShiftRequests());
    toast.success(
      decision === "approved"
        ? `Đã duyệt yêu cầu và đồng bộ sang lịch làm việc của ${staffName}!`
        : `Đã từ chối yêu cầu và phản hồi tới ${staffName}.`
    );
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = checkShiftConflict(shifts, targetDay, targetSlot, targetStaff);
    if (conflict) {
      setConflictWarning(conflict);
      toast.error(conflict);
      return;
    }

    const staffObj = STAFF_PROFILES.find((s) => s.id === targetStaff)!;
    const newShift: ShiftSlot = {
      id: `shift-${Date.now()}`,
      dayIndex: targetDay,
      timeSlot: targetSlot,
      staffId: targetStaff,
      staffName: staffObj.name,
      staffColor: staffObj.color,
      type: targetType === "rotational_off" ? "leave" : targetType,
      ...(targetType === "booked"
        ? {
            bookingCode: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
            petName: "Bé cưng khách mới",
            service: "Khám / Spa dịch vụ",
          }
        : targetType === "rotational_off"
        ? {
            service: "Nghỉ luân phiên (4 ngày/tháng)",
          }
        : {}),
    };

    setShifts((prev) => {
      const updated = [...prev, newShift];
      safeSetStorage("animora_schedule_shifts_v2", updated);
      return updated;
    });

    if (staffObj.linkedExpertId) {
      const baseDate = new Date();
      const targetDateObj = new Date(baseDate);
      targetDateObj.setDate(baseDate.getDate() + targetDay);
      const isoDate = targetDateObj.toISOString().slice(0, 10);
      const shiftCode =
        targetSlot.startsWith("08") || targetSlot.startsWith("10")
          ? "morning"
          : "afternoon";

      assignManagerShiftToExpert(
        staffObj.linkedExpertId,
        isoDate,
        shiftCode,
        targetType === "rotational_off" ? "rotational_off" : "fixed"
      );
    }

    setIsAddModalOpen(false);
    setConflictWarning(null);
    toast.success(
      `Đã phân ca cho ${staffObj.name} vào ${DAYS_OF_WEEK[targetDay].label}!`
    );
  };

  return {
    shifts,
    filterStaff,
    setFilterStaff,
    viewMode,
    setViewMode,
    isAddModalOpen,
    setIsAddModalOpen,
    targetDay,
    setTargetDay,
    targetSlot,
    setTargetSlot,
    targetStaff,
    setTargetStaff,
    targetType,
    setTargetType,
    conflictWarning,
    setConflictWarning,
    staffRequests,
    requestRoleFilter,
    setRequestRoleFilter,
    reviewNotes,
    setReviewNotes,
    handleReviewStaffRequest,
    handleCreateShift,
  };
}
