import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ADMIN_RESCHEDULE_SLOTS,
  ExtendedBooking,
} from "@/hooks/admin/useAdminBookings";

interface AdminBookingModalsProps {
  selectedBooking: ExtendedBooking | null;
  isRescheduleOpen: boolean;
  newDate: string;
  newTime: string;
  onRescheduleOpenChange: (open: boolean) => void;
  onChangeNewDate: (date: string) => void;
  onChangeNewTime: (time: string) => void;
  onConfirmReschedule: () => void;
  isCancelOpen: boolean;
  cancelReason: string;
  applyHalfFee: boolean;
  onCancelOpenChange: (open: boolean) => void;
  onChangeCancelReason: (reason: string) => void;
  onChangeApplyHalfFee: (apply: boolean) => void;
  onConfirmCancel: () => void;
}

export const AdminBookingModals = ({
  selectedBooking,
  isRescheduleOpen,
  newDate,
  newTime,
  onRescheduleOpenChange,
  onChangeNewDate,
  onChangeNewTime,
  onConfirmReschedule,
  isCancelOpen,
  cancelReason,
  applyHalfFee,
  onCancelOpenChange,
  onChangeCancelReason,
  onChangeApplyHalfFee,
  onConfirmCancel,
}: AdminBookingModalsProps) => {
  const slotOptions =
    newTime && !ADMIN_RESCHEDULE_SLOTS.includes(newTime)
      ? [newTime, ...ADMIN_RESCHEDULE_SLOTS]
      : ADMIN_RESCHEDULE_SLOTS;

  return (
    <>
      <Dialog open={isRescheduleOpen} onOpenChange={onRescheduleOpenChange}>
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold">
              Đổi Thời Gian Hẹn
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Chọn ngày hẹn và khung giờ phục vụ mới cho khách hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-500 font-medium block mb-1">
                Ngày hẹn mới:
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => onChangeNewDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>
            <div>
              <label className="text-zinc-500 font-medium block mb-1">
                Khung giờ mới:
              </label>
              <Select
                value={newTime || ADMIN_RESCHEDULE_SLOTS[0]}
                onValueChange={(val) => {
                  if (val !== null) onChangeNewTime(val);
                }}
                items={Object.fromEntries(slotOptions.map((s) => [s, s]))}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {slotOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onRescheduleOpenChange(false)}
              className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirmReschedule}
              className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs cursor-pointer"
            >
              Xác nhận đổi lịch
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(isCancelOpen && selectedBooking)}
        onOpenChange={onCancelOpenChange}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] data-[size=default]:max-w-[calc(100%-2rem)] sm:max-w-md data-[size=default]:sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          {selectedBooking && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Xác Nhận Hủy Lịch Hẹn
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Bạn đang hủy lịch hẹn của khách{" "}
                  <strong>{selectedBooking.fullName}</strong> (
                  {selectedBooking.code}).
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-500 font-medium block mb-1">
                    Lý do hủy lịch:
                  </label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => onChangeCancelReason(e.target.value)}
                    placeholder="Khách bận đột xuất, không liên lạc được..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
                  <Checkbox
                    id="halfFee"
                    checked={applyHalfFee}
                    onCheckedChange={(checked) =>
                      onChangeApplyHalfFee(Boolean(checked))
                    }
                    className="mt-0.5 data-checked:bg-rose-600 data-checked:border-rose-600"
                  />
                  <label
                    htmlFor="halfFee"
                    className="text-zinc-700 dark:text-foreground/80 cursor-pointer"
                  >
                    <span className="font-bold text-rose-600 dark:text-rose-400 block">
                      Áp dụng tính phí hủy 50% (Hủy dưới 3 tiếng)
                    </span>
                    Số tiền phạt tính:{" "}
                    <strong>
                      {Math.round(
                        (selectedBooking.price || 350000) * 0.5
                      ).toLocaleString("vi-VN")}
                      ₫
                    </strong>{" "}
                    theo chính sách cam kết của Animora.
                  </label>
                </div>
              </div>

              <AlertDialogFooter className="bg-transparent border-t-0 p-0 mt-2 mx-0 mb-0">
                <AlertDialogCancel className="rounded-xl font-bold text-xs cursor-pointer">
                  Quay lại
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onConfirmCancel}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                >
                  Xác nhận hủy
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

