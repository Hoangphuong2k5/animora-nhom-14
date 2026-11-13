"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  CalendarCheck,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShiftSlot {
  id: string;
  dayIndex: number; // 0 = T2, 1 = T3, ..., 6 = CN
  timeSlot: string;
  staffId: string;
  staffName: string;
  staffColor: string;
  type: "booked" | "free" | "leave";
  bookingCode?: string;
  petName?: string;
  service?: string;
}

const STAFF_PROFILES = [
  { id: "st-1", name: "BS. CKI Quốc Hùng", color: "#6B1F2E", bgLight: "bg-[#6B1F2E]/10 border-[#6B1F2E]/30 text-[#6B1F2E] dark:text-[#FF7F6B]" },
  { id: "st-2", name: "Groomer Thảo Vy", color: "#EC4899", bgLight: "bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400" },
  { id: "st-3", name: "Groomer Hoàng Toàn", color: "#F59E0B", bgLight: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" },
  { id: "st-4", name: "BS. Hoàng Mai", color: "#10B981", bgLight: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
];

const DAYS_OF_WEEK = [
  { label: "Thứ 2", date: "03/11" },
  { label: "Thứ 3", date: "04/11" },
  { label: "Thứ 4", date: "05/11" },
  { label: "Thứ 5", date: "06/11" },
  { label: "Thứ 6", date: "07/11" },
  { label: "Thứ 7", date: "08/11" },
  { label: "Chủ Nhật", date: "09/11" },
];

const TIME_SLOTS = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "13:30 - 15:00",
  "15:00 - 16:30",
  "16:30 - 18:00",
];

const INITIAL_SHIFTS: ShiftSlot[] = [
  // Thứ 2
  { id: "s1", dayIndex: 0, timeSlot: "08:30 - 10:00", staffId: "st-1", staffName: "BS. CKI Quốc Hùng", staffColor: "#6B1F2E", type: "booked", bookingCode: "BK-9821", petName: "Bơ (Corgi)", service: "Khám Tổng Quát" },
  { id: "s2", dayIndex: 0, timeSlot: "10:00 - 11:30", staffId: "st-2", staffName: "Groomer Thảo Vy", staffColor: "#EC4899", type: "booked", bookingCode: "BK-9822", petName: "Miu (Mèo Ba Tư)", service: "Spa Cắt Tỉa" },
  { id: "s3", dayIndex: 0, timeSlot: "13:30 - 15:00", staffId: "st-3", staffName: "Groomer Hoàng Toàn", staffColor: "#F59E0B", type: "free" },

  // Thứ 3
  { id: "s4", dayIndex: 1, timeSlot: "08:30 - 10:00", staffId: "st-2", staffName: "Groomer Thảo Vy", staffColor: "#EC4899", type: "booked", bookingCode: "BK-9825", petName: "Rex (Golden)", service: "Tắm Thảo Dược" },
  { id: "s5", dayIndex: 1, timeSlot: "13:30 - 15:00", staffId: "st-1", staffName: "BS. CKI Quốc Hùng", staffColor: "#6B1F2E", type: "free" },
  { id: "s6", dayIndex: 1, timeSlot: "15:00 - 16:30", staffId: "st-4", staffName: "BS. Hoàng Mai", staffColor: "#10B981", type: "leave" },

  // Thứ 4
  { id: "s7", dayIndex: 2, timeSlot: "10:00 - 11:30", staffId: "st-1", staffName: "BS. CKI Quốc Hùng", staffColor: "#6B1F2E", type: "booked", bookingCode: "BK-9830", petName: "Kuro (Shiba)", service: "Tiêm Vaccine 7 Bệnh" },
  { id: "s8", dayIndex: 2, timeSlot: "15:00 - 16:30", staffId: "st-3", staffName: "Groomer Hoàng Toàn", staffColor: "#F59E0B", type: "booked", bookingCode: "BK-9831", petName: "Bông Gòn (Mèo ALN)", service: "Spa Vệ Sinh Tai Móng" },

  // Thứ 5
  { id: "s9", dayIndex: 3, timeSlot: "08:30 - 10:00", staffId: "st-3", staffName: "Groomer Hoàng Toàn", staffColor: "#F59E0B", type: "free" },
  { id: "s10", dayIndex: 3, timeSlot: "13:30 - 15:00", staffId: "st-2", staffName: "Groomer Thảo Vy", staffColor: "#EC4899", type: "booked", bookingCode: "BK-9838", petName: "Max (Poodle)", service: "Cắt Tạo Kiểu Gấu Bông" },

  // Thứ 6
  { id: "s11", dayIndex: 4, timeSlot: "10:00 - 11:30", staffId: "st-1", staffName: "BS. CKI Quốc Hùng", staffColor: "#6B1F2E", type: "booked", bookingCode: "BK-9842", petName: "Mít (Pug)", service: "Nội Soi Tiêu Hóa" },
  { id: "s12", dayIndex: 4, timeSlot: "16:30 - 18:00", staffId: "st-2", staffName: "Groomer Thảo Vy", staffColor: "#EC4899", type: "free" },

  // Thứ 7
  { id: "s13", dayIndex: 5, timeSlot: "08:30 - 10:00", staffId: "st-1", staffName: "BS. CKI Quốc Hùng", staffColor: "#6B1F2E", type: "booked", bookingCode: "BK-9850", petName: "Bơ (Corgi)", service: "Kiểm Tra Khớp" },
  { id: "s14", dayIndex: 5, timeSlot: "10:00 - 11:30", staffId: "st-3", staffName: "Groomer Hoàng Toàn", staffColor: "#F59E0B", type: "booked", bookingCode: "BK-9852", petName: "Sữa (Mèo)", service: "Combo Tắm Khô" },
  { id: "s15", dayIndex: 5, timeSlot: "13:30 - 15:00", staffId: "st-2", staffName: "Groomer Thảo Vy", staffColor: "#EC4899", type: "booked", bookingCode: "BK-9855", petName: "Lulu (Mèo)", service: "Grooming VIP" },

  // Chủ Nhật
  { id: "s16", dayIndex: 6, timeSlot: "08:30 - 10:00", staffId: "st-2", staffName: "Groomer Thảo Vy", staffColor: "#EC4899", type: "free" },
  { id: "s17", dayIndex: 6, timeSlot: "15:00 - 16:30", staffId: "st-3", staffName: "Groomer Hoàng Toàn", staffColor: "#F59E0B", type: "booked", bookingCode: "BK-9860", petName: "Rio (Parrot)", service: "Tỉa Móng & Cánh" },
];

export default function AdminSchedulePage() {
  const [shifts, setShifts] = useState<ShiftSlot[]>(INITIAL_SHIFTS);
  const [filterStaff, setFilterStaff] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New shift form
  const [targetDay, setTargetDay] = useState(0);
  const [targetSlot, setTargetSlot] = useState(TIME_SLOTS[0]);
  const [targetStaff, setTargetStaff] = useState(STAFF_PROFILES[0].id);
  const [targetType, setTargetType] = useState<"booked" | "free" | "leave">("free");
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Conflict detection
  const checkConflict = (day: number, slot: string, staffId: string) => {
    const existing = shifts.find(
      (s) => s.dayIndex === day && s.timeSlot === slot && s.staffId === staffId
    );
    if (existing) {
      return `Chuyên viên này đã được xếp ca "${existing.type === "booked" ? "Có khách" : "Ca trực"}" vào khung giờ này!`;
    }
    return null;
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = checkConflict(targetDay, targetSlot, targetStaff);
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
      type: targetType,
      ...(targetType === "booked"
        ? {
            bookingCode: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
            petName: "Bé cưng khách mới",
            service: "Khám / Spa dịch vụ",
          }
        : {}),
    };

    setShifts((prev) => [...prev, newShift]);
    setIsAddModalOpen(false);
    setConflictWarning(null);
    toast.success(`Đã phân ca cho ${staffObj.name} vào ${DAYS_OF_WEEK[targetDay].label}!`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Lịch Làm Việc & Xếp Ca Chuyên Viên
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Ma trận điều phối ca làm theo màu sắc chuyên viên, phát hiện xung đột lịch và phân bổ ca trống
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Switch week/month */}
          <Tabs
            value={viewMode}
            onValueChange={(val) => {
              if (val) setViewMode(val as "week" | "month");
            }}
          >
            <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
              <TabsTrigger
                value="week"
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                Theo Tuần
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                Theo Tháng
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <button
            type="button"
            onClick={() => {
              setConflictWarning(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Phân ca mới</span>
          </button>
        </div>
      </div>

      {/* 2. Staff Color Legend & Filter */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-500">Mã màu chuyên viên:</span>
          <div className="flex flex-wrap items-center gap-2">
            {STAFF_PROFILES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStaff(filterStaff === st.id ? "all" : st.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  filterStaff === st.id
                    ? "ring-2 ring-zinc-900 dark:ring-primary font-extrabold"
                    : "opacity-90 hover:opacity-100"
                } ${st.bgLight}`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                <span>{st.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shift status labels */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-500 self-end sm:self-auto">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Ca có khách
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Ca trống sẵn sàng
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-400" /> Nghỉ phép
          </span>
        </div>
      </div>

      {/* 3. Schedule Matrix Grid (Weekly Calendar) */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Week Header */}
          <div className="grid grid-cols-8 gap-2 border-b border-zinc-200 dark:border-border pb-3 mb-3 text-xs">
            <div className="font-bold text-zinc-400 uppercase tracking-wider py-1">Khung giờ</div>
            {DAYS_OF_WEEK.map((d, idx) => (
              <div key={idx} className="text-center">
                <div className="font-bold text-zinc-900 dark:text-foreground">{d.label}</div>
                <div className="text-[11px] text-zinc-400">{d.date}</div>
              </div>
            ))}
          </div>

          {/* Time Slots Rows */}
          <div className="space-y-3">
            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="grid grid-cols-8 gap-2 items-stretch text-xs">
                {/* Time Slot Label */}
                <div className="flex items-center font-semibold text-zinc-500 bg-zinc-50 dark:bg-muted/60 rounded-2xl px-2.5 py-2 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-zinc-400 mr-1.5 shrink-0" />
                  <span>{slot}</span>
                </div>

                {/* 7 Days Columns */}
                {DAYS_OF_WEEK.map((_, dayIdx) => {
                  const matchingShifts = shifts.filter(
                    (s) =>
                      s.dayIndex === dayIdx &&
                      s.timeSlot === slot &&
                      (filterStaff === "all" || s.staffId === filterStaff)
                  );

                  return (
                    <div
                      key={dayIdx}
                      className="min-h-[82px] p-1.5 rounded-2xl border border-zinc-100 dark:border-border/80 bg-zinc-50/50 dark:bg-card/40 space-y-1.5 flex flex-col justify-center"
                    >
                      {matchingShifts.length === 0 ? (
                        <div className="text-center text-[10px] text-zinc-300 dark:text-muted-foreground italic">
                          Trống
                        </div>
                      ) : (
                        matchingShifts.map((sh) => (
                          <div
                            key={sh.id}
                            className={`p-2 rounded-xl border text-[11px] transition-all hover:shadow-sm ${
                              sh.type === "booked"
                                ? "bg-white dark:bg-muted border-zinc-200 dark:border-border"
                                : sh.type === "free"
                                ? "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/40 text-sky-800 dark:text-sky-300"
                                : "bg-zinc-100 dark:bg-muted text-zinc-400 border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-foreground truncate">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: sh.staffColor }}
                              />
                              <span className="truncate">{sh.staffName.split(" ").slice(-2).join(" ")}</span>
                            </div>

                            {sh.type === "booked" && (
                              <div className="mt-1 text-[10px] space-y-0.5">
                                <div className="font-semibold text-[#6B1F2E] dark:text-[#FF7F6B] truncate">
                                  {sh.petName}
                                </div>
                                <div className="text-zinc-400 truncate">{sh.service}</div>
                              </div>
                            )}

                            {sh.type === "free" && (
                              <div className="mt-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                                Sẵn sàng nhận ca
                              </div>
                            )}

                            {sh.type === "leave" && (
                              <div className="mt-0.5 text-[10px] italic text-zinc-400">Nghỉ phép</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Modal Phân Ca Mới & Xung Đột */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => setIsAddModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#FF7F6B]" />
              Phân Ca Làm Việc & Trực Khám
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

          <form onSubmit={handleCreateShift} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Chuyên viên:</label>
              <Select
                value={targetStaff}
                onValueChange={(val) => {
                  if (val !== null) {
                    setTargetStaff(val);
                    setConflictWarning(null);
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
                <label className="font-semibold text-zinc-500 block mb-1">Ngày làm việc:</label>
                <Select
                  value={String(targetDay)}
                  onValueChange={(val) => {
                    if (val !== null) {
                      setTargetDay(Number(val));
                      setConflictWarning(null);
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
                <label className="font-semibold text-zinc-500 block mb-1">Khung ca:</label>
                <Select
                  value={targetSlot}
                  onValueChange={(val) => {
                    if (val !== null) {
                      setTargetSlot(val);
                      setConflictWarning(null);
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
              <label className="font-semibold text-zinc-500 block mb-1">Trạng thái ca:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "free", label: "Ca trống" },
                  { id: "booked", label: "Có khách đặt" },
                  { id: "leave", label: "Nghỉ ca" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetType(t.id as any)}
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
                onClick={() => setIsAddModalOpen(false)}
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
    </div>
  );
}

