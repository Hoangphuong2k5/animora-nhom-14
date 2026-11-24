// Sinh mã code bắt buộc của schema v1.5 (pet_code, record_code,
// prescription_code, product_code, payment_code, invoice_code, proposal_code).
// Dạng: PREFIX-YYYYMMDD-XXXXXX (6 số ngẫu nhiên, ngày theo giờ VN UTC+7).
// VD: PET-20261124-483920, EMR-20261124-120034, RX-20261124-552211.
// Các cột code đều UNIQUE trong DB — nếu trùng (xác suất rất thấp) thì
// câu INSERT sẽ lỗi 2627/2601; lúc đó gọi lại API để sinh mã khác.
import crypto from 'crypto';

function todayYyyymmdd() {
  const vn = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const y = vn.getUTCFullYear();
  const m = String(vn.getUTCMonth() + 1).padStart(2, '0');
  const d = String(vn.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function generateCode(prefix) {
  const suffix = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  return `${prefix}-${todayYyyymmdd()}-${suffix}`;
}

export { generateCode };
