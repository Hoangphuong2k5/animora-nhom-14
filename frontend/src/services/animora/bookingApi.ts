import { api, ApiClientError } from './apiClient';
import { Booking, BookingStatus } from '@/types';

export interface BackendBookingDTO {
  id: number;
  AppointmentID: number;
  code: string;
  customer_id: number;
  pet_id: number;
  scheduled_at: string;
  end_at: string | null;
  status: string;
  payment_timing: 'Prepaid' | 'Postpaid' | string;
  payment_status: string;
  payment_expires_at: string | null;
  total_amount: number;
  cancelled_at: string | null;
  customer_note: string | null;
  internal_note: string | null;
  created_at: string | null;
  pet?: { id: number; name: string };
  customer?: { id: number; user_id: number; full_name: string };
  services?: Array<{
    id: number;
    service_id: number;
    service_name: string | null;
    quantity: number;
    unit_price: number;
  }>;
  assignments?: Array<{
    id: number;
    employee_id: number;
    employee_name: string | null;
    role: string;
  }>;
}

export interface BookingAvailabilityResponse {
  date: string;
  pet_busy_slots: Array<{ start_at: string; end_at: string; source: string }>;
  expert_busy_slots: Array<{ start_at: string; end_at: string; source: string }>;
  handover_busy_slots: Array<{ start_at: string; end_at: string; source: string }>;
  busy_slots: Array<{ start_at: string; end_at: string; source: string }>;
}

export interface CreateBackendBookingPayload {
  pet_id: number;
  service_id: number;
  expert_id?: number | null;
  scheduled_at: string;
  payment_timing: 'Prepaid' | 'Postpaid';
  customer_note?: string | null;
}

function mapBackendStatusToFrontend(status: string): BookingStatus {
  switch (status) {
    case 'Confirmed':
    case 'InProgress':
      return 'Đã xác nhận';
    case 'Completed':
      return 'Hoàn thành';
    case 'Cancelled':
    case 'Rejected':
      return 'Đã hủy';
    case 'NoShow':
      return 'Không đến';
    default:
      return 'Mới';
  }
}

export function mapBackendBookingToFrontend(dto: BackendBookingDTO): Booking {
  const startDt = new Date(dto.scheduled_at);
  const endDt = dto.end_at ? new Date(dto.end_at) : new Date(startDt.getTime() + 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateIso = !Number.isNaN(startDt.getTime())
    ? `${startDt.getFullYear()}-${pad(startDt.getMonth() + 1)}-${pad(startDt.getDate())}`
    : '';
  const startTime = !Number.isNaN(startDt.getTime())
    ? `${pad(startDt.getHours())}:${pad(startDt.getMinutes())}`
    : '09:00';
  const endTime = !Number.isNaN(endDt.getTime())
    ? `${pad(endDt.getHours())}:${pad(endDt.getMinutes())}`
    : '10:00';
  const durationMinutes =
    !Number.isNaN(startDt.getTime()) && !Number.isNaN(endDt.getTime())
      ? Math.max(15, Math.round((endDt.getTime() - startDt.getTime()) / 60000))
      : 60;

  const firstService = dto.services?.[0];
  const firstAssign = dto.assignments?.[0];
  const paymentTiming =
    String(dto.payment_timing || '').toLowerCase() === 'prepaid' ? 'prepaid' : 'postpaid';
  const paymentState =
    dto.payment_status === 'Prepaid_Paid' || dto.payment_status === 'Paid'
      ? 'paid'
      : dto.payment_status === 'Refunded'
      ? 'refunded'
      : 'unpaid';

  return {
    id: String(dto.id),
    code: dto.code,
    userId: dto.customer?.user_id ? String(dto.customer.user_id) : undefined,
    service: firstService?.service_name || 'Dịch vụ thú cưng',
    doctorId: firstAssign ? String(firstAssign.employee_id) : undefined,
    doctorName: firstAssign?.employee_name || undefined,
    petType: 'Chó',
    petName: dto.pet?.name || `Pet #${dto.pet_id}`,
    date: dateIso,
    timeSlot: `${startTime} - ${endTime}`,
    startTime,
    endTime,
    durationMinutes,
    fullName: dto.customer?.full_name || 'Khách hàng Animora',
    phone: '',
    note: dto.customer_note || undefined,
    paymentTiming,
    paymentState,
    paymentMethod: paymentTiming === 'prepaid' ? 'vnpay' : 'counter',
    estimatedPrice: Number(dto.total_amount || 0),
    status: mapBackendStatusToFrontend(dto.status),
    cancelledAt: dto.cancelled_at || undefined,
    internalNote: dto.internal_note || undefined,
    createdAt: dto.created_at || new Date().toISOString(),
    // Preserve raw numeric IDs & expiry for payment/reschedule calls
    ...(dto.payment_expires_at ? { paymentExpiresAt: dto.payment_expires_at } : {}),
  } as Booking & { paymentExpiresAt?: string };
}

export async function fetchBookings(): Promise<Booking[]> {
  try {
    const items = await api<BackendBookingDTO[]>('/bookings?page=1&limit=100');
    return Array.isArray(items) ? items.map(mapBackendBookingToFrontend) : [];
  } catch (err) {
    if (err instanceof ApiClientError && (err.statusCode === 401 || err.isNetworkError)) {
      return [];
    }
    throw err;
  }
}

export async function fetchBookingAvailabilityApi(params: {
  date: string;
  petId?: number;
  expertId?: number;
}): Promise<BookingAvailabilityResponse> {
  const searchParams = new URLSearchParams({ date: params.date });
  if (params.petId) searchParams.set('pet_id', String(params.petId));
  if (params.expertId) searchParams.set('expert_id', String(params.expertId));
  return await api<BookingAvailabilityResponse>(
    `/bookings/availability?${searchParams.toString()}`
  );
}

export async function createBookingApi(
  payload: CreateBackendBookingPayload
): Promise<BackendBookingDTO> {
  return await api<BackendBookingDTO>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function cancelBookingApi(
  bookingId: number,
  reason?: string
): Promise<{ booking: BackendBookingDTO; cancel_fee: number }> {
  return await api<{ booking: BackendBookingDTO; cancel_fee: number }>(
    `/bookings/${bookingId}/cancel`,
    {
      method: 'PATCH',
      body: JSON.stringify({ reason: reason || '' }),
    }
  );
}

export async function rescheduleBookingApi(
  bookingId: number,
  scheduledAtIso: string,
  reason?: string
): Promise<BackendBookingDTO> {
  return await api<BackendBookingDTO>(`/bookings/${bookingId}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ scheduled_at: scheduledAtIso, reason: reason || '' }),
  });
}

export async function fetchBackendServicesForLookup(): Promise<
  Array<{ id: number; name: string; price: number; duration_min: number }>
> {
  try {
    return await api<Array<{ id: number; name: string; price: number; duration_min: number }>>(
      '/services?limit=100&status=active'
    );
  } catch {
    return [];
  }
}

export async function fetchBackendMyPetsForLookup(): Promise<
  Array<{ id: number; name: string; species: string }>
> {
  try {
    return await api<Array<{ id: number; name: string; species: string }>>('/pets?limit=100');
  } catch {
    return [];
  }
}
