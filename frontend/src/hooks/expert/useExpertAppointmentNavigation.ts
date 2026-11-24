"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/config.constant";
import type { ExpertAppointment } from "@/types/expert.type";

/**
 * Hook điều hướng dùng chung cho AppointmentDrawer ở các trang Tổng quan, Lịch hẹn và Lịch làm việc.
 */
export function useExpertAppointmentNavigation(
  fallbackAppointment?: ExpertAppointment | null
) {
  const router = useRouter();

  const openMedicalModal = useCallback(
    (appt?: ExpertAppointment) => {
      const target = appt || fallbackAppointment;
      if (!target) {
        router.push(ROUTES.EXPERT_HEALTH_RECORDS_NEW);
        return;
      }
      if (target.medicalRecordId) {
        router.push(`${ROUTES.EXPERT_HEALTH_RECORDS}?petId=${target.petId}`);
        return;
      }
      router.push(
        `${ROUTES.EXPERT_HEALTH_RECORDS_NEW}?appointmentId=${target.id}&petId=${target.petId}`
      );
    },
    [fallbackAppointment, router]
  );

  const openPrescriptionWizard = useCallback(
    (appt?: ExpertAppointment) => {
      const target = appt || fallbackAppointment;
      router.push(
        target
          ? `${ROUTES.EXPERT_PRESCRIPTIONS_NEW}?appointmentId=${target.id}&petId=${target.petId}`
          : ROUTES.EXPERT_PRESCRIPTIONS_NEW
      );
    },
    [fallbackAppointment, router]
  );

  return { openMedicalModal, openPrescriptionWizard };
}

