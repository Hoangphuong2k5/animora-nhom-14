import React from "react";
import { Clock } from "lucide-react";
import {
  DAYS_OF_WEEK,
  ShiftSlot,
  STAFF_PROFILES,
  TIME_SLOTS,
} from "./scheduleData";

interface ScheduleWeeklyMatrixProps {
  shifts: ShiftSlot[];
  filterStaff: string;
  onSelectFilterStaff: (staffId: string) => void;
  daysOfWeek?: Array<{ label: string; date: string }>;
  onSelectShift?: (shift: ShiftSlot, dayInfo?: { label: string; date: string }) => void;
}

function formatShortStaffName(name: string): string {
  const tagMatch = name.match(/\(([^)]+)\)/);
  const tagText = tagMatch?.[1] || "";
  const typeTag = /\bFT\b/i.test(tagText)
    ? " (FT)"
    : /\bPT\b/i.test(tagText)
      ? " (PT)"
      : "";
  const cleanName = name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const shortName = cleanName.split(/\s+/).slice(-2).join(" ");
  return `${shortName}${typeTag}`;
}

/** Staff color legend + 7-day weekly shift matrix grid. */
export function ScheduleWeeklyMatrix({
  shifts,
  filterStaff,
  onSelectFilterStaff,
  daysOfWeek = DAYS_OF_WEEK,
  onSelectShift,
}: ScheduleWeeklyMatrixProps) {
  return (
    <>
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-500">Mã màu chuyên viên:</span>
          <div className="flex flex-wrap items-center gap-2">
            {STAFF_PROFILES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() =>
                  onSelectFilterStaff(filterStaff === st.id ? "all" : st.id)
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  filterStaff === st.id
                    ? "ring-2 ring-zinc-900 dark:ring-primary font-extrabold"
                    : "opacity-90 hover:opacity-100"
                } ${st.bgLight}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: st.color }}
                />
                <span>{st.name}</span>
              </button>
            ))}
          </div>
        </div>

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

      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 border-b border-zinc-200 dark:border-border pb-3 mb-3 text-xs">
            <div className="font-bold text-zinc-400 uppercase tracking-wider py-1">
              Khung giờ
            </div>
            {daysOfWeek.map((d, idx) => (
              <div key={idx} className="text-center">
                <div className="font-bold text-zinc-900 dark:text-foreground">
                  {d.label}
                </div>
                <div className="text-[11px] text-zinc-400">{d.date}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot}
                className="grid grid-cols-8 gap-2 items-stretch text-xs"
              >
                <div className="flex items-center font-semibold text-zinc-500 bg-zinc-50 dark:bg-muted/60 rounded-2xl px-2.5 py-2 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-zinc-400 mr-1.5 shrink-0" />
                  <span>{slot}</span>
                </div>

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
                          <button
                            key={sh.id}
                            type="button"
                            onClick={() => onSelectShift?.(sh, daysOfWeek[dayIdx])}
                            className={`w-full text-left p-2 rounded-xl border text-[11px] transition-all hover:shadow-sm cursor-pointer ${
                              sh.type === "booked"
                                ? "bg-white dark:bg-muted border-zinc-200 dark:border-border hover:border-[#6B1F2E]/40 dark:hover:border-primary/40"
                                : sh.type === "free"
                                ? "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/40 text-sky-800 dark:text-sky-300 hover:border-sky-400"
                                : "bg-zinc-100 dark:bg-muted text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-border"
                            }`}
                          >
                            <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-foreground truncate">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: sh.staffColor }}
                              />
                              <span className="truncate">
                                {formatShortStaffName(sh.staffName)}
                              </span>
                            </div>

                            {sh.type === "booked" && (
                              <div className="mt-1 text-[10px] space-y-0.5">
                                <div className="font-semibold text-[#6B1F2E] dark:text-[#FF7F6B] truncate">
                                  {sh.petName}
                                </div>
                                <div className="text-zinc-400 truncate">
                                  {sh.service}
                                </div>
                              </div>
                            )}

                            {sh.type === "free" && (
                              <div className="mt-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                                Sẵn sàng nhận ca
                              </div>
                            )}

                            {sh.type === "leave" && (
                              <div className="mt-0.5 text-[10px] italic text-zinc-400">
                                Nghỉ phép
                              </div>
                            )}
                          </button>
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
    </>
  );
}
