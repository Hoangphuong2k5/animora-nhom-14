/**
 * DTOs cho phân hệ Đặt lịch & Thanh toán (AnimoraDB ver 1.5)
 */
const toBookingDTO = (appointment) => {
  if (!appointment) return null;
  const id = Number(appointment.AppointmentID ?? appointment.id);
  return Object.freeze({
    id,
    AppointmentID: id,
    code: String(appointment.AppointmentCode ?? appointment.code),
    customer_id: Number(appointment.CustomerID ?? appointment.customer_id),
    pet_id: Number(appointment.PetID ?? appointment.pet_id),
    scheduled_at: appointment.AppointmentAt ?? appointment.scheduled_at,
    end_at: appointment.AppointmentEndAt ?? appointment.end_at ?? null,
    status: String(appointment.AppointmentStatus ?? appointment.status ?? 'Pending'),
    payment_timing: String(appointment.PaymentTiming ?? appointment.payment_timing ?? 'Postpaid'),
    payment_status: String(appointment.PaymentStatus ?? appointment.payment_status ?? 'Postpaid_Pending'),
    payment_expires_at: appointment.PaymentExpiresAt ?? null,
    total_amount: Number(appointment.TotalAmount ?? appointment.total_amount ?? 0),
    cancelled_at: appointment.CancelledAt ?? null,
    customer_note: appointment.CustomerNote ?? null,
    internal_note: appointment.InternalNote ?? null,
    created_at: appointment.CreatedAt ?? null,
    updated_at: appointment.UpdatedAt ?? null,
    pet: appointment.pet
      ? {
          id: Number(appointment.pet.PetID ?? appointment.pet.id),
          name: appointment.pet.PetName ?? appointment.pet.name,
        }
      : undefined,
    customer: appointment.customer
      ? {
          id: Number(appointment.customer.CustomerID ?? appointment.customer.id),
          user_id: Number(appointment.customer.UserID ?? appointment.customer.user_id),
          full_name: appointment.customer.FullName ?? appointment.customer.full_name,
        }
      : undefined,
    services: Array.isArray(appointment.services)
      ? appointment.services.map((s) => ({
          id: Number(s.AppointmentServiceID ?? s.id),
          service_id: Number(s.ServiceID ?? s.service_id),
          service_name: s.ServiceName ?? s.service_name ?? null,
          quantity: Number(s.Quantity ?? 1),
          unit_price: Number(s.UnitPrice ?? 0),
          notes: s.Notes ?? null,
        }))
      : [],
    assignments: Array.isArray(appointment.assignments)
      ? appointment.assignments.map((a) => ({
          id: Number(a.AssignmentID ?? a.id),
          employee_id: Number(a.EmployeeID ?? a.employee_id),
          employee_name: a.FullName ?? a.employee_name ?? null,
          role: a.AssignmentRole ?? a.role,
          assigned_at: a.AssignedAt ?? null,
        }))
      : [],
  });
};

const toPaymentDTO = (payment) => {
  if (!payment) return null;
  const id = Number(payment.PaymentID ?? payment.id);
  return Object.freeze({
    id,
    PaymentID: id,
    payment_code: String(payment.PaymentCode ?? payment.payment_code),
    customer_id: Number(payment.CustomerID ?? payment.customer_id),
    appointment_id: payment.AppointmentID ? Number(payment.AppointmentID) : null,
    order_id: payment.OrderID ? Number(payment.OrderID) : null,
    payment_method_id: Number(payment.PaymentMethodID ?? payment.payment_method_id),
    method_code: payment.MethodCode ?? null,
    method_name: payment.MethodName ?? null,
    amount: Number(payment.Amount ?? 0),
    status: String(payment.PaymentStatus ?? payment.status ?? 'Pending'),
    paid_at: payment.PaidAt ?? null,
    confirmed_by: payment.ConfirmedByUserID ? Number(payment.ConfirmedByUserID) : null,
    confirmed_at: payment.ConfirmedAt ?? null,
    created_at: payment.CreatedAt ?? null,
  });
};

export { toBookingDTO, toPaymentDTO };
export default { toBookingDTO, toPaymentDTO };

