"use client";

import { useState, useEffect, useMemo } from "react";
import { ExpertAppointment } from "@/types/expert.type";

export function useScheduleWeek(appointments: ExpertAppointment[]) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [todayIso, setTodayIso] = useState<string>("2026-11-04");

  useEffect(() => {
    setTodayIso(new Date().toISOString().slice(0, 10));
  }, []);

  // Generate 7 days of the current viewed week (starts Monday)
  const weekDays = useMemo(() => {
    const baseDate = new Date(`${todayIso}T00:00:00`);
    const currentDay = baseDate.getDay(); // 0 is Sunday
    // Start week on Monday
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const baseMonday = new Date(baseDate);
    baseMonday.setDate(baseDate.getDate() + mondayOffset + currentWeekOffset * 7);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const isToday = iso === todayIso;
      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      return {
        date: d,
        iso,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        isToday,
      };
    });
  }, [currentWeekOffset, todayIso]);

  // Check for conflict (overlapping appointments on the same hour)
  const conflictsByDate = useMemo(() => {
    const map: Record<string, boolean> = {};
    const appointmentsByDay: Record<string, string[]> = {};

    appointments.forEach((a) => {
      if (a.status === "cancelled") return;
      const day = a.startAt.slice(0, 10);
      const time = a.startAt.slice(11, 16);
      if (!appointmentsByDay[day]) appointmentsByDay[day] = [];
      if (appointmentsByDay[day].includes(time)) {
        map[day] = true;
      } else {
        appointmentsByDay[day].push(time);
      }
    });

    return map;
  }, [appointments]);

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

