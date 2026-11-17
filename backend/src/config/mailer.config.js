import { env } from './environment.js';

let transporterInstance = null;

try {
  const nodemailer = await import('nodemailer');
  transporterInstance = nodemailer.default.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
} catch {
  transporterInstance = {
    sendMail: async ({ from, to, subject, html }) => {
      // Mock transporter khi chạy môi trường dev/test
      return {
        messageId: `<mock_${Date.now()}@animora.vn>`,
        to,
        subject,
      };
    },
  };
}

export const transporter = transporterInstance;
export default { transporter };
