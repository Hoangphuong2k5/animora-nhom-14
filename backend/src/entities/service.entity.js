const { EntitySchema } = require('typeorm');

const ServiceEntity = new EntitySchema({
  name: 'Service',
  tableName: 'services',
  columns: {
    id: { type: 'bigint', primary: true, generated: 'increment' },
    name: { type: 'nvarchar', length: 150, nullable: false },
    description: { type: 'nvarchar', length: 'MAX', nullable: true },
    category: { type: 'nvarchar', length: 100, nullable: true },
    service_kind: { type: 'nvarchar', length: 10, default: 'care' }, // 'medical' hoặc 'care'
    price: { type: 'decimal', precision: 12, scale: 2, nullable: false },
    duration_min: { type: 'int', nullable: false, default: 60 },
    allow_postpay: { type: 'bit', default: false },
    free_cancel_hours: { type: 'int', default: 24 },
    late_threshold_hours: { type: 'int', default: 3 },
    late_fee_percent: { type: 'decimal', precision: 5, scale: 2, default: 50.0 },
    cancel_policy: { type: 'nvarchar', length: 'MAX', nullable: true },
    is_active: { type: 'bit', default: true },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
    updated_at: { type: 'datetime2', precision: 0, updateDate: true },
  },
});

const ExpertServiceEntity = new EntitySchema({
  name: 'ExpertService',
  tableName: 'expert_services',
  columns: {
    expert_id: { type: 'bigint', primary: true },
    service_id: { type: 'bigint', primary: true },
  },
});

module.exports = {
  ServiceEntity,
  ExpertServiceEntity,
};
