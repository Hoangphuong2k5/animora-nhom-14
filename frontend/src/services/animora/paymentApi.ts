import { api } from './apiClient';

export interface CreateVnpayUrlPayload {
  appointment_id?: number;
  order_id?: number;
  idempotency_key?: string;
  bank_code?: string;
}

export interface BackendPaymentDTO {
  id: number;
  PaymentID: number;
  payment_code: string;
  customer_id: number;
  appointment_id: number | null;
  order_id: number | null;
  payment_method_id: number;
  method_code: string | null;
  method_name: string | null;
  amount: number;
  status: string;
  paid_at: string | null;
  confirmed_by: number | null;
  confirmed_at: string | null;
  created_at: string | null;
}

export interface CreateVnpayUrlResponse {
  payment: BackendPaymentDTO;
  payment_url: string;
}

export interface VnpayCallbackVerificationResult {
  RspCode: string;
  Message: string;
  isValid: boolean;
  isSuccess: boolean;
  isDuplicate?: boolean;
  payment: BackendPaymentDTO | null;
}

export async function createVnpayPaymentUrlApi(
  payload: CreateVnpayUrlPayload
): Promise<CreateVnpayUrlResponse> {
  return await api<CreateVnpayUrlResponse>('/payments/vnpay/create-url', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyVnpayReturnApi(
  queryString: string
): Promise<VnpayCallbackVerificationResult> {
  const cleanQuery = queryString.startsWith('?') ? queryString : `?${queryString}`;
  return await api<VnpayCallbackVerificationResult>(`/payments/vnpay/return${cleanQuery}`);
}

export async function fetchMyPaymentsApi(page = 1, limit = 20): Promise<BackendPaymentDTO[]> {
  return await api<BackendPaymentDTO[]>(`/payments/my?page=${page}&limit=${limit}`);
}

export async function confirmCashPaymentApi(
  paymentId: number,
  note?: string
): Promise<BackendPaymentDTO> {
  return await api<BackendPaymentDTO>(`/payments/${paymentId}/confirm-cash`, {
    method: 'PATCH',
    body: JSON.stringify({ note: note || '' }),
  });
}

