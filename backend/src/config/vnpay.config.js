import { env } from './environment.js';

export const vnpayConfig = {
  tmnCode: env.VNP_TMN_CODE,
  hashSecret: env.VNP_HASH_SECRET,
  url: env.VNP_URL,
  returnUrl: env.VNP_RETURN_URL, // trang FE hiển thị kết quả cho khách
  version: '2.1.0',
  command: 'pay',
  currCode: 'VND',
  locale: 'vn',
  expireMinutes: 15,
};

export default vnpayConfig;
