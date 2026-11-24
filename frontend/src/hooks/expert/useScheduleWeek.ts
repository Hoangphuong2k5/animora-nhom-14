"use client";

import { useState, useMemo } from "react";
import { ExpertAppointment, ExpertServiceDef } from "@/types/expert.type";
import { getTodayLocalIso } from "@/utils/dateFormat";
import { getCurrentWeekMondayIso } from "@/utils/expertPolicy";

function parseTimeToMinutes(hhmm: string): number | null {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export function useScheduleWeek(
  appointments: ExpertAppointment[],
  services: ExpertServiceDef[] = []
) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [todayIso] = useState<string>(() =>
    typeof window !== "undefined" ? getTodayLocalIso() : "2026-11-17"
  );

  // Generate 7 days of the current viewed week (starts Monday)
  const weekDays = useMemo(() => {
    const baseMonday = new Date(`${getCurrentWeekMondayIso(todayIso)}T00:00:00`);
    baseMonday.setDate(baseMonday.getDate() + currentWeekOffset * 7);

    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + i);
      const iso = getTodayLocalIso(d);
      const isToday = iso === todayIso;
      return {
        date: d,
        iso,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        isToday,
      };
    });
  }, [currentWeekOffset, todayIso]);

  // Kiểm tra xung đột lịch theo khoảng thời lượng thực tế [startMin, endMin) & chạm khung nghỉ trưa 12:00–13:00
  const conflictsByDate = useMemo(() => {
    const map: Record<string, boolean> = {};
    const intervalsByDay: Record<string, Array<{ start: number; end: number }>> = {};

    const LUNCH_START = 12 * 60;
    const LUNCH_END = 13 * 60;

    appointments.forEach((a) => {
      if (a.status === "cancelled") return;
      const day = a.startAt.slice(0, 10);
      const startMin = parseTimeToMinutes(a.startAt.slice(11, 16));
      if (startMin === null) return;

      const srv = services.find((s) => s.id === a.serviceId);
      const duration = srv?.durationMin || 45;
      const endMin = startMin + duration;

      // Cảnh báo nếu lịch tràn vào giờ nghỉ trưa cố định 12:00–13:00
      if (startMin < LUNCH_END && endMin > LUNCH_START) {
        map[day] = true;
      }

      if (!intervalsByDay[day]) intervalsByDay[day] = [];
      const hasOverlap = intervalsByDay[day].some(
        (existing) => startMin < existing.end && endMin > existing.start
      );
      if (hasOverlap) {
        map[day] = true;
      }
      intervalsByDay[day].push({ start: startMin, end: endMin });
    });

    return map;
  }, [appointments, services]);

  const goToNextWeek = () => setCurrentWeekOffset((prev) => prev + 1);
  const goToPrevWeek = () => setCurrentWeekOffset((prev) => prev - 1);
  const goToCurrentWeek = () => setCurrentWeekOffset(0);

  return {
    currentWeekOffset,
    setCurrentWeekOffset,
    weekDays,
    conflictsByDate,
    todayIso,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
  };
}

