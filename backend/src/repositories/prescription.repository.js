// Repository đơn thuốc (MED-04–08) — theo schema Animora v1.5 mới.
// Đã BỎ HẲN so với bản cũ: findMaxVersionByMedicalRecordId,
// findActiveByMedicalRecordId (status 'active'), countUsedOrders (bảng orders
// đã mất — MED-07 đọc prescriptions.used_refills), mọi logic version/parent_id
// và allow_reorder. Trạng thái mới: DRAFT/ISSUED/EXHAUSTED/EXPIRED/CANCELLED.
// Giỏ hàng: không còn bảng carts — cart_items key theo customer_id,
// định danh dòng bằng prescription_item_id (không có cart_id).
import { AppDataSource } from '../config/data-source.js';
import { PrescriptionEntity, PrescriptionItemEntity } from '../entities/prescription.entity.js';
import { ApiError } from '../utils/ApiError.js';

const getPrescriptionRepo = (manager = null) => (manager || AppDataSource).getRepository(PrescriptionEntity);
const getPrescriptionItemRepo = (manager = null) => (manager || AppDataSource).getRepository(PrescriptionItemEntity);

const findById = async (prescriptionId, manager = null) => {
  return getPrescriptionRepo(manager).findOne({ where: { prescription_id: Number(prescriptionId) } });
};

const findByMedicalRecordId = async (medicalRecordId, manager = null) => {
  return getPrescriptionRepo(manager).find({
    where: { medical_record_id: Number(medicalRecordId) },
    order: { created_at: 'DESC' },
  });
};

// Các đơn đang phát hành của 1 bệnh án (MED-05 hủy trước khi kê mới).
const findIssuedByMedicalRecordId = async (medicalRecordId, manager = null) => {
  return getPrescriptionRepo(manager).find({
    where: { medical_record_id: Number(medicalRecordId), prescription_status: 'ISSUED' },
    order: { created_at: 'DESC' },
  });
};

const createPrescription = async (prescriptionData, manager = null) => {
  const prescription = getPrescriptionRepo(manager).create(prescriptionData);
  return getPrescriptionRepo(manager).save(prescription);
};

const updatePrescriptionStatus = async (prescriptionId, status, manager = null) => {
  const repo = getPrescriptionRepo(manager);
  await repo.update({ prescription_id: Number(prescriptionId) }, { prescription_status: status, updated_at: new Date() });
  return findById(prescriptionId, manager);
};

const updatePrescription = async (prescriptionId, prescriptionData, manager = null) => {
  const repo = getPrescriptionRepo(manager);
  await repo.update({ prescription_id: Number(prescriptionId) }, prescriptionData);
  return findById(prescriptionId, manager);
};

// Tăng bộ đếm used_refills — chỉ tăng khi còn lượt (guard tránh vượt max).
// Trả về số dòng bị ảnh hưởng (0 = đã hết lượt / đơn không còn ISSUED).
// TypeORM + mssql trả kết quả UPDATE dưới nhiều dạng khác nhau nên xử lý đủ cả.
const incrementUsedRefills = async (prescriptionId, manager = null) => {
  const db = manager || AppDataSource;
  const result = await db.query(
    `UPDATE dbo.prescriptions
     SET used_refills = used_refills + 1, updated_at = SYSDATETIME()
     WHERE prescription_id = @0 AND prescription_status = 'ISSUED' AND used_refills < max_refills`,
    [Number(prescriptionId)],
  );
  if (Array.isArray(result)) return Number(result[0]) || 0; // rowsAffected dạng [n]
  if (result && Array.isArray(result.rowsAffected)) return Number(result.rowsAffected[0]) || 0;
  if (typeof result === 'number') return result;
  return 0;
};

// Lấy used_refills theo prescription_id (MED-07 đọc trực tiếp cột này).
const findRefillInfo = async (prescriptionId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT prescription_id, prescription_status, severity_level, max_refills, used_refills, valid_until
     FROM dbo.prescriptions WHERE prescription_id = @0`,
    [Number(prescriptionId)],
  );
  return rows[0] || null;
};

const findItemsByPrescriptionId = async (prescriptionId, manager = null) => {
  return getPrescriptionItemRepo(manager).find({
    where: { prescription_id: Number(prescriptionId) },
    order: { prescription_item_id: 'ASC' },
  });
};

const insertPrescriptionItems = async (prescriptionId, items, manager = null) => {
  const repo = getPrescriptionItemRepo(manager);
  const rows = items.map((item) => ({
    prescription_id: Number(prescriptionId),
    product_id: Number(item.product_id),
    quantity: Number(item.quantity),
    dosage: item.dosage,
    frequency: item.frequency || null,
    duration_days: item.duration_days ? Number(item.duration_days) : null,
    usage_instructions: item.usage_instructions || null,
    unit_price_snapshot: item.unit_price_snapshot,
    species_mismatch_ack: item.species_mismatch_ack ? true : false,
  }));
  await repo.save(rows);
  return findItemsByPrescriptionId(prescriptionId, manager);
};

// Sao chép các dòng thuốc từ đơn cũ sang đơn mới (MED-05/MED-03).
// Giá snapshot giữ nguyên giá lúc kê đơn cũ.
const copyItems = async (newPrescriptionId, oldPrescriptionId, manager = null) => {
  const db = manager || AppDataSource;
  await db.query(
    `INSERT INTO dbo.prescription_items
       (prescription_id, product_id, quantity, dosage, frequency, duration_days,
        usage_instructions, unit_price_snapshot, species_mismatch_ack)
     SELECT @0, product_id, quantity, dosage, frequency, duration_days,
            usage_instructions, unit_price_snapshot, species_mismatch_ack
     FROM dbo.prescription_items WHERE prescription_id = @1`,
    [Number(newPrescriptionId), Number(oldPrescriptionId)],
  );
  return findItemsByPrescriptionId(newPrescriptionId, manager);
};

const createPrescriptionWithItems = async (prescriptionData, items, manager = null) => {
  const prescription = await createPrescription(prescriptionData, manager);
  if (items && items.length > 0) {
    await insertPrescriptionItems(prescription.prescription_id, items, manager);
  }
  return { ...prescription, items: await findItemsByPrescriptionId(prescription.prescription_id, manager) };
};

const listPrescriptionHistory = async ({ pet_id, status, scope, userId, vetUserId, page = 1, limit = 20 }) => {
  const queryBuilder = getPrescriptionRepo().createQueryBuilder('pr');

  if (pet_id) {
    queryBuilder.andWhere('pr.pet_id = :petId', { petId: Number(pet_id) });
  }
  if (status) {
    queryBuilder.andWhere('pr.prescription_status = :status', { status });
  }
  if (scope === 'customer') {
    // Chỉ đơn của thú thuộc về khách này (pets.customer_id -> customers -> users).
    queryBuilder.andWhere(
      `pr.pet_id IN (SELECT pet_id FROM dbo.pets WHERE customer_id IN
        (SELECT customer_id FROM dbo.customers WHERE user_id = :userId))`,
      { userId: Number(userId) },
    );
  } else if (scope === 'expert') {
    // Đơn do bác sĩ này kê, hoặc đơn thuộc bệnh án của bác sĩ này.
    queryBuilder.andWhere(
      `(pr.doctor_user_id = :vetUserId OR pr.pet_id IN
        (SELECT pet_id FROM dbo.medical_records WHERE doctor_user_id = :vetUserId))`,
      { vetUserId: Number(vetUserId) },
    );
  }

  const total = await queryBuilder.getCount();
  const prescriptions = await queryBuilder
    .orderBy('pr.created_at', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

  return { data: prescriptions, total };
};

// Giỏ hàng v1.5: không còn bảng carts — cart_items key trực tiếp bằng customer_id.
// Trigger trg_cart_items_enforce_rx chặn thuốc kê đơn không có prescription_item_id,
// và chặn prescription_item_id không khớp product_id.
const findCartItem = async (customerId, productId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT * FROM dbo.cart_items WHERE customer_id = @0 AND product_id = @1`,
    [Number(customerId), Number(productId)],
  );
  return rows[0] || null;
};

const updateCartItemQuantity = async (cartItemId, quantity, manager = null) => {
  const db = manager || AppDataSource;
  await db.query(
    `UPDATE dbo.cart_items SET quantity = @1, updated_at = SYSDATETIME() WHERE cart_item_id = @0`,
    [Number(cartItemId), Number(quantity)],
  );
};

const createCartItem = async (cartItemData, manager = null) => {
  const db = manager || AppDataSource;
  const result = await db.query(
    `INSERT INTO dbo.cart_items (customer_id, product_id, prescription_item_id, quantity, added_at, updated_at)
     OUTPUT INSERTED.cart_item_id
     VALUES (@0, @1, @2, @3, SYSDATETIME(), SYSDATETIME())`,
    [
      Number(cartItemData.customer_id),
      Number(cartItemData.product_id),
      cartItemData.prescription_item_id ? Number(cartItemData.prescription_item_id) : null,
      Number(cartItemData.quantity),
    ],
  );
  return { cart_item_id: result[0].cart_item_id, ...cartItemData };
};

export {
  findById,
  findByMedicalRecordId,
  findIssuedByMedicalRecordId,
  createPrescription,
  updatePrescriptionStatus,
  updatePrescription,
  incrementUsedRefills,
  findRefillInfo,
  findItemsByPrescriptionId,
  insertPrescriptionItems,
  copyItems,
  createPrescriptionWithItems,
  listPrescriptionHistory,
  findCartItem,
  updateCartItemQuantity,
  createCartItem,
};
