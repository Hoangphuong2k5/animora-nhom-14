"use client";

import React, { useEffect, useState } from "react";
import {
  BriefcaseMedical,
  Calendar,
  CalendarCheck,
  Dog,
  FileHeart,
  LayoutDashboard,
  Pill,
  Scissors,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import { useExpert } from "./ExpertProvider";
import { useExpertT } from "./expertI18n";
import { ROUTES } from "@/constants/config.constant";
import { PortalSidebar, PortalMenuItem } from "@/components/shared/portal";
import {
  MEDICINE_BOX_SYNC_EVENT,
  readMedicineBoxRequests,
} from "@/utils/medicineBoxSync";

export function ExpertSidebar() {
  const { profile, isVet, isPartTime, store } = useExpert();
  const { t } = useExpertT();
  const [pendingMedBoxCount, setPendingMedBoxCount] = useState(0);

  useEffect(() => {
    const syncCount = () => {
      const reqs = readMedicineBoxRequests();
      setPendingMedBoxCount(
        reqs.filter((r) => r.status === "pending" && r.expertId === profile.id).length
      );
    };
    syncCount();
    window.addEventListener(MEDICINE_BOX_SYNC_EVENT, syncCount);
    window.addEventListener("storage", syncCount);
    return () => {
      window.removeEventListener(MEDICINE_BOX_SYNC_EVENT, syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, [profile.id]);

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
      href: ROUTES.EXPERT_MEDICINE_BOX,
      label: `${t.menu.medicineBox} [Bác sĩ]`,
      icon: BriefcaseMedical,
      exact: false,
      badge: pendingMedBoxCount > 0 ? String(pendingMedBoxCount) : null,
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
              <span>
                {t.groomerRoleLabel} ({isPartTime ? "Part-time" : "Full-time"})
              </span>
            </>
          )}
        </div>
      }
      menuItems={menuItems}
    />
  );
}
