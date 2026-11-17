import crypto from 'node:crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { vnpayConfig } from '../config/vnpay.config.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// VNPAY dùng giờ Việt Nam (GMT+7), định dạng yyyyMMddHHmmss
const formatVnpDate = (date) => dayjs(date).tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');

// Sắp xếp key A-Z, encode giá trị (khoảng trắng -> '+'), nối thành chuỗi query
const buildSignData = (params) =>
  Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`)
    .join('&');

const sign = (signData) =>
  crypto.createHmac('sha512', vnpayConfig.hashSecret || 'default_secret').update(Buffer.from(signData, 'utf-8')).digest('hex');

// Tạo URL thanh toán: FE redirect khách sang URL này
export const buildPaymentUrl = ({ txnRef, amount, orderInfo, ipAddr, bankCode }) => {
  const now = new Date();
  const params = {
    vnp_Version: vnpayConfig.version,
    vnp_Command: vnpayConfig.command,
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Locale: vnpayConfig.locale,
    vnp_CurrCode: vnpayConfig.currCode,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo, // tiếng Việt không dấu, không ký tự đặc biệt
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(Number(amount) * 100), // VNPAY yêu cầu nhân 100
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: formatVnpDate(now),
    vnp_ExpireDate: formatVnpDate(new Date(now.getTime() + vnpayConfig.expireMinutes * 60 * 1000)),
    vnp_BankCode: bankCode, // tùy chọn, bỏ trống thì khách tự chọn tại cổng VNPAY
  };

  const signData = buildSignData(params);
  return `${vnpayConfig.url}?${signData}&vnp_SecureHash=${sign(signData)}`;
};

// Kiểm tra chữ ký của Return URL / IPN (truyền vào req.query). CHỈ xác thực + trả dữ liệu thuần
export const verifyCallback = (query) => {
  const receivedHash = query.vnp_SecureHash;
  const params = Object.fromEntries(
    Object.entries(query).filter(
      ([key]) => key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType'
    )
  );

  const expected = Buffer.from(sign(buildSignData(params)));
  const received = Buffer.from(String(receivedHash || '').toLowerCase());
  const isValid = expected.length === received.length && crypto.timingSafeEqual(expected, received);

  return {
    isValid,
    txnRef: params.vnp_TxnRef,
    amount: Number(params.vnp_Amount) / 100, // chia 100 để về VNĐ
    isSuccess: params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00',
    responseCode: params.vnp_ResponseCode,
    transactionNo: params.vnp_TransactionNo,
  };
};

export default {
  buildPaymentUrl,
  verifyCallback,
};
