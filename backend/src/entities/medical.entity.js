// Entity bệnh án thú y, theo đúng schema Animora v1.5 mới
// (dbo.medical_records, file Animora_v1.5__1___1.sql):
//  - PK id -> medical_record_id; vet_id -> doctor_user_id (users.user_id);
//  - booking_id -> appointment_id (UNIQUE, 1 bệnh án / 1 lịch hẹn);
//  - SOAP đầy đủ: subjective_symptoms, objective_findings,
//    assessment_diagnosis (NOT NULL), plan_treatment, doctor_advice,
//    care_notes_for_staff; severity_level MILD/SEVERE;
//  - record_code bắt buộc (VD: EMR-20261124-000001);
//  - visit_date là DATE theo giờ địa phương UTC+7.
import { EntitySchema } from 'typeorm';

const MedicalRecordEntity = new EntitySchema({
  name: 'MedicalRecord',
  tableName: 'medical_records',
  columns: {
    medical_record_id: { type: 'bigint', primary: true, generated: 'increment' },
    record_code: { type: 'nvarchar', length: 30, nullable: false },
    pet_id: { type: 'bigint', nullable: false },
    appointment_id: { type: 'bigint', nullable: false },
    doctor_user_id: { type: 'bigint', nullable: false },
    visit_date: { type: 'date', nullable: false },
    actual_weight_kg: { type: 'decimal', precision: 6, scale: 2, nullable: true },
    temperature_c: { type: 'decimal', precision: 4, scale: 1, nullable: true },
    subjective_symptoms: { type: 'nvarchar', length: 'MAX', nullable: true },
    objective_findings: { type: 'nvarchar', length: 'MAX', nullable: true },
    assessment_diagnosis: { type: 'nvarchar', length: 'MAX', nullable: false },
    severity_level: { type: 'nvarchar', length: 10, default: 'MILD' }, // MILD, SEVERE
    plan_treatment: { type: 'nvarchar', length: 'MAX', nullable: true },
    doctor_advice: { type: 'nvarchar', length: 'MAX', nullable: true },
    care_notes_for_staff: { type: 'nvarchar', length: 1000, nullable: true },
    follow_up_date: { type: 'date', nullable: true },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
    updated_at: { type: 'datetime2', precision: 0, updateDate: true },
  },
});

export { MedicalRecordEntity };
