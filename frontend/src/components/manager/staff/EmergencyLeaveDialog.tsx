"use client";

import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { getTodayLocalIso } from "@/utils/dateFormat";
import { createEmergencyLeaveByManager } from "@/utils/clinicalSync";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ExpertAppointment, ExpertProfile } from "@/types/expert.type";

interface EmergencyLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expertProfiles: ExpertProfile[];
  onCreated: (result: {
    staffName: string;
    date: string;
    appointments: ExpertAppointment[];
  }) => void;
}

export function EmergencyLeaveDialog({
  open,
  onOpenChange,
  expertProfiles,
  onCreated,
}: EmergencyLeaveDialogProps) {
  const [staffId, setStaffId] = useState<string>("exp-spa-01");
  const [date, setDate] = useState<string>(() =>
    typeof window !== "undefined" ? getTodayLocalIso() : "2026-11-22"
  );
  const [reason, setReason] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createEmergencyLeaveByManager(staffId, date, reason);
    if (!res.ok) {
      toast.error(res.error || "Không thể tạo bản ghi nghỉ đột xuất.");
      return;
    }
    const staffName =
      expertProfiles.find((p) => p.id === staffId)?.fullName || staffId;
    onCreated({
      staffName,
      date,
      appointments: res.impactedAppointments,
    });
    setReason("");
    onOpenChange(false);
    toast.success(
      `Đã ghi nhận nghỉ đột xuất cho ${staffName} (${res.impactedAppointments.length} lịch hẹn cần điều phối).`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            Ghi nhận Nghỉ đột xuất (BS &amp; NVCS)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Quy trình nghỉ đột xuất: Nhân sự gọi video call báo Quản lý → Quản lý tạo bản ghi nghỉ đột xuất, trừ vào quỹ 4 ngày/tháng, khóa slot ngay và điều phối các ca bị ảnh hưởng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground block">
              Nhân sự (Bác sĩ / NV Chăm sóc) *
            </label>
            <Select
              value={staffId}
              onValueChange={(val) => {
                if (val) setStaffId(val);
              }}
            >
              <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                <SelectValue>
                  {expertProfiles.find((p) => p.id === staffId)?.fullName ||
                    "Chọn nhân sự"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {expertProfiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.fullName} ({p.expertType === "vet" ? "Bác sĩ" : "NV Chăm sóc"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground block">
              Ngày nghỉ đột xuất (Cả ngày, T2–T7) *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground block">
              Lý do &amp; ghi nhận xác minh video call *
            </label>
            <Textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: NV gọi video call lúc 07:15 báo sốt cao đột xuất, đã xác minh..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
            >
              Khóa lịch &amp; Tạo nghỉ đột xuất
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

