import { EntitySchema } from 'typeorm';

const ServiceCategoryEntity = new EntitySchema({
  name: 'ServiceCategory',
  tableName: 'ServiceCategories',
  columns: {
    ServiceCategoryID: { type: 'int', primary: true, generated: 'increment' },
    CategoryName: { type: 'nvarchar', length: 150, unique: true, nullable: false },
    Description: { type: 'nvarchar', length: 500, nullable: true },
    IsActive: { type: 'bit', default: true },
  },
});

const ServiceEntity = new EntitySchema({
  name: 'Service',
  tableName: 'Services',
  columns: {
    ServiceID: { type: 'bigint', primary: true, generated: 'increment' },
    ServiceCategoryID: { type: 'int', nullable: false },
    ServiceName: { type: 'nvarchar', length: 200, nullable: false },
    Description: { type: 'nvarchar', length: 2000, nullable: true },
    BasePrice: { type: 'decimal', precision: 18, scale: 2, nullable: false },
    EstimatedDurationMinutes: { type: 'int', nullable: true },
    IsActive: { type: 'bit', default: true },
    CreatedAt: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const ServicePaymentMethodEntity = new EntitySchema({
  name: 'ServicePaymentMethod',
  tableName: 'ServicePaymentMethods',
  columns: {
    ServicePaymentMethodID: { type: 'bigint', primary: true, generated: 'increment' },
    ServiceID: { type: 'bigint', nullable: false },
    PaymentMethodID: { type: 'int', nullable: false },
    IsActive: { type: 'bit', default: true },
  },
});

const ExpertServiceEntity = new EntitySchema({
  name: 'ExpertService',
  tableName: 'EmployeeServices',
  columns: {
    EmployeeServiceID: { type: 'bigint', primary: true, generated: 'increment' },
    EmployeeID: { type: 'bigint', nullable: false },
    ServiceID: { type: 'bigint', nullable: false },
    AssignedByUserID: { type: 'bigint', nullable: false },
    AssignedAt: { type: 'datetime2', precision: 0, createDate: true },
    IsActive: { type: 'bit', default: true },
  },
});

export {
  ServiceCategoryEntity,
  ServiceEntity,
  ServicePaymentMethodEntity,
  ExpertServiceEntity,
};
export default {
  ServiceCategoryEntity,
  ServiceEntity,
  ServicePaymentMethodEntity,
  ExpertServiceEntity,
};
