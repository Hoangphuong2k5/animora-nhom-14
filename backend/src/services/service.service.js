import serviceRepository from '../repositories/service.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * Chuẩn hóa payload đầu vào khớp với schema AnimoraDB
 */
const normalizePayload = (payload) => {
  const data = { ...payload };

  if (data.duration_minutes !== undefined && data.duration_min === undefined) {
    data.duration_min = data.duration_minutes;
    delete data.duration_minutes;
  }

  if (data.allow_pay_later !== undefined && data.allow_postpay === undefined) {
    data.allow_postpay = data.allow_pay_later;
    delete data.allow_pay_later;
  }

  if (data.cancellation_policy !== undefined && data.cancel_policy === undefined) {
    data.cancel_policy = data.cancellation_policy;
    delete data.cancellation_policy;
  }

  if (data.status !== undefined && data.is_active === undefined) {
    data.is_active = data.status === 'active';
    delete data.status;
  }

  return data;
};

/**
 * Định dạng dữ liệu trả về cho FE (bao gồm cả aliases thuận tiện)
 */
const formatService = (service) => {
  if (!service) return null;
  const durationMin = service.duration_min ?? service.EstimatedDurationMinutes ?? 60;
  const isActive = service.is_active !== undefined ? Boolean(service.is_active) : Boolean(service.IsActive);
  const freeCancelHours = service.free_cancel_hours ?? 24;
  const lateThresholdHours = service.late_threshold_hours ?? 3;
  const lateFeePercent = service.late_fee_percent ?? 50;

  return {
    ...service,
    id: service.id ?? service.ServiceID,
    name: service.name ?? service.ServiceName,
    price: Number(service.price ?? service.BasePrice ?? 0),
    duration_min: durationMin,
    duration_minutes: durationMin,
    allow_postpay: Boolean(service.allow_postpay),
    allow_pay_later: Boolean(service.allow_postpay),
    free_cancel_hours: freeCancelHours,
    late_threshold_hours: lateThresholdHours,
    late_fee_percent: lateFeePercent,
    cancellation_policy: service.cancel_policy ?? null,
    is_active: isActive,
    status: isActive ? 'active' : 'inactive',
  };
};

/**
 * [SVC-01] Lấy danh sách dịch vụ phân trang
 */
const getServices = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const search = queryParams.search || '';
  const category = queryParams.category || queryParams.serviceCategoryId || null;
  const service_kind = queryParams.service_kind || null;

  let is_active = undefined;
  if (queryParams.is_active !== undefined) {
    is_active = queryParams.is_active === 'true' || queryParams.is_active === true;
  } else if (queryParams.status !== undefined) {
    is_active = queryParams.status === 'active';
  }

  const { items, totalItems } = await serviceRepository.findServicesPaginated({
    page,
    limit,
    search,
    category,
    service_kind,
    is_active,
  });

  return {
    items: items.map(formatService),
    page,
    limit,
    totalItems,
  };
};

/**
 * [SVC-01] Xem chi tiết một dịch vụ
 */
const getServiceById = async (serviceId) => {
  const service = await serviceRepository.findById(serviceId);
  if (!service) {
    throw new ApiError(404, 'Không tìm thấy thông tin dịch vụ', 'SERVICE_NOT_FOUND');
  }

  return formatService(service);
};

/**
 * [SVC-01] Admin: Tạo mới dịch vụ
 */
const createService = async (payload) => {
  const cleanData = normalizePayload(payload);

  const existingService = await serviceRepository.findByName(cleanData.name);
  if (existingService) {
    throw new ApiError(409, 'Tên dịch vụ này đã tồn tại trong hệ thống', 'SERVICE_NAME_EXISTS');
  }

  const freeCancel = cleanData.free_cancel_hours !== undefined ? cleanData.free_cancel_hours : 24;
  const lateThreshold =
    cleanData.late_threshold_hours !== undefined ? cleanData.late_threshold_hours : 3;

  if (lateThreshold > freeCancel) {
    throw new ApiError(
      400,
      'Ngưỡng hủy trễ (late_threshold_hours) không được lớn hơn thời gian hủy miễn phí (free_cancel_hours)',
      'INVALID_CANCEL_POLICY'
    );
  }

  const created = await serviceRepository.createService({
    ...cleanData,
    service_kind: cleanData.service_kind || 'care',
    is_active: cleanData.is_active !== undefined ? cleanData.is_active : true,
  });

  return formatService(created);
};

/**
 * [SVC-01] Admin: Cập nhật thông tin dịch vụ
 */
const updateService = async (serviceId, payload) => {
  const service = await serviceRepository.findById(serviceId);
  if (!service) {
    throw new ApiError(404, 'Không tìm thấy dịch vụ cần cập nhật', 'SERVICE_NOT_FOUND');
  }

  const cleanData = normalizePayload(payload);

  if (cleanData.name && cleanData.name.trim() !== service.name) {
    const existing = await serviceRepository.findByName(cleanData.name);
    if (existing && Number(existing.id) !== Number(serviceId)) {
      throw new ApiError(409, 'Tên dịch vụ này đã tồn tại trong hệ thống', 'SERVICE_NAME_EXISTS');
    }
  }

  const freeCancel =
    cleanData.free_cancel_hours !== undefined
      ? cleanData.free_cancel_hours
      : service.free_cancel_hours ?? 24;
  const lateThreshold =
    cleanData.late_threshold_hours !== undefined
      ? cleanData.late_threshold_hours
      : service.late_threshold_hours ?? 3;

  if (lateThreshold > freeCancel) {
    throw new ApiError(
      400,
      'Ngưỡng hủy trễ không được lớn hơn thời gian hủy miễn phí',
      'INVALID_CANCEL_POLICY'
    );
  }

  const updated = await serviceRepository.updateService(serviceId, cleanData);
  return formatService(updated);
};

/**
 * [SVC-01] Admin: Cập nhật trạng thái dịch vụ
 */
const updateServiceStatus = async (serviceId, statusPayload) => {
  const service = await serviceRepository.findById(serviceId);
  if (!service) {
    throw new ApiError(404, 'Không tìm thấy dịch vụ', 'SERVICE_NOT_FOUND');
  }

  let is_active = service.is_active;
  if (typeof statusPayload === 'boolean') {
    is_active = statusPayload;
  } else if (typeof statusPayload === 'object') {
    if (statusPayload.is_active !== undefined) {
      is_active = !!statusPayload.is_active;
    } else if (statusPayload.status !== undefined) {
      is_active = statusPayload.status === 'active';
    }
  } else if (typeof statusPayload === 'string') {
    is_active = statusPayload === 'active';
  }

  const updated = await serviceRepository.updateService(serviceId, { is_active });
  return formatService(updated);
};

/**
 * [SVC-01] Admin: Xóa dịch vụ (soft delete: chuyển is_active = false)
 */
const deleteService = async (serviceId) => {
  const service = await serviceRepository.findById(serviceId);
  if (!service) {
    throw new ApiError(404, 'Không tìm thấy dịch vụ', 'SERVICE_NOT_FOUND');
  }

  await serviceRepository.deleteService(serviceId);
  return { deleted: true, serviceId };
};

export {
  getServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
  deleteService,
};
export default {
  getServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
  deleteService,
};
