// Repository bệnh án (MED-01/02/03) — theo schema Animora v1.5 mới.
// bookings -> appointments; experts -> staff_profiles (BS =
// staff_role = 'BS' AND is_active = 1, nối users để kiểm tra ACTIVE).
// Quyền bác sĩ với 1 lịch hẹn: có dòng trong appointment_items với
// assigned_staff_user_id = user_id của bác sĩ.
// Ghi chú: MED-03 dùng chung createPrescriptionWithItems của
// prescription.repository (không còn versioning — hủy đơn cũ + kê mới).
import { AppDataSource } from '../config/data-source.js';
import { MedicalRecordEntity } from '../entities/medical.entity.js';
import { ApiError } from '../utils/ApiError.js';

const getMedicalRecordRepo = (manager = null) => (manager || AppDataSource).getRepository(MedicalRecordEntity);

// Bác sĩ thú y đã được phê duyệt: staff_profiles.staff_role = 'BS',
// is_active = 1, và tài khoản users đang ACTIVE.
// Trả về dòng staff_profiles; doctor_user_id = user_id (không còn experts.id).
const findApprovedVetByUserId = async (userId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT sp.staff_id, sp.user_id, sp.staff_code, sp.staff_role
     FROM dbo.staff_profiles sp
     INNER JOIN dbo.users u ON u.user_id = sp.user_id
     WHERE sp.user_id = @0 AND sp.staff_role = 'BS' AND sp.is_active = 1
       AND u.account_status = 'ACTIVE'`,
    [Number(userId)],
  );
  return rows[0] || null;
};

const findAppointmentById = async (appointmentId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(`SELECT * FROM dbo.appointments WHERE appointment_id = @0`, [Number(appointmentId)]);
  return rows[0] || null;
};

// Bác sĩ có được giao lịch hẹn này không (qua appointment_items)?
const isVetAssignedToAppointment = async (vetUserId, appointmentId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT COUNT(*) AS c FROM dbo.appointment_items
     WHERE appointment_id = @0 AND assigned_staff_user_id = @1`,
    [Number(appointmentId), Number(vetUserId)],
  );
  return Number(rows[0].c) > 0;
};

// Bác sĩ có lịch hẹn hợp lệ với thú này không (MED-01)?
const countValidAppointments = async (vetUserId, petId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT COUNT(DISTINCT a.appointment_id) AS c
     FROM dbo.appointments a
     INNER JOIN dbo.appointment_items ai ON ai.appointment_id = a.appointment_id
     WHERE ai.assigned_staff_user_id = @0 AND a.pet_id = @1
       AND a.appointment_status IN ('CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED')`,
    [Number(vetUserId), Number(petId)],
  );
  return Number(rows[0].c);
};

const findMedicalRecordById = async (medicalRecordId, manager = null) => {
  return getMedicalRecordRepo(manager).findOne({ where: { medical_record_id: Number(medicalRecordId) } });
};

const findMedicalRecordByAppointmentId = async (appointmentId, manager = null) => {
  return getMedicalRecordRepo(manager).findOne({ where: { appointment_id: Number(appointmentId) } });
};

const findMedicalHistoryByPetId = async (petId, manager = null) => {
  return getMedicalRecordRepo(manager).find({
    where: { pet_id: Number(petId) },
    order: { visit_date: 'DESC' },
  });
};

const createMedicalRecord = async (recordData, manager = null) => {
  const record = getMedicalRecordRepo(manager).create(recordData);
  return getMedicalRecordRepo(manager).save(record);
};

const updateMedicalRecord = async (medicalRecordId, recordData, manager = null) => {
  const repo = getMedicalRecordRepo(manager);
  await repo.update({ medical_record_id: Number(medicalRecordId) }, recordData);
  return findMedicalRecordById(medicalRecordId, manager);
};

export {
  findApprovedVetByUserId,
  findAppointmentById,
  isVetAssignedToAppointment,
  countValidAppointments,
  findMedicalRecordById,
  findMedicalRecordByAppointmentId,
  findMedicalHistoryByPetId,
  createMedicalRecord,
  updateMedicalRecord,
};
