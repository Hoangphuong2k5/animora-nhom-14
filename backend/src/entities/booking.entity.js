import { EntitySchema } from 'typeorm';

const BookingEntity = new EntitySchema({
  name: 'Booking',
  tableName: 'Appointments',
  columns: {
    AppointmentID: { type: 'bigint', primary: true, generated: 'increment' },
    CustomerID: { type: 'bigint', nullable: false },
    PetID: { type: 'bigint', nullable: false },
    AppointmentCode: { type: 'nvarchar', length: 50, unique: true, nullable: false },
    AppointmentAt: { type: 'datetime2', precision: 0, nullable: false },
    AppointmentEndAt: { type: 'datetime2', precision: 0, nullable: true },
    AppointmentStatus: { type: 'nvarchar', length: 30, default: 'Pending' },
    PaymentTiming: { type: 'nvarchar', length: 10, default: 'Postpaid' },
    PaymentStatus: { type: 'nvarchar', length: 20, default: 'Postpaid_Pending' },
    PaymentExpiresAt: { type: 'datetime2', precision: 0, nullable: true },
    TotalAmount: { type: 'decimal', precision: 18, scale: 2, default: 0 },
    CancelledAt: { type: 'datetime2', precision: 0, nullable: true },
    CustomerNote: { type: 'nvarchar', length: 1000, nullable: true },
    InternalNote: { type: 'nvarchar', length: 1000, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
    UpdatedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const AppointmentServiceEntity = new EntitySchema({
  name: 'AppointmentService',
  tableName: 'AppointmentServices',
  columns: {
    AppointmentServiceID: { type: 'bigint', primary: true, generated: 'increment' },
    AppointmentID: { type: 'bigint', nullable: false },
    ServiceID: { type: 'bigint', nullable: false },
    Quantity: { type: 'int', default: 1 },
    UnitPrice: { type: 'decimal', precision: 18, scale: 2, nullable: false },
    Notes: { type: 'nvarchar', length: 1000, nullable: true },
  },
});

const AppointmentAssignmentEntity = new EntitySchema({
  name: 'AppointmentAssignment',
  tableName: 'AppointmentAssignments',
  columns: {
    AssignmentID: { type: 'bigint', primary: true, generated: 'increment' },
    AppointmentID: { type: 'bigint', nullable: false },
    EmployeeID: { type: 'bigint', nullable: false },
    AssignedByUserID: { type: 'bigint', nullable: false },
    AssignmentRole: { type: 'nvarchar', length: 30, nullable: false }, // Doctor | CareStaff
    AssignedAt: { type: 'datetime2', precision: 0, createDate: true },
    AssignmentNote: { type: 'nvarchar', length: 500, nullable: true },
  },
});

const AppointmentStatusHistoryEntity = new EntitySchema({
  name: 'AppointmentStatusHistory',
  tableName: 'AppointmentStatusHistory',
  columns: {
    AppointmentStatusHistoryID: { type: 'bigint', primary: true, generated: 'increment' },
    AppointmentID: { type: 'bigint', nullable: false },
    OldStatus: { type: 'nvarchar', length: 30, nullable: true },
    NewStatus: { type: 'nvarchar', length: 30, nullable: false },
    ChangedByUserID: { type: 'bigint', nullable: true },
    ChangeReason: { type: 'nvarchar', length: 1000, nullable: true },
    ChangedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const AppointmentChangeRequestEntity = new EntitySchema({
  name: 'AppointmentChangeRequest',
  tableName: 'AppointmentChangeRequests',
  columns: {
    AppointmentChangeRequestID: { type: 'bigint', primary: true, generated: 'increment' },
    AppointmentID: { type: 'bigint', nullable: false },
    RequestedByUserID: { type: 'bigint', nullable: false },
    RequestType: { type: 'nvarchar', length: 30, nullable: false }, // Reschedule | Cancel
    RequestedAppointmentAt: { type: 'datetime2', precision: 0, nullable: true },
    RequestReason: { type: 'nvarchar', length: 1000, nullable: true },
    RequestStatus: { type: 'nvarchar', length: 30, default: 'Pending' }, // Pending | Approved | Rejected
    ReviewedByUserID: { type: 'bigint', nullable: true },
    ReviewedAt: { type: 'datetime2', precision: 0, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const ServiceExecutionRecordEntity = new EntitySchema({
  name: 'ServiceExecutionRecord',
  tableName: 'ServiceExecutionRecords',
  columns: {
    ServiceExecutionRecordID: { type: 'bigint', primary: true, generated: 'increment' },
    AppointmentServiceID: { type: 'bigint', nullable: false },
    StartedAt: { type: 'datetime2', precision: 0, nullable: true },
    CompletedAt: { type: 'datetime2', precision: 0, nullable: true },
    ExecutionStatus: { type: 'nvarchar', length: 30, default: 'Pending' },
    Summary: { type: 'nvarchar', length: 2000, nullable: true },
    ResultConfirmedByUserID: { type: 'bigint', nullable: true },
    ResultConfirmedAt: { type: 'datetime2', precision: 0, nullable: true },
  },
});

const PaymentMethodEntity = new EntitySchema({
  name: 'PaymentMethod',
  tableName: 'PaymentMethods',
  columns: {
    PaymentMethodID: { type: 'int', primary: true, generated: 'increment' },
    MethodCode: { type: 'nvarchar', length: 50, unique: true, nullable: false },
    MethodName: { type: 'nvarchar', length: 100, nullable: false },
    PaymentMethodType: { type: 'nvarchar', length: 30, nullable: false },
    IsActive: { type: 'bit', default: true },
  },
});

const PaymentEntity = new EntitySchema({
  name: 'Payment',
  tableName: 'Payments',
  columns: {
    PaymentID: { type: 'bigint', primary: true, generated: 'increment' },
    CustomerID: { type: 'bigint', nullable: false },
    AppointmentID: { type: 'bigint', nullable: true },
    OrderID: { type: 'bigint', nullable: true },
    PaymentMethodID: { type: 'int', nullable: false },
    PaymentCode: { type: 'nvarchar', length: 100, unique: true, nullable: false },
    Amount: { type: 'decimal', precision: 18, scale: 2, nullable: false },
    PaymentStatus: { type: 'nvarchar', length: 30, default: 'Pending' },
    PaidAt: { type: 'datetime2', precision: 0, nullable: true },
    ConfirmedByUserID: { type: 'bigint', nullable: true },
    ConfirmedAt: { type: 'datetime2', precision: 0, nullable: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const RefundEntity = new EntitySchema({
  name: 'Refund',
  tableName: 'Refunds',
  columns: {
    RefundID: { type: 'bigint', primary: true, generated: 'increment' },
    PaymentID: { type: 'bigint', nullable: false },
    ReturnRequestID: { type: 'bigint', nullable: true },
    RefundCode: { type: 'nvarchar', length: 100, unique: true, nullable: false },
    RefundType: { type: 'nvarchar', length: 30, default: 'Return' },
    RefundAmount: { type: 'decimal', precision: 18, scale: 2, nullable: false },
    RefundMethod: { type: 'nvarchar', length: 30, nullable: false },
    RefundStatus: { type: 'nvarchar', length: 30, default: 'Pending' },
    TransactionReference: { type: 'nvarchar', length: 200, nullable: true },
    ProcessedByUserID: { type: 'bigint', nullable: true },
    RequestedAt: { type: 'datetime2', precision: 0, createDate: true },
    ProcessedAt: { type: 'datetime2', precision: 0, nullable: true },
    Notes: { type: 'nvarchar', length: 1000, nullable: true },
  },
});

export {
  BookingEntity,
  AppointmentServiceEntity,
  AppointmentAssignmentEntity,
  AppointmentStatusHistoryEntity,
  AppointmentChangeRequestEntity,
  ServiceExecutionRecordEntity,
  PaymentMethodEntity,
  PaymentEntity,
  RefundEntity,
};
export default {
  BookingEntity,
  AppointmentServiceEntity,
  AppointmentAssignmentEntity,
  AppointmentStatusHistoryEntity,
  AppointmentChangeRequestEntity,
  ServiceExecutionRecordEntity,
  PaymentMethodEntity,
  PaymentEntity,
  RefundEntity,
};
