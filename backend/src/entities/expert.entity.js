import { EntitySchema } from 'typeorm';

/**
 * Entities phân hệ Nhân sự / Chuyên viên - ánh xạ với AnimoraDB_Complete_ver1_5_Clean.sql
 * Bảng: EmployeeProfiles, EmployeeCertificates, EmployeeCertificateApprovals, WorkShifts, EmployeeWorkSchedules, Reviews
 */
const ExpertEntity = new EntitySchema({
  name: 'Expert',
  tableName: 'EmployeeProfiles',
  columns: {
    EmployeeID: { type: 'bigint', primary: true, generated: 'increment' },
    UserID: { type: 'bigint', unique: true, nullable: false },
    FullName: { type: 'nvarchar', length: 150, nullable: false },
    EmployeeType: { type: 'nvarchar', length: 30, nullable: false }, // Doctor | CareStaff | Other
    DateOfBirth: { type: 'date', nullable: true },
    HireDate: { type: 'date', nullable: true },
    EmploymentType: { type: 'nvarchar', length: 30, nullable: true }, // FullTime | PartTime
    Address: { type: 'nvarchar', length: 500, nullable: true },
    EmergencyContactName: { type: 'nvarchar', length: 150, nullable: true },
    EmergencyContactPhone: { type: 'nvarchar', length: 20, nullable: true },
    Specialization: { type: 'nvarchar', length: 200, nullable: true },
    Biography: { type: 'nvarchar', length: 2000, nullable: true },
    AvatarUrl: { type: 'nvarchar', length: 1000, nullable: true },
    YearsOfExperience: { type: 'int', nullable: true },
    IsActive: { type: 'bit', default: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const ExpertCertificateEntity = new EntitySchema({
  name: 'ExpertCertificate',
  tableName: 'EmployeeCertificates',
  columns: {
    CertificateID: { type: 'bigint', primary: true, generated: 'increment' },
    EmployeeID: { type: 'bigint', nullable: false },
    CertificateName: { type: 'nvarchar', length: 200, nullable: false },
    CertificateNumber: { type: 'nvarchar', length: 100, nullable: true },
    IssuingOrganization: { type: 'nvarchar', length: 200, nullable: true },
    IssuedDate: { type: 'date', nullable: true },
    ExpiryDate: { type: 'date', nullable: true },
    CertificateUrl: { type: 'nvarchar', length: 1000, nullable: true },
    ApprovalStatus: { type: 'nvarchar', length: 30, default: 'Pending' }, // Pending | Approved | Rejected | Expired
    SubmittedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const CertificateApprovalEntity = new EntitySchema({
  name: 'CertificateApproval',
  tableName: 'EmployeeCertificateApprovals',
  columns: {
    ApprovalID: { type: 'bigint', primary: true, generated: 'increment' },
    CertificateID: { type: 'bigint', nullable: false },
    ReviewedByUserID: { type: 'bigint', nullable: false },
    ApprovalStatus: { type: 'nvarchar', length: 30, nullable: false }, // Approved | Rejected
    ReviewNotes: { type: 'nvarchar', length: 1000, nullable: true },
    ReviewedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const WorkShiftEntity = new EntitySchema({
  name: 'WorkShift',
  tableName: 'WorkShifts',
  columns: {
    WorkShiftID: { type: 'int', primary: true, generated: 'increment' },
    ShiftName: { type: 'nvarchar', length: 100, nullable: false },
    StartTime: { type: 'time', precision: 0, nullable: false },
    EndTime: { type: 'time', precision: 0, nullable: false },
    BreakMinutes: { type: 'int', default: 0 },
    IsOvernight: { type: 'bit', default: false },
    IsActive: { type: 'bit', default: true },
  },
});

const ExpertScheduleEntity = new EntitySchema({
  name: 'ExpertSchedule',
  tableName: 'EmployeeWorkSchedules',
  columns: {
    EmployeeWorkScheduleID: { type: 'bigint', primary: true, generated: 'increment' },
    EmployeeID: { type: 'bigint', nullable: false },
    WorkShiftID: { type: 'int', nullable: false },
    WorkDate: { type: 'date', nullable: false },
    ScheduleStatus: { type: 'nvarchar', length: 30, default: 'Scheduled' }, // Scheduled | Confirmed | Cancelled
    CreatedByUserID: { type: 'bigint', nullable: false },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const ExpertReviewEntity = new EntitySchema({
  name: 'ExpertReview',
  tableName: 'Reviews',
  columns: {
    ReviewID: { type: 'bigint', primary: true, generated: 'increment' },
    CustomerID: { type: 'bigint', nullable: false },
    AppointmentID: { type: 'bigint', nullable: false },
    ServiceID: { type: 'bigint', nullable: true },
    EmployeeID: { type: 'bigint', nullable: true },
    Rating: { type: 'tinyint', nullable: false },
    ReviewContent: { type: 'nvarchar', length: 2000, nullable: true },
    ReviewStatus: { type: 'nvarchar', length: 30, default: 'Published' }, // Published | Hidden | Removed
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

export {
  ExpertEntity,
  ExpertCertificateEntity,
  CertificateApprovalEntity,
  WorkShiftEntity,
  ExpertScheduleEntity,
  ExpertReviewEntity,
};
export default {
  ExpertEntity,
  ExpertCertificateEntity,
  CertificateApprovalEntity,
  WorkShiftEntity,
  ExpertScheduleEntity,
  ExpertReviewEntity,
};
