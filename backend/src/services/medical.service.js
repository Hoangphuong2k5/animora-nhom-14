// Service bệnh án (MED-01/02/03) — theo schema Animora v1.5 mới.
// Bác sĩ = staff_profiles.staff_role = 'BS' AND is_active = 1, tài khoản ACTIVE.
// doctor_user_id = users.user_id (không còn experts.id).
// Ngày khám lấy từ appointments.scheduled_date, giờ địa phương UTC+7.
// MED-02 lưu SOAP sẽ: đồng bộ cân vào pets.weight_kg (+ weight_source
// 'DOCTOR_VERIFIED', ghi pet_weight_logs nguồn SOAP_EXAM) và khóa
// medical_locked = 1 (KH không sửa được 4 trường y tế nữa).
// MED-03 kê lại: hủy các đơn ISSUED của bệnh án (CANCELLED) rồi kê đơn mới
// (D2(a) — không còn version/parent_id).
import { AppDataSource } from '../config/data-source.js';
import * as medicalRepository from '../repositories/medical.repository.js';
import * as petRepository from '../repositories/pet-phuong.repository.js';
import * as prescriptionRepository from '../repositories/prescription.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { generateCode } from '../utils/codeGenerator.js';

// Chuyển 1 giá trị ngày/giờ về ngày địa phương UTC+7 (v1.5 lưu DATE theo giờ VN).
function toDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const vn = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()));
}

// Kiểm tra tài khoản là bác sĩ thú y đã được phê duyệt.
const assertVerifiedVet = async (userId) => {
  const vet = await medicalRepository.findApprovedVetByUserId(userId);
  if (!vet) {
    throw new ApiError(403, 'Chỉ bác sĩ thú y mới được thực hiện thao tác này', 'FORBIDDEN');
  }
  return vet;
};

const normalizeSeverity = (value) => {
  if (!value) return null;
  const normalized = String(value).toUpperCase();
  return normalized === 'MILD' || normalized === 'SEVERE' ? normalized : null;
};

// Bệnh nặng thì không được mua lại (max_refills = 0, theo CHECK của DB).
// Bệnh nhẹ: max_refills mặc định 0, tối đa 1000.
const normalizeRefill = (severityLevel, maxRefills) => {
  if (severityLevel === 'SEVERE') return 0;
  const parsed = Number.parseInt(maxRefills, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(1000, parsed));
};

// MED-01: Bác sĩ xem lịch sử khám của 1 thú (chỉ khi có lịch hẹn hợp lệ).
const vetViewMedicalHistory = async (petId, vetUserId) => {
  const vet = await assertVerifiedVet(vetUserId);
  const validAppointments = await medicalRepository.countValidAppointments(vet.user_id, petId);
  if (validAppointments === 0) {
    throw new ApiError(403, 'Bác sĩ chưa có lịch hẹn hợp lệ với thú cưng này', 'FORBIDDEN');
  }
  return medicalRepository.findMedicalHistoryByPetId(petId);
};

// MED-01b: Khách xem lịch sử khám của thú của mình.
const listMedicalHistoryByPet = async (petId, userId) => {
  const customerId = await petRepository.findCustomerIdByUserId(userId);
  const pet = await petRepository.findById(petId);
  if (!pet || pet.customer_id !== customerId) {
    throw new ApiError(404, 'Không tìm thấy thú cưng', 'PET_NOT_FOUND');
  }
  return medicalRepository.findMedicalHistoryByPetId(petId);
};

// MED-02: Bác sĩ tạo bệnh án sau buổi khám.
const createMedicalRecord = async (vetUserId, payload) => {
  const vet = await assertVerifiedVet(vetUserId);

  const appointment = await medicalRepository.findAppointmentById(payload.appointment_id);
  if (!appointment) {
    throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'APPOINTMENT_NOT_FOUND');
  }
  if (Number(appointment.pet_id) !== Number(payload.pet_id)) {
    throw new ApiError(400, 'Lịch hẹn không thuộc về thú cưng này', 'APPOINTMENT_PET_MISMATCH');
  }
  const assigned = await medicalRepository.isVetAssignedToAppointment(vet.user_id, appointment.appointment_id);
  if (!assigned) {
    throw new ApiError(403, 'Bác sĩ không được giao lịch hẹn này', 'FORBIDDEN');
  }

  const recordData = {
    record_code: generateCode('EMR'),
    pet_id: Number(payload.pet_id),
    appointment_id: Number(payload.appointment_id),
    doctor_user_id: Number(vet.user_id),
    visit_date: toDateOnly(appointment.scheduled_date) || toDateOnly(new Date()),
    actual_weight_kg: payload.actual_weight_kg ? Number(payload.actual_weight_kg) : null,
    temperature_c: payload.temperature_c ? Number(payload.temperature_c) : null,
    subjective_symptoms: payload.subjective_symptoms || null,
    objective_findings: payload.objective_findings || null,
    assessment_diagnosis: payload.assessment_diagnosis,
    severity_level: normalizeSeverity(payload.severity_level) || 'MILD',
    plan_treatment: payload.plan_treatment || null,
    doctor_advice: payload.doctor_advice || null,
    care_notes_for_staff: payload.care_notes_for_staff || null,
    follow_up_date: payload.follow_up_date || null,
  };

  try {
    return await AppDataSource.transaction(async (manager) => {
      const record = await medicalRepository.createMedicalRecord(recordData, manager);

      // Lưu SOAP xong thì khóa hồ sơ y tế của thú (KH không sửa 4 trường y tế nữa);
      // nếu có cân lúc khám thì đồng bộ cân + ghi log cân nguồn SOAP_EXAM.
      const pet = await petRepository.findById(record.pet_id, manager);
      if (pet) {
        const lockPatch = {
          medical_locked: true,
          medical_locked_by: Number(vet.user_id),
          medical_locked_at: new Date(),
          row_version: (pet.row_version || 1) + 1,
        };
        if (recordData.actual_weight_kg) {
          lockPatch.weight_kg = Number(recordData.actual_weight_kg);
          lockPatch.weight_source = 'DOCTOR_VERIFIED';
        }
        await petRepository.updatePet(record.pet_id, lockPatch, manager);
        if (recordData.actual_weight_kg) {
          await petRepository.createWeightLog(
            {
              pet_id: record.pet_id,
              appointment_id: record.appointment_id,
              weight_kg: Number(recordData.actual_weight_kg),
              measurement_source: 'SOAP_EXAM',
              recorded_by_user_id: Number(vet.user_id),
              recorded_by_role: 'BS',
              note: null,
            },
            manager,
          );
        }
      }
      return record;
    });
  } catch (error) {
    // 1 bệnh án / 1 lịch hẹn (UNIQUE trên appointment_id) — trùng thì 409.
    if (error && (error.code === 2627 || error.code === 2601)) {
      throw new ApiError(409, 'Lịch hẹn này đã có bệnh án', 'DUPLICATE_MEDICAL_RECORD');
    }
    throw error;
  }
};

// MED-03: Bác sĩ cập nhật ghi chú bệnh án (và kê lại đơn nếu cần).
const updateMedicalNotes = async (medicalRecordId, vetUserId, payload) => {
  const vet = await assertVerifiedVet(vetUserId);
  const record = await medicalRepository.findMedicalRecordById(medicalRecordId);
  if (!record) {
    throw new ApiError(404, 'Không tìm thấy bệnh án', 'MEDICAL_RECORD_NOT_FOUND');
  }
  if (Number(record.doctor_user_id) !== Number(vet.user_id)) {
    throw new ApiError(403, 'Chỉ bác sĩ đã khám mới được sửa bệnh án này', 'FORBIDDEN');
  }

  const patch = {};
  if (payload.subjective_symptoms !== undefined) patch.subjective_symptoms = payload.subjective_symptoms;
  if (payload.objective_findings !== undefined) patch.objective_findings = payload.objective_findings;
  if (payload.assessment_diagnosis !== undefined) patch.assessment_diagnosis = payload.assessment_diagnosis;
  if (payload.severity_level !== undefined) patch.severity_level = normalizeSeverity(payload.severity_level);
  if (payload.plan_treatment !== undefined) patch.plan_treatment = payload.plan_treatment;
  if (payload.doctor_advice !== undefined) patch.doctor_advice = payload.doctor_advice;
  if (payload.care_notes_for_staff !== undefined) patch.care_notes_for_staff = payload.care_notes_for_staff;
  if (payload.follow_up_date !== undefined) patch.follow_up_date = payload.follow_up_date;
  if (payload.actual_weight_kg !== undefined) patch.actual_weight_kg = payload.actual_weight_kg;
  if (payload.temperature_c !== undefined) patch.temperature_c = payload.temperature_c;
  patch.updated_at = new Date();

  let newPrescription = null;

  const updated = await AppDataSource.transaction(async (manager) => {
    const updatedRecord = await medicalRepository.updateMedicalRecord(medicalRecordId, patch, manager);

    if (payload.new_prescription) {
      const np = payload.new_prescription;
      const severityLevel = normalizeSeverity(np.severity) || updatedRecord.severity_level || 'MILD';

      // Hủy các đơn đang phát hành của bệnh án này (D2(a)).
      const oldIssued = await prescriptionRepository.findIssuedByMedicalRecordId(medicalRecordId, manager);
      for (const oldPrescription of oldIssued) {
        await prescriptionRepository.updatePrescriptionStatus(oldPrescription.prescription_id, 'CANCELLED', manager);
      }

      // Kê đơn mới (không còn version/parent_id).
      const appointment = await medicalRepository.findAppointmentById(updatedRecord.appointment_id, manager);
      const prescriptionData = {
        prescription_code: generateCode('RX'),
        medical_record_id: updatedRecord.medical_record_id,
        appointment_id: updatedRecord.appointment_id,
        pet_id: updatedRecord.pet_id,
        customer_id: appointment ? Number(appointment.customer_id) : Number(np.customer_id),
        doctor_user_id: Number(vet.user_id),
        prescribed_date: toDateOnly(new Date()),
        severity_level: severityLevel,
        max_refills: normalizeRefill(severityLevel, np.max_refills),
        used_refills: 0,
        valid_until: np.valid_until ? toDateOnly(np.valid_until) : null,
        prescription_status: 'ISSUED',
        counter_payment_status: 'NONE',
        notes: np.notes || null,
      };

      if (np.items && np.items.length > 0) {
        const itemsWithPrice = await enrichItemsWithPrice(np.items, manager);
        newPrescription = await prescriptionRepository.createPrescriptionWithItems(prescriptionData, itemsWithPrice, manager);
      } else if (oldIssued.length > 0) {
        newPrescription = await prescriptionRepository.createPrescriptionWithItems(prescriptionData, [], manager);
        await prescriptionRepository.copyItems(newPrescription.prescription_id, oldIssued[0].prescription_id, manager);
        newPrescription.items = await prescriptionRepository.findItemsByPrescriptionId(newPrescription.prescription_id, manager);
      } else {
        newPrescription = await prescriptionRepository.createPrescriptionWithItems(prescriptionData, [], manager);
      }
    }

    return updatedRecord;
  });

  return { record: updated, new_prescription: newPrescription };
};

// Điền giá snapshot (products.unit_price) cho từng dòng thuốc.
const enrichItemsWithPrice = async (items, manager) => {
  const db = manager || AppDataSource;
  const result = [];
  for (const item of items) {
    const rows = await db.query(
      `SELECT unit_price FROM dbo.products WHERE product_id = @0`,
      [Number(item.product_id)],
    );
    if (!rows[0]) {
      throw new ApiError(404, `Không tìm thấy sản phẩm ${item.product_id}`, 'PRODUCT_NOT_FOUND');
    }
    result.push({ ...item, unit_price_snapshot: Number(rows[0].unit_price) });
  }
  return result;
};

export {
  toDateOnly,
  assertVerifiedVet,
  normalizeSeverity,
  normalizeRefill,
  vetViewMedicalHistory,
  listMedicalHistoryByPet,
  createMedicalRecord,
  updateMedicalNotes,
};
