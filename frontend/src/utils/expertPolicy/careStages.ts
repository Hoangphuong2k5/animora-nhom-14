import type { CareServiceStage } from "@/types/expert.type";

export const CARE_SERVICE_STAGES: ReadonlyArray<{
  id: CareServiceStage;
  stepNumber: number;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: "checked_in",
    stepNumber: 1,
    label: "Đã tiếp nhận & kiểm tra lông/da/tâm lý bé",
    shortLabel: "Tiếp nhận",
    description:
      "Kiểm tra tình trạng lông, da, tai móng và mức độ hợp tác trước khi làm.",
  },
  {
    id: "performing",
    stepNumber: 2,
    label: "Đang thực hiện dịch vụ chăm sóc / Spa",
    shortLabel: "Đang thực hiện",
    description:
      "Tiến hành tắm thảo mộc, cắt tỉa tạo kiểu, vệ sinh tai/móng và chăm sóc lông da.",
  },
  {
    id: "finishing",
    stepNumber: 3,
    label: "Hoàn thiện, sấy tạo kiểu & kiểm tra cuối",
    shortLabel: "Hoàn thiện",
    description:
      "Sấy khô êm ái, chải tạo kiểu, kiểm tra lại tai/móng và vệ sinh khu vực bàn làm việc.",
  },
  {
    id: "ready_handover",
    stepNumber: 4,
    label: "Hoàn tất dịch vụ chăm sóc & bàn giao bé",
    shortLabel: "Hoàn tất (Xong)",
    description:
      "Đã hoàn tất dịch vụ chăm sóc (Xong), ghi nhận tình trạng bé và tính 1 ca hoàn thành.",
  },
];

export function getCareStageMeta(stage?: CareServiceStage) {
  return (
    CARE_SERVICE_STAGES.find((s) => s.id === stage) ?? CARE_SERVICE_STAGES[0]
  );
}

export function getNextCareStage(
  current?: CareServiceStage
): CareServiceStage | null {
  if (!current) return "checked_in";
  const idx = CARE_SERVICE_STAGES.findIndex((s) => s.id === current);
  if (idx < 0 || idx >= CARE_SERVICE_STAGES.length - 1) return null;
  return CARE_SERVICE_STAGES[idx + 1].id;
}

