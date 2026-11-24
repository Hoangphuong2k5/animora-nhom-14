// Controller thu tiền mặt tại quầy (SPAY-05).
import * as cashPaymentService from '../services/cash-payment.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const confirmCashPayment = asyncHandler(async (req, res) => {
  const result = await cashPaymentService.confirmCashPayment(req.params.id, req.user.id, req.body);
  return successResponse(res, result, 'Thu tiền mặt thành công');
});

export {
  confirmCashPayment,
};
