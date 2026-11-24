import { DataSource } from 'typeorm';
import { env } from './environment.js';
import {
  RoleEntity,
  UserEntity,
  CustomerProfileEntity,
  AddressEntity,
  PasswordResetTokenEntity,
  UserSessionEntity,
} from '../entities/user.entity.js';
import {
  ServiceCategoryEntity,
  ServiceEntity,
  ServicePaymentMethodEntity,
  ExpertServiceEntity,
} from '../entities/service.entity.js';
import {
  ExpertEntity,
  ExpertCertificateEntity,
  CertificateApprovalEntity,
  WorkShiftEntity,
  ExpertScheduleEntity,
  ExpertReviewEntity,
} from '../entities/expert.entity.js';
import {
  SupplierEntity,
  SupplierProductEntity,
  ProductCategoryEntity,
  ProductEntity,
  ProductVariantEntity,
  PurchaseOrderEntity,
  PurchaseOrderItemEntity,
  PurchaseOrderStatusHistoryEntity,
  GoodsReceiptEntity,
  GoodsReceiptItemEntity,
  InventoryBatchEntity,
  StockMovementEntity,
} from '../entities/inventory.entity.js';
import {
  NotificationTemplateEntity,
  NotificationEntity,
  AuditLogEntity,
} from '../entities/notification.entity.js';
import {
  AiConversationEntity,
  AiMessageEntity,
  AiUsageLogEntity,
} from '../entities/ai.entity.js';
import {
  BookingEntity,
  AppointmentServiceEntity,
  AppointmentAssignmentEntity,
  AppointmentStatusHistoryEntity,
  AppointmentChangeRequestEntity,
  ServiceExecutionRecordEntity,
  PaymentMethodEntity,
  PaymentEntity,
  RefundEntity,
} from '../entities/booking.entity.js';
import {
  PetSpeciesEntity,
  PetBreedEntity,
  PetEntity,
  PetImageEntity,
  MedicalRecordEntity,
  VaccinationRecordEntity,
  DewormingRecordEntity,
  PetReminderEntity,
} from '../entities/pet.entity.js';
import {
  VoucherEntity,
  VoucherUsageHistoryEntity,
} from '../entities/voucher.entity.js';
// --- Phuong (22 UC, merge 24/11, schema v1.5 56 bang): chi dang ky entity KHONG trung ten voi nhom ---
// KHONG dang ky: Pet, MedicalRecord, Product, ProductCategory (nhom da co entity cung ten — dang ky se lam sap backend).
import { PetHealthScheduleEntity, PetWeightLogEntity, SystemAuditLogEntity } from '../entities/pet-phuong.entity.js';
import { PrescriptionEntity, PrescriptionItemEntity } from '../entities/prescription.entity.js';
import { ReviewEntity } from '../entities/review.entity.js';
import { AppointmentPaymentEntity, InvoiceEntity } from '../entities/payment.entity.js';
import { WarehouseProposalEntity } from '../entities/medicine-suggestion.entity.js';

const AppDataSource = new DataSource({
  type: 'mssql',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: false,
  connectionTimeout: env.DB_CONNECTION_TIMEOUT_MS,
  pool: { max: env.DB_POOL_MAX },
  options: {
    encrypt: env.DB_ENCRYPT,
    trustServerCertificate: env.DB_TRUST_SERVER_CERT,
  },
  entities: [
    RoleEntity,
    UserEntity,
    CustomerProfileEntity,
    AddressEntity,
    PasswordResetTokenEntity,
    UserSessionEntity,
    ServiceCategoryEntity,
    ServiceEntity,
    ServicePaymentMethodEntity,
    ExpertServiceEntity,
    ExpertEntity,
    ExpertCertificateEntity,
    CertificateApprovalEntity,
    WorkShiftEntity,
    ExpertScheduleEntity,
    ExpertReviewEntity,
    SupplierEntity,
    SupplierProductEntity,
    ProductCategoryEntity,
    ProductEntity,
    ProductVariantEntity,
    PurchaseOrderEntity,
    PurchaseOrderItemEntity,
    PurchaseOrderStatusHistoryEntity,
    GoodsReceiptEntity,
    GoodsReceiptItemEntity,
    InventoryBatchEntity,
    StockMovementEntity,
    NotificationTemplateEntity,
    NotificationEntity,
    AuditLogEntity,
    AiConversationEntity,
    AiMessageEntity,
    AiUsageLogEntity,
    BookingEntity,
    AppointmentServiceEntity,
    AppointmentAssignmentEntity,
    AppointmentStatusHistoryEntity,
    AppointmentChangeRequestEntity,
    ServiceExecutionRecordEntity,
    PaymentMethodEntity,
    PaymentEntity,
    RefundEntity,
    PetSpeciesEntity,
    PetBreedEntity,
    PetEntity,
    PetImageEntity,
    MedicalRecordEntity,
    VaccinationRecordEntity,
    DewormingRecordEntity,
    PetReminderEntity,
    VoucherEntity,
    VoucherUsageHistoryEntity,
    // --- Phuong (22 UC, merge 24/11) ---
    PetHealthScheduleEntity,
    PetWeightLogEntity,
    SystemAuditLogEntity,
    PrescriptionEntity,
    PrescriptionItemEntity,
    ReviewEntity,
    AppointmentPaymentEntity,
    InvoiceEntity,
    WarehouseProposalEntity,
  ],
});

export { AppDataSource };
export default { AppDataSource };
