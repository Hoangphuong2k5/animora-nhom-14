import { StatusCodes } from 'http-status-codes';
import { transporter } from '../config/mailer.config.js';
import { env } from '../config/environment.js';
import ApiError from '../utils/ApiError.js';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    return await transporter.sendMail({ from: env.SMTP_USER || 'no-reply@animora.vn', to, subject, html });
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      'Không gửi được email, vui lòng thử lại sau',
      'MAIL_PROVIDER_ERROR'
    );
  }
};

export default { sendEmail };
