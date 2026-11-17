import React from "react";
import { AlertTriangle, CalendarCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DAYS_OF_WEEK, STAFF_PROFILES, TIME_SLOTS } from "./scheduleData";

interface AssignShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictWarning: string | null;
  onClearConflict: () => void;
  targetStaff: string;
  onChangeTargetStaff: (staffId: string) => void;
  targetDay: number;
  onChangeTargetDay: (day: number) => void;
  targetSlot: string;
  onChangeTargetSlot: (slot: string) => void;
  targetType: "booked" | "free" | "leave" | "rotational_off";
  onChangeTargetType: (
    type: "booked" | "free" | "leave" | "rotational_off"
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** Modal dialog for assigning a new shift with conflict detection. */
export function AssignShiftDialog({
  open,
  onOpenChange,
  conflictWarning,
  onClearConflict,
  targetStaff,
  onChangeTargetStaff,
  targetDay,
  onChangeTargetDay,
  targetSlot,
  onChangeTargetSlot,
  targetType,
  onChangeTargetType,
  onSubmit,
}: AssignShiftDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#FF7F6B]" />
            Phân Ca Làm Việc &amp; Trực Khám
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Chọn chuyên viên, ngày làm việc và khung ca để điều phối lịch trực.
          </DialogDescription>
        </DialogHeader>

        {conflictWarning && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Cảnh báo xung đột lịch!</span>
              {conflictWarning}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-zinc-500 block mb-1">
              Chuyên viên:
            </label>
            <Select
              value={targetStaff}
              onValueChange={(val) => {
                if (val !== null) {
                  onChangeTargetStaff(val);
                  onClearConflict();
                }
              }}
              items={Object.fromEntries(STAFF_PROFILES.map((st) => [st.id, st.name]))}
            >
              <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAFF_PROFILES.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">
                Ngày làm việc:
              </label>
              <Select
                value={String(targetDay)}
                onValueChange={(val) => {
                  if (val !== null) {
                    onChangeTargetDay(Number(val));
                    onClearConflict();
                  }
                }}
                items={Object.fromEntries(
                  DAYS_OF_WEEK.map((d, i) => [String(i), `${d.label} (${d.date})`])
                )}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((d, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {d.label} ({d.date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">
                Khung ca:
              </label>
              <Select
                value={targetSlot}
                onValueChange={(val) => {
                  if (val !== null) {
                    onChangeTargetSlot(val);
                    onClearConflict();
                  }
                }}
                items={Object.fromEntries(TIME_SLOTS.map((s) => [s, s]))}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-500 block mb-1">
              Trạng thái ca:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "free", label: "Ca trống" },
                { id: "booked", label: "Có khách đặt" },
                { id: "rotational_off", label: "Nghỉ luân phiên" },
                { id: "leave", label: "Nghỉ ca" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    onChangeTargetType(
                      t.id as "booked" | "free" | "leave" | "rotational_off"
                    )
                  }
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                    targetType === t.id
                      ? "border-[#6B1F2E] bg-[#6B1F2E]/10 text-[#6B1F2E] dark:text-[#FF7F6B]"
                      : "border-zinc-200 dark:border-border text-zinc-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer"
            >
              Lưu ca làm
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
