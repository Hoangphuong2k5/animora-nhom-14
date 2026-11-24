/**
 * Strongly-Typed DTO & Explicit Mappers cho phân hệ Chuyên viên (AnimoraDB ver 1.5)
 */
const parseSpecialties = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch (e) {
    return String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
};

const toAppExpertType = (employeeType) => {
  if (!employeeType) return 'groomer';
  const lower = String(employeeType).toLowerCase();
  if (lower === 'doctor' || lower === 'vet') return 'vet';
  if (lower === 'trainer') return 'trainer';
  if (lower === 'carestaff' || lower === 'groomer') return 'groomer';
  return lower;
};

const toCertificateDTO = (certEntity) => {
  if (!certEntity) return null;
  const approvalStatus = certEntity.ApprovalStatus || 'Pending';
  return Object.freeze({
    id: Number(certEntity.CertificateID ?? certEntity.id),
    expert_id: Number(certEntity.EmployeeID ?? certEntity.expert_id),
    name: String(certEntity.CertificateName ?? certEntity.name),
    certificate_number: certEntity.CertificateNumber ?? certEntity.certificate_number ?? null,
    issuer: certEntity.IssuingOrganization ?? certEntity.issuer ?? null,
    issued_date: certEntity.IssuedDate ?? certEntity.issued_date ?? null,
    expiry_date: certEntity.ExpiryDate ?? certEntity.expiry_date ?? null,
    year: certEntity.IssuedDate
      ? new Date(certEntity.IssuedDate).getUTCFullYear()
      : certEntity.year ?? null,
    file_url: certEntity.CertificateUrl ?? certEntity.file_url ?? null,
    approval_status: approvalStatus,
    is_verified:
      certEntity.is_verified !== undefined
        ? Boolean(certEntity.is_verified)
        : approvalStatus === 'Approved',
  });
};

const toServiceSummaryDTO = (svcEntity) => {
  if (!svcEntity) return null;
  return Object.freeze({
    id: Number(svcEntity.ServiceID ?? svcEntity.id),
    name: String(svcEntity.ServiceName ?? svcEntity.name),
    category: svcEntity.CategoryName ?? svcEntity.category ?? null,
    service_kind: String(svcEntity.service_kind || 'care'),
    price: Number(svcEntity.BasePrice ?? svcEntity.price ?? 0),
    duration_min: Number(svcEntity.EstimatedDurationMinutes ?? svcEntity.duration_min ?? 60),
    allow_postpay: Boolean(svcEntity.allow_postpay),
  });
};

const toSlotDTO = (scheduleOrSlot) => {
  if (!scheduleOrSlot) return null;
  const id = Number(
    scheduleOrSlot.EmployeeWorkScheduleID ?? scheduleOrSlot.id
  );
  const scheduleStatus = scheduleOrSlot.ScheduleStatus ?? scheduleOrSlot.status ?? 'Scheduled';
  return Object.freeze({
    id,
    schedule_id: id,
    work_shift_id: scheduleOrSlot.WorkShiftID ? Number(scheduleOrSlot.WorkShiftID) : null,
    shift_name: scheduleOrSlot.ShiftName || null,
    start_time: String(scheduleOrSlot.StartTime ?? scheduleOrSlot.start_time ?? '08:00:00'),
    end_time: String(scheduleOrSlot.EndTime ?? scheduleOrSlot.end_time ?? '17:00:00'),
    status: scheduleStatus === 'Cancelled' || scheduleStatus === 'off' ? 'off' : 'available',
    schedule_status: scheduleStatus,
  });
};

const toScheduleDTO = (scheduleEntity, slots = []) => {
  if (!scheduleEntity) return null;
  const id = Number(scheduleEntity.EmployeeWorkScheduleID ?? scheduleEntity.id);
  const expertId = Number(scheduleEntity.EmployeeID ?? scheduleEntity.expert_id);
  const rawSlots =
    slots.length > 0
      ? slots
      : Array.isArray(scheduleEntity.slots) && scheduleEntity.slots.length > 0
        ? scheduleEntity.slots
        : [scheduleEntity];

  return Object.freeze({
    id,
    expert_id: expertId,
    work_date: scheduleEntity.WorkDate ?? scheduleEntity.work_date,
    work_shift_id: scheduleEntity.WorkShiftID ? Number(scheduleEntity.WorkShiftID) : null,
    shift_name: scheduleEntity.ShiftName || null,
    schedule_status: scheduleEntity.ScheduleStatus ?? scheduleEntity.status ?? 'Scheduled',
    note: scheduleEntity.note ? String(scheduleEntity.note) : null,
    slots: rawSlots.map(toSlotDTO),
  });
};

const toExpertSummaryDTO = (expertEntity) => {
  if (!expertEntity) return null;
  const id = Number(expertEntity.EmployeeID ?? expertEntity.id);
  const userId = Number(expertEntity.UserID ?? expertEntity.user_id);
  const employeeType = expertEntity.EmployeeType ?? expertEntity.type;
  const isActive = expertEntity.IsActive !== undefined ? Boolean(expertEntity.IsActive) : true;
  const status =
    expertEntity.status ||
    (isActive ? 'approved' : 'pending');

  const fullName =
    expertEntity.FullName ||
    expertEntity.user?.full_name ||
    expertEntity.user?.fullName ||
    null;

  return Object.freeze({
    id,
    user_id: userId,
    type: toAppExpertType(employeeType),
    employee_type: String(employeeType),
    employment_type: 'FullTime',
    license_no: expertEntity.license_no ?? expertEntity.Specialization ?? null,
    specialization: expertEntity.Specialization ?? null,
    bio: expertEntity.Biography ?? expertEntity.bio ?? null,
    years_of_experience:
      expertEntity.YearsOfExperience !== null && expertEntity.YearsOfExperience !== undefined
        ? Number(expertEntity.YearsOfExperience)
        : null,
    specialties: parseSpecialties(expertEntity.specialties ?? expertEntity.Specialization),
    rating: Number(expertEntity.rating || 0),
    rating_count: Number(expertEntity.rating_count || 0),
    status: String(status),
    is_active: isActive,
    user: expertEntity.user
      ? Object.freeze({
          id: Number(expertEntity.user.UserID ?? expertEntity.user.id),
          full_name: String(fullName || ''),
          email: String(expertEntity.user.Email ?? expertEntity.user.email ?? ''),
          phone: expertEntity.user.PhoneNumber ?? expertEntity.user.phone ?? null,
          avatar: expertEntity.AvatarUrl ?? expertEntity.user.avatar ?? null,
        })
      : fullName
        ? Object.freeze({
            id: userId,
            full_name: String(fullName),
            email: '',
            phone: null,
            avatar: expertEntity.AvatarUrl || null,
          })
        : null,
    services: Array.isArray(expertEntity.services)
      ? expertEntity.services.map(toServiceSummaryDTO)
      : [],
    certificates: Array.isArray(expertEntity.certificates)
      ? expertEntity.certificates.map(toCertificateDTO)
      : undefined,
  });
};

const toExpertAdminDTO = (expertEntity) => {
  if (!expertEntity) return null;
  return Object.freeze({
    ...toExpertSummaryDTO(expertEntity),
    hire_date: expertEntity.HireDate || null,
    created_at: expertEntity.CreatedAt || expertEntity.created_at || null,
    certificates: Array.isArray(expertEntity.certificates)
      ? expertEntity.certificates.map(toCertificateDTO)
      : [],
  });
};

const toExpertPublicDetailDTO = (expertEntity) => {
  if (!expertEntity) return null;
  return Object.freeze({
    ...toExpertSummaryDTO(expertEntity),
    certificates: Array.isArray(expertEntity.certificates)
      ? expertEntity.certificates.map(toCertificateDTO)
      : [],
    schedules: Array.isArray(expertEntity.schedules)
      ? expertEntity.schedules.map((s) => toScheduleDTO(s))
      : [],
    reviews: Array.isArray(expertEntity.reviews)
      ? expertEntity.reviews.map((r) =>
          Object.freeze({
            id: Number(r.ReviewID ?? r.id),
            booking_id: Number(r.AppointmentID ?? r.booking_id),
            rating: Number(r.Rating ?? r.rating),
            comment: r.ReviewContent ?? r.comment ?? null,
            created_at: r.CreatedAt ?? r.created_at,
            customer: r.customer
              ? Object.freeze({
                  id: Number(r.customer.CustomerID ?? r.customer.id),
                  full_name: String(r.customer.FullName ?? r.customer.full_name ?? ''),
                  avatar: r.customer.AvatarUrl ?? r.customer.avatar ?? null,
                })
              : null,
          })
        )
      : [],
  });
};

export {
  parseSpecialties,
  toAppExpertType,
  toCertificateDTO,
  toServiceSummaryDTO,
  toSlotDTO,
  toScheduleDTO,
  toExpertSummaryDTO,
  toExpertAdminDTO,
  toExpertPublicDetailDTO,
};
export default {
  parseSpecialties,
  toAppExpertType,
  toCertificateDTO,
  toServiceSummaryDTO,
  toSlotDTO,
  toScheduleDTO,
  toExpertSummaryDTO,
  toExpertAdminDTO,
  toExpertPublicDetailDTO,
};
