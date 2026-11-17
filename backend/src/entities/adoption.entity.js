import { EntitySchema } from 'typeorm';

const AdoptionListingEntity = new EntitySchema({
  name: 'AdoptionListing',
  tableName: 'AdoptionListings',
  columns: {
    AdoptionListingID: { type: 'bigint', primary: true, generated: 'increment' },
    PetID: { type: 'bigint', nullable: false },
    RescueStationID: { type: 'bigint', nullable: false },
    ListingTitle: { type: 'nvarchar', length: 200, nullable: false },
    Description: { type: 'nvarchar', length: 2000, nullable: true },
    HealthSummary: { type: 'nvarchar', length: 2000, nullable: true },
    Temperament: { type: 'nvarchar', length: 500, nullable: true },
    AdoptionRequirements: { type: 'nvarchar', length: 2000, nullable: true },
    ListingStatus: { type: 'nvarchar', length: 30, default: 'Available' },
    PublishedAt: { type: 'datetime2', precision: 0, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const AdoptionApplicationEntity = new EntitySchema({
  name: 'AdoptionApplication',
  tableName: 'AdoptionApplications',
  columns: {
    AdoptionApplicationID: { type: 'bigint', primary: true, generated: 'increment' },
    AdoptionListingID: { type: 'bigint', nullable: false },
    CustomerID: { type: 'bigint', nullable: false },
    ApplicationStatus: { type: 'nvarchar', length: 30, default: 'Pending' },
    ApplicantReason: { type: 'nvarchar', length: 2000, nullable: true },
    LivingEnvironment: { type: 'nvarchar', length: 2000, nullable: true },
    ExperienceDescription: { type: 'nvarchar', length: 2000, nullable: true },
    ReviewedByUserID: { type: 'bigint', nullable: true },
    ReviewedAt: { type: 'datetime2', precision: 0, nullable: true },
    ReviewNote: { type: 'nvarchar', length: 2000, nullable: true },
    HandoverConfirmedByStationAt: { type: 'datetime2', precision: 0, nullable: true },
    HandoverConfirmedByCustomerAt: { type: 'datetime2', precision: 0, nullable: true },
    HandoverNote: { type: 'nvarchar', length: 1000, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const AdoptionApplicationHistoryEntity = new EntitySchema({
  name: 'AdoptionApplicationHistory',
  tableName: 'AdoptionApplicationHistory',
  columns: {
    AdoptionApplicationHistoryID: { type: 'bigint', primary: true, generated: 'increment' },
    AdoptionApplicationID: { type: 'bigint', nullable: false },
    ChangedByUserID: { type: 'bigint', nullable: false },
    OldStatus: { type: 'nvarchar', length: 30, nullable: true },
    NewStatus: { type: 'nvarchar', length: 30, nullable: false },
    ChangeNote: { type: 'nvarchar', length: 1000, nullable: true },
    ChangedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const AdoptionHandoverAppointmentEntity = new EntitySchema({
  name: 'AdoptionHandoverAppointment',
  tableName: 'AdoptionHandoverAppointments',
  columns: {
    AdoptionHandoverAppointmentID: { type: 'bigint', primary: true, generated: 'increment' },
    AdoptionApplicationID: { type: 'bigint', nullable: false },
    PetID: { type: 'bigint', nullable: false },
    RescueStationID: { type: 'bigint', nullable: false },
    StartAt: { type: 'datetime2', precision: 0, nullable: false },
    EndAt: { type: 'datetime2', precision: 0, nullable: false },
    ScheduleStatus: { type: 'nvarchar', length: 20, default: 'Scheduled' },
    Notes: { type: 'nvarchar', length: 1000, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
    UpdatedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const PetOwnershipHistoryEntity = new EntitySchema({
  name: 'PetOwnershipHistory',
  tableName: 'PetOwnershipHistory',
  columns: {
    OwnershipHistoryID: { type: 'bigint', primary: true, generated: 'increment' },
    PetID: { type: 'bigint', nullable: false },
    PreviousOwnerType: { type: 'nvarchar', length: 30, nullable: true },
    PreviousCustomerID: { type: 'bigint', nullable: true },
    PreviousRescueStationID: { type: 'bigint', nullable: true },
    NewOwnerType: { type: 'nvarchar', length: 30, nullable: false },
    NewCustomerID: { type: 'bigint', nullable: true },
    NewRescueStationID: { type: 'bigint', nullable: true },
    AdoptionApplicationID: { type: 'bigint', nullable: true },
    TransferReason: { type: 'nvarchar', length: 500, nullable: true },
    TransferredAt: { type: 'datetime2', precision: 0, createDate: true },
    RecordedByUserID: { type: 'bigint', nullable: true },
  },
});

export {
  AdoptionListingEntity,
  AdoptionApplicationEntity,
  AdoptionApplicationHistoryEntity,
  AdoptionHandoverAppointmentEntity,
  PetOwnershipHistoryEntity,
};
export default {
  AdoptionListingEntity,
  AdoptionApplicationEntity,
  AdoptionApplicationHistoryEntity,
  AdoptionHandoverAppointmentEntity,
  PetOwnershipHistoryEntity,
};

