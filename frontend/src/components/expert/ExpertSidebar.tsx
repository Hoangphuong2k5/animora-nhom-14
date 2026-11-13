"use client";

import React from "react";
import {
  Calendar,
  CalendarCheck,
  Dog,
  FileHeart,
  LayoutDashboard,
  Pill,
  Scissors,
  Star,
  Stethoscope,
  TrendingUp,
  User,
} from "lucide-react";
import { useExpert } from "./ExpertProvider";
import { useExpertT } from "./expertI18n";
import { ROUTES } from "@/constants/config.constant";
import { PortalSidebar, PortalMenuItem } from "@/components/shared/portal";

export function ExpertSidebar() {
  const { isVet, store } = useExpert();
  const { t } = useExpertT();

  const pendingAppointmentsCount = store.appointments.filter(
    (a) => a.status === "pending" || !!a.rescheduleRequest
  ).length;

  const pendingShiftsCount = store.shiftRequests.filter(
    (r) => r.status === "pending"
  ).length;

  const menuItems: PortalMenuItem[] = [
    {
      href: ROUTES.EXPERT,
      label: t.menu.overview,
      icon: LayoutDashboard,
      exact: true,
      badge: null,
    },
    {
      href: ROUTES.EXPERT_APPOINTMENTS,
      label: t.menu.appointments,
      icon: CalendarCheck,
      exact: false,
      badge: pendingAppointmentsCount > 0 ? String(pendingAppointmentsCount) : null,
    },
    {
      href: ROUTES.EXPERT_SCHEDULE,
      label: t.menu.schedule,
      icon: Calendar,
      exact: false,
      badge: pendingShiftsCount > 0 ? "Chờ" : null,
    },
    {
      href: ROUTES.EXPERT_CLIENTS,
      label: t.menu.clients,
      icon: Dog,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.EXPERT_HEALTH_RECORDS,
      label: t.menu.healthRecords,
      icon: FileHeart,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.EXPERT_PRESCRIPTIONS,
      label: `${t.menu.prescriptions} [Bác sĩ]`,
      icon: Pill,
      exact: false,
      badge: <Pill className="w-3 h-3" />,
      hidden: !isVet,
    },
    {
      href: ROUTES.EXPERT_REVIEWS,
      label: t.menu.reviews,
      icon: Star,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.EXPERT_EARNINGS,
      label: t.menu.earnings,
      icon: TrendingUp,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.EXPERT_PROFILE,
      label: t.menu.profile,
      icon: User,
      exact: false,
      badge: null,
    },
  ];

  return (
    <PortalSidebar
      brandHref={ROUTES.EXPERT}
      subtitle={
        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium mt-0.5">
          {isVet ? (
            <>
              <Stethoscope className="w-3 h-3 text-[#FF7F6B]" />
              <span>{t.vetRoleLabel}</span>
            </>
          ) : (
            <>
              <Scissors className="w-3 h-3 text-[#FF7F6B]" />
              <span>{t.groomerRoleLabel}</span>
            </>
          )}
        </div>
      }
      menuItems={menuItems}
    />
  );
}
