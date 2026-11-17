"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { COOKIE_KEYS } from "@/constants/config.constant";
import { EXPERT_TYPES, ROLES } from "@/constants/roles.constant";
import { getCurrentUser } from "@/services/auth.service";
import { getTodayLocalIso } from "@/utils/dateFormat";
import type { ActionState } from "@/types/auth.type";
import type { MedicalRecord, Prescription } from "@/types/expert.type";

/**
 * Kiểm tra phiên đăng nhập trên Server:
 * Bắt buộc vai trò Chuyên viên và loại chuyên viên phải là Bác Sĩ Thú Y (vet).
 */
async function verifyVetSession(): Promise<
  { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> } | { ok: false; error: string }
> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const user = await getCurrentUser(token);

  if (!user || user.role !== ROLES.EXPERT) {
    return { ok: false, error: "Bạn không có quyền truy cập vào chức năng của Chuyên viên!" };
  }

  if (user.expertType !== EXPERT_TYPES.VET) {
    return {
      ok: false,
      error: "Hành động này CHỈ DÀNH RIÊNG cho Bác sĩ thú y đã được xác thực chứng chỉ hành nghề!",
    };
  }

  return { ok: true, user };
}

// ==========================================
// 1. KÊ ĐƠN THUỐC [BÁC SĨ]
// ==========================================
const prescriptionSchema = z.object({
  petId: z.string().min(1, "Vui lòng chọn thú cưng"),
  ownerId: z.string().min(1, "Vui lòng chọn chủ nuôi"),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(3, "Vui lòng nhập chẩn đoán bệnh"),
  severity: z.enum(["mild", "severe"]),
  refillsAllowed: z.number().int().min(0, "Số lượt tái cấp phải >= 0"),
  refillInstruction: z.string().optional(),
  lines:
    z.array(
      z.object({
        medicineId: z.string().min(1, "Vui lòng chọn thuốc"),
        dosage: z.string().min(1, "Nhập liều dùng"),
        days: z.number().int().min(1, "Số ngày dùng tối thiểu là 1"),
        instruction: z.string().min(3, "Nhập hướng dẫn sử dụng"),
      })
    )
    .min(1, "Đơn thuốc phải có ít nhất 1 loại thuốc"),
  note: z.string().optional(),
});

export async function createPrescriptionAction(
  payload: unknown
): Promise<ActionState<Prescription>> {
  const check = await verifyVetSession();
  if (!check.ok) {
    return { success: false, message: check.error };
  }

  const parsed = prescriptionSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: "Dữ liệu kê đơn chưa hợp lệ",
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path.join(".")), i.message])
      ),
    };
  }

  const data = parsed.data;

  // Giữ số lượt tái cấp bác sĩ nhập (ca nặng mặc định 0 nếu bác sĩ không chỉ định khác)
  const finalRefills = data.severity === "severe" ? 0 : data.refillsAllowed;

  const newPrescription: Prescription = {
    id: `rx-${Date.now()}`,
    code: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    expertId: String(check.user.id),
    petId: data.petId,
    ownerId: data.ownerId,
    appointmentId: data.appointmentId,
    issuedAt: getTodayLocalIso(),
    diagnosis: data.diagnosis,
    severity: data.severity,
    lines: data.lines,
    refillsAllowed: finalRefills,
    refillInstruction: data.refillInstruction?.trim() || undefined,
    refillsUsed: 0,
    refillLog: [],
    note:
      data.severity === "severe"
        ? (data.note ? `${data.note} • ` : "") +
          "Bệnh nặng: Khuyến cáo tái khám trực tiếp tại phòng khám."
        : data.note,
  };

  return {
    success: true,
    message: "Bác sĩ đã phát hành đơn thuốc thành công!",
    data: newPrescription,
  };
}

// ==========================================
// 2. GHI BỆNH ÁN KHÁM BỆNH [BÁC SĨ]
// ==========================================
const medicalRecordSchema = z.object({
  petId: z.string().min(1, "Vui lòng chọn thú cưng"),
  appointmentId: z.string().optional(),
  symptoms: z.string().min(3, "Vui lòng nhập triệu chứng lâm sàng"),
  diagnosis: z.string().min(3, "Vui lòng nhập chẩn đoán"),
  severity: z.enum(["mild", "severe"]),
  weightKg: z.number().positive("Cân nặng phải lớn hơn 0"),
  temperatureC: z.number().min(35).max(43, "Nhiệt độ cơ thể không hợp lệ (35°C - 43°C)"),
  note: z.string().optional(),
  nextVaccineDate: z.string().optional(),
  nextDewormDate: z.string().optional(),
  revisitDate: z.string().optional(),
  prescriptionId: z.string().optional(),
});

export async function saveMedicalRecordAction(
  payload: unknown
): Promise<ActionState<MedicalRecord>> {
  const check = await verifyVetSession();
  if (!check.ok) {
    return { success: false, message: check.error };
  }

  const parsed = medicalRecordSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: "Dữ liệu bệnh án chưa hợp lệ",
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path.join(".")), i.message])
      ),
    };
  }

  const data = parsed.data;

  const record: MedicalRecord = {
    id: `rec-${Date.now()}`,
    petId: data.petId,
    appointmentId: data.appointmentId,
    expertId: String(check.user.id),
    date: new Date().toISOString().slice(0, 10),
    symptoms: data.symptoms,
    diagnosis: data.diagnosis,
    severity: data.severity,
    weightKg: data.weightKg,
    temperatureC: data.temperatureC,
    note: data.note,
    nextVaccineDate: data.nextVaccineDate,
    nextDewormDate: data.nextDewormDate,
    revisitDate: data.revisitDate,
    prescriptionId: data.prescriptionId,
  };

  return {
    success: true,
    message: "Bác sĩ đã lưu bệnh án vào sổ sức khỏe thành công!",
    data: record,
  };
}

