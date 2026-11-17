import { EntitySchema } from 'typeorm';

const PetSpeciesEntity = new EntitySchema({
  name: 'PetSpecies',
  tableName: 'PetSpecies',
  columns: {
    SpeciesID: { type: 'int', primary: true, generated: 'increment' },
    SpeciesName: { type: 'nvarchar', length: 100, unique: true, nullable: false },
    Description: { type: 'nvarchar', length: 500, nullable: true },
  },
});

const PetBreedEntity = new EntitySchema({
  name: 'PetBreed',
  tableName: 'PetBreeds',
  columns: {
    BreedID: { type: 'int', primary: true, generated: 'increment' },
    SpeciesID: { type: 'int', nullable: false },
    BreedName: { type: 'nvarchar', length: 120, nullable: false },
    Description: { type: 'nvarchar', length: 500, nullable: true },
  },
});

const PetEntity = new EntitySchema({
  name: 'Pet',
  tableName: 'Pets',
  columns: {
    PetID: { type: 'bigint', primary: true, generated: 'increment' },
    SpeciesID: { type: 'int', nullable: false },
    BreedID: { type: 'int', nullable: true },
    PetName: { type: 'nvarchar', length: 120, nullable: false },
    BirthDate: { type: 'date', nullable: true },
    Gender: { type: 'nvarchar', length: 20, nullable: true },
    CurrentOwnerType: { type: 'nvarchar', length: 30, nullable: false },
    CustomerID: { type: 'bigint', nullable: true },
    RescueStationID: { type: 'bigint', nullable: true },
    Color: { type: 'nvarchar', length: 80, nullable: true },
    WeightKg: { type: 'decimal', precision: 6, scale: 2, nullable: true },
    MicrochipNumber: { type: 'nvarchar', length: 100, nullable: true },
    GeneralNotes: { type: 'nvarchar', length: 1000, nullable: true },
    IsActive: { type: 'bit', default: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
    UpdatedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const PetImageEntity = new EntitySchema({
  name: 'PetImage',
  tableName: 'PetImages',
  columns: {
    PetImageID: { type: 'bigint', primary: true, generated: 'increment' },
    PetID: { type: 'bigint', nullable: false },
    ImageUrl: { type: 'nvarchar', length: 1000, nullable: false },
    IsPrimary: { type: 'bit', default: false },
    UploadedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const MedicalRecordEntity = new EntitySchema({
  name: 'MedicalRecord',
  tableName: 'MedicalRecords',
  columns: {
    MedicalRecordID: { type: 'bigint', primary: true, generated: 'increment' },
    PetID: { type: 'bigint', nullable: false },
    AppointmentID: { type: 'bigint', nullable: true },
    DoctorEmployeeID: { type: 'bigint', nullable: false },
    RecordDate: { type: 'datetime2', precision: 0, createDate: true },
    Symptoms: { type: 'nvarchar', length: 'MAX', nullable: true },
    ExaminationNotes: { type: 'nvarchar', length: 'MAX', nullable: true },
    TreatmentPlan: { type: 'nvarchar', length: 'MAX', nullable: true },
    SeverityClass: { type: 'nvarchar', length: 10, nullable: true },
    FollowUpDate: { type: 'date', nullable: true },
    RecordStatus: { type: 'nvarchar', length: 30, default: 'Completed' },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
    UpdatedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const VaccinationRecordEntity = new EntitySchema({
  name: 'VaccinationRecord',
  tableName: 'VaccinationRecords',
  columns: {
    VaccinationRecordID: { type: 'bigint', primary: true, generated: 'increment' },
    PetID: { type: 'bigint', nullable: false },
    MedicalRecordID: { type: 'bigint', nullable: true },
    VaccineName: { type: 'nvarchar', length: 200, nullable: false },
    VaccinatedAt: { type: 'date', nullable: false },
    NextDueDate: { type: 'date', nullable: true },
    BatchNumber: { type: 'nvarchar', length: 100, nullable: true },
    Notes: { type: 'nvarchar', length: 1000, nullable: true },
  },
});

const DewormingRecordEntity = new EntitySchema({
  name: 'DewormingRecord',
  tableName: 'DewormingRecords',
  columns: {
    DewormingRecordID: { type: 'bigint', primary: true, generated: 'increment' },
    PetID: { type: 'bigint', nullable: false },
    MedicalRecordID: { type: 'bigint', nullable: true },
    ProductName: { type: 'nvarchar', length: 200, nullable: false },
    DewormedAt: { type: 'date', nullable: false },
    NextDueDate: { type: 'date', nullable: true },
    Dosage: { type: 'nvarchar', length: 100, nullable: true },
    Notes: { type: 'nvarchar', length: 1000, nullable: true },
  },
});

const PetReminderEntity = new EntitySchema({
  name: 'PetReminder',
  tableName: 'PetReminders',
  columns: {
    PetReminderID: { type: 'bigint', primary: true, generated: 'increment' },
    PetID: { type: 'bigint', nullable: false },
    CustomerID: { type: 'bigint', nullable: false },
    ReminderTypeID: { type: 'int', nullable: false },
    ReminderTitle: { type: 'nvarchar', length: 200, nullable: false },
    ReminderDescription: { type: 'nvarchar', length: 1000, nullable: true },
    RemindAt: { type: 'datetime2', precision: 0, nullable: false },
    ReminderStatus: { type: 'nvarchar', length: 30, default: 'Pending' },
    IsRecurring: { type: 'bit', default: false },
    RecurrenceRule: { type: 'nvarchar', length: 200, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

export {
  PetSpeciesEntity,
  PetBreedEntity,
  PetEntity,
  PetImageEntity,
  MedicalRecordEntity,
  VaccinationRecordEntity,
  DewormingRecordEntity,
  PetReminderEntity,
};
export default {
  PetSpeciesEntity,
  PetBreedEntity,
  PetEntity,
  PetImageEntity,
  MedicalRecordEntity,
  VaccinationRecordEntity,
  DewormingRecordEntity,
  PetReminderEntity,
};
