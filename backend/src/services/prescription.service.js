// Service đơn thuốc (MED-04–08) — theo schema Animora v1.5 mới.
// Đã BỎ HẲN so với bản cũ (không giữ tương thích ngược):
//  - versioning (version/parent_id, trạng thái 'superseded'): MED-05 dùng
//    D2(a) — hủy đơn cũ (CANCELLED) + kê đơn mới;
//  - allow_reorder: suy ra từ max_refills > 0;
//  - trạng thái 'active': đơn mới là ISSUED;
//  - đếm số lần mua lại qua bảng orders (đã mất): MED-07 đọc trực tiếp
//    prescriptions.used_refills; MED-08 mua lại thành công thì tăng
//    used_refills (D8(a)) qua incrementUsedRefills;
//  - bảng carts: giỏ key theo customer_id, dòng giỏ gắn prescription_item_id.
// Quy tắc mua lại (theo đúng bản đối chiếu §7.3):
//  - MED-07 hợp lệ khi đơn ISSUED, còn hạn, và used_refills < max_refills.
//    Bệnh nặng (SEVERE) có max_refills = 0 nên KHÔNG mua qua shop được —
//    thuốc bệnh nặng phát tại quầy (PRESCRIPTION_COUNTER_SALE).
//  - MED-08 mua lại: cùng điều kiện trên, cộng thêm thuốc vào cart_items
//    (gắn prescription_item_id để qua trigger trg_cart_items_enforce_rx),
//    rồi tăng used_refills; nếu tăng thất bại (hết lượt) thì trả 409.
import { AppDataSource } from '../config/data-source.js';
import * as prescriptionRepository from '../repositories/prescription.repository.js';
import * as medicalRepository from '../repositories/medical.repository.js';
import * as petRepository from '../repositories/pet-phuong.repository.js';
import * as productRepository from '../repositories/product.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { generateCode } from '../utils/codeGenerator.js';
import { toDateOnly, normalizeSeverity, normalizeRefill } from './medical.service.js';

// Chuẩn hóa các trường ngày (v1.5 lưu DATE theo giờ VN).
const assertVerifiedVet = async (userId) => {
  const vet = await medicalRepository.findApprovedVetByUserId(userId);
  if (!vet) {
    throw new ApiError(403, 'Chỉ bác sĩ thú y mới được thực hiện thao tác này', 'FORBIDDEN');
  }
  return vet;
};

const findProductUnitPrice = async (productId, manager) => {
  const product = await productRepository.findProductById(productId, manager);
  if (!product) {
    throw new ApiError(404, `Không tìm thấy sản phẩm ${productId}`, 'PRODUCT_NOT_FOUND');
  }
  return Number(product.unit_price);
};

// Điền giá snapshot cho từng dòng thuốc (unit_price_snapshot bắt buộc).
const enrichItemsWithPrice = async (items, manager) => {
  const result = [];
  for (const item of items) {
    const unitPrice = await findProductUnitPrice(item.product_id, manager);
    result.push({ ...item, unit_price_snapshot: unitPrice });
  }
  return result;
};

// MED-04: Bác sĩ kê đơn cho 1 bệnh án (medical_record_id bắt buộc).
const createPrescription = async (vetUserId, payload) => {
  const vet = await assertVerifiedVet(vetUserId);

  const record = await medicalRepository.findMedicalRecordById(payload.medical_record_id);
  if (!record) {
    throw new ApiError(404, 'Không tìm thấy bệnh án', 'MEDICAL_RECORD_NOT_FOUND');
  }
  if (Number(record.doctor_user_id) !== Number(vet.user_id)) {
    throw new ApiError(403, 'Chỉ bác sĩ đã khám mới được kê đơn cho bệnh án này', 'FORBIDDEN');
  }

  const appointmentId = payload.appointment_id
    ? Number(payload.appointment_id)
    : Number(record.appointment_id);
  const appointment = await medicalRepository.findAppointmentById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'APPOINTMENT_NOT_FOUND');
  }
  if (Number(appointment.pet_id) !== Number(record.pet_id)) {
    throw new ApiError(400, 'Lịch hẹn không thuộc về thú cưng này', 'APPOINTMENT_PET_MISMATCH');
  }
  const customerId = payload.customer_id
    ? Number(payload.customer_id)
    : Number(appointment.customer_id);
  if (Number(customerId) !== Number(appointment.customer_id)) {
    throw new ApiError(403, 'Khách hàng không khớp với lịch hẹn', 'CUSTOMER_MISMATCH');
  }

  const severityLevel = normalizeSeverity(payload.severity) || 'MILD';

  const prescriptionData = {
    prescription_code: generateCode('RX'),
    medical_record_id: record.medical_record_id,
    appointment_id: appointmentId,
    pet_id: record.pet_id,
    customer_id: customerId,
    doctor_user_id: Number(vet.user_id),
    prescribed_date: toDateOnly(new Date()),
    severity_level: severityLevel,
    max_refills: normalizeRefill(severityLevel, payload.max_refills),
    used_refills: 0,
    valid_until: payload.valid_until ? toDateOnly(payload.valid_until) : null,
    prescription_status: 'ISSUED',
    counter_payment_status: 'NONE',
    notes: payload.notes || null,
  };

  return AppDataSource.transaction(async (manager) => {
    if (payload.items && payload.items.length > 0) {
      const items = await enrichItemsWithPrice(payload.items, manager);
      return prescriptionRepository.createPrescriptionWithItems(prescriptionData, items, manager);
    }
    return prescriptionRepository.createPrescriptionWithItems(prescriptionData, [], manager);
  });
};

// MED-05: Cập nhật đơn thuốc = hủy đơn cũ (CANCELLED) + kê đơn mới.
// Không còn version/parent_id (D2(a)).
const updatePrescription = async (prescriptionId, vetUserId, payload) => {
  const vet = await assertVerifiedVet(vetUserId);
  const oldPrescription = await prescriptionRepository.findById(prescriptionId);
  if (!oldPrescription) {
    throw new ApiError(404, 'Không tìm thấy đơn thuốc', 'PRESCRIPTION_NOT_FOUND');
  }
  if (Number(oldPrescription.doctor_user_id) !== Number(vet.user_id)) {
    throw new ApiError(403, 'Chỉ bác sĩ đã kê đơn mới được sửa đơn này', 'FORBIDDEN');
  }
  if (oldPrescription.prescription_status !== 'ISSUED') {
    throw new ApiError(409, 'Chỉ sửa được đơn đang phát hành', 'INVALID_PRESCRIPTION_STATUS');
  }

  const severityLevel = normalizeSeverity(payload.severity) || oldPrescription.severity_level;

  const prescriptionData = {
    prescription_code: generateCode('RX'),
    medical_record_id: oldPrescription.medical_record_id,
    appointment_id: oldPrescription.appointment_id,
    pet_id: oldPrescription.pet_id,
    customer_id: oldPrescription.customer_id,
    doctor_user_id: Number(vet.user_id),
    prescribed_date: toDateOnly(new Date()),
    severity_level: severityLevel,
    max_refills: normalizeRefill(severityLevel, payload.max_refills),
    used_refills: 0,
    valid_until: payload.valid_until ? toDateOnly(payload.valid_until) : oldPrescription.valid_until,
    prescription_status: 'ISSUED',
    counter_payment_status: 'NONE',
    notes: payload.notes !== undefined ? payload.notes : oldPrescription.notes,
  };

  return AppDataSource.transaction(async (manager) => {
    await prescriptionRepository.updatePrescriptionStatus(prescriptionId, 'CANCELLED', manager);

    if (payload.items && payload.items.length > 0) {
      const items = await enrichItemsWithPrice(payload.items, manager);
      return prescriptionRepository.createPrescriptionWithItems(prescriptionData, items, manager);
    }
    const newPrescription = await prescriptionRepository.createPrescriptionWithItems(prescriptionData, [], manager);
    await prescriptionRepository.copyItems(newPrescription.prescription_id, oldPrescription.prescription_id, manager);
    newPrescription.items = await prescriptionRepository.findItemsByPrescriptionId(newPrescription.prescription_id, manager);
    return newPrescription;
  });
};

// MED-06: Xem lịch sử đơn thuốc (khách: đơn của mình; bác sĩ: đơn mình kê;
// quản trị: tất cả). Trả 200, kèm lỗi validation nếu có.
const listPrescriptionHistory = async (query, user) => {
  const { pet_id, status, scope } = query;
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));

  const result = await prescriptionRepository.listPrescriptionHistory({
    pet_id,
    status,
    scope,
    userId: user.id,
    vetUserId: user.id,
    page,
    limit,
  });
  return {
    data: result.data,
    pagination: { page, limit, total: result.total, total_pages: Math.ceil(result.total / limit) },
  };
};

// MED-07: Kiểm tra 1 đơn có mua được thuốc trên shop không.
// Hợp lệ khi: đơn ISSUED, còn hạn, và used_refills < max_refills.
// Trả 200 kèm { valid, errors } (không ném lỗi 4xx).
const validatePurchase = async (payload) => {
  const errors = [];

  const prescription = await prescriptionRepository.findById(payload.prescription_id);
  if (!prescription) {
    return { valid: false, errors: ['Không tìm thấy đơn thuốc'] };
  }

  if (prescription.prescription_status !== 'ISSUED') {
    errors.push('Đơn thuốc không còn hiệu lực');
  }

  if (prescription.valid_until && toDateOnly(prescription.valid_until) < toDateOnly(new Date())) {
    errors.push('Đơn thuốc đã hết hạn');
  }

  if (Number(prescription.used_refills) >= Number(prescription.max_refills)) {
    errors.push('Đơn thuốc đã hết lượt mua lại');
  }

  const items = payload.items || [];
  if (items.length === 0) {
    errors.push('Chưa chọn thuốc để mua');
  }

  const prescriptionItems = await prescriptionRepository.findItemsByPrescriptionId(prescription.prescription_id);
  const itemMap = new Map(prescriptionItems.map((item) => [Number(item.product_id), item]));

  for (const item of items) {
    const prescriptionItem = itemMap.get(Number(item.product_id));
    if (!prescriptionItem) {
      errors.push(`Sản phẩm ${item.product_id} không có trong đơn thuốc`);
      continue;
    }
    if (Number(item.quantity) > Number(prescriptionItem.quantity)) {
      errors.push(`Số lượng sản phẩm ${item.product_id} vượt quá số lượng trong đơn`);
    }
  }

  return { valid: errors.length === 0, errors };
};

// MED-08: Mua lại thuốc theo đơn — cộng thuốc vào giỏ (cart_items key theo
// customer_id, gắn prescription_item_id), rồi tăng used_refills (D8(a)).
// Nếu tăng thất bại (hết lượt) thì trả 409.
const reorderPrescription = async (prescriptionId, userId) => {
  const customerId = await petRepository.findCustomerIdByUserId(userId);
  if (!customerId) {
    throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
  }

  const prescription = await prescriptionRepository.findById(prescriptionId);
  if (!prescription) {
    throw new ApiError(404, 'Không tìm thấy đơn thuốc', 'PRESCRIPTION_NOT_FOUND');
  }
  if (Number(prescription.customer_id) !== Number(customerId)) {
    throw new ApiError(403, 'Đơn thuốc không thuộc về bạn', 'FORBIDDEN');
  }
  if (prescription.severity_level !== 'MILD') {
    throw new ApiError(409, 'Đơn bệnh nặng chỉ phát thuốc tại quầy, không mua lại trên shop được', 'SEVERE_PRESCRIPTION');
  }
  if (prescription.prescription_status !== 'ISSUED') {
    throw new ApiError(409, 'Đơn thuốc không còn hiệu lực', 'INVALID_PRESCRIPTION_STATUS');
  }
  if (prescription.valid_until && toDateOnly(prescription.valid_until) < toDateOnly(new Date())) {
    throw new ApiError(409, 'Đơn thuốc đã hết hạn', 'PRESCRIPTION_EXPIRED');
  }
  if (Number(prescription.used_refills) >= Number(prescription.max_refills)) {
    throw new ApiError(409, 'Đơn thuốc đã hết lượt mua lại', 'REFILL_LIMIT_REACHED');
  }

  const prescriptionItems = await prescriptionRepository.findItemsByPrescriptionId(prescriptionId);
  if (prescriptionItems.length === 0) {
    throw new ApiError(409, 'Đơn thuốc không có thuốc để mua lại', 'EMPTY_PRESCRIPTION');
  }

  return AppDataSource.transaction(async (manager) => {
    let addedItems = 0;
    for (const item of prescriptionItems) {
      const existing = await prescriptionRepository.findCartItem(customerId, item.product_id, manager);
      if (existing) {
        await prescriptionRepository.updateCartItemQuantity(
          existing.cart_item_id,
          Number(existing.quantity) + Number(item.quantity),
          manager,
        );
      } else {
        await prescriptionRepository.createCartItem(
          {
            customer_id: customerId,
            product_id: item.product_id,
            prescription_item_id: item.prescription_item_id,
            quantity: item.quantity,
          },
          manager,
        );
      }
      addedItems += 1;
    }

    const affected = await prescriptionRepository.incrementUsedRefills(prescriptionId, manager);
    if (affected === 0) {
      throw new ApiError(409, 'Đơn thuốc đã hết lượt mua lại', 'REFILL_LIMIT_REACHED');
    }

    return { customer_id: customerId, added_items: addedItems };
  });
};

export {
  createPrescription,
  updatePrescription,
  listPrescriptionHistory,
  validatePurchase,
  reorderPrescription,
};
