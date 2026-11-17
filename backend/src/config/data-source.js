import { DataSource } from 'typeorm';
import { env } from './environment.js';
import {
  RoleEntity,
  UserEntity,
  CustomerProfileEntity,
  AddressEntity,
  PasswordResetTokenEntity,
  UserSessionEntity,
  RescueStationProfileEntity,
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
  AdoptionListingEntity,
  AdoptionApplicationEntity,
  AdoptionApplicationHistoryEntity,
  AdoptionHandoverAppointmentEntity,
  PetOwnershipHistoryEntity,
} from '../entities/adoption.entity.js';
import {
  VoucherEntity,
  VoucherUsageHistoryEntity,
} from '../entities/voucher.entity.js';

// --- Phuong (26 UC, merge 17/11): entities khong trung ten voi nhom ---
import { PetVaccinationEntity } from '../entities/pet-phuong.entity.js';
import { MedicineSuggestionEntity } from '../entities/medicine-suggestion.entity.js';
import {
  PrescriptionEntity,
  PrescriptionItemEntity,
} from '../entities/prescription.entity.js';
import { ReviewEntity } from '../entities/review.entity.js';
import { AdoptionPostEntity } from '../entities/adoption-phuong.entity.js';

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
    RescueStationProfileEntity,
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
    AdoptionListingEntity,
    AdoptionApplicationEntity,
    AdoptionApplicationHistoryEntity,
    AdoptionHandoverAppointmentEntity,
    PetOwnershipHistoryEntity,
    VoucherEntity,
    VoucherUsageHistoryEntity,
    // --- Phuong (26 UC, merge 17/11) ---
    PetVaccinationEntity,
    MedicineSuggestionEntity,
    PrescriptionEntity,
    PrescriptionItemEntity,
    ReviewEntity,
    AdoptionPostEntity,
  ],
});

export { AppDataSource };
export default { AppDataSource };
