import Joi from 'joi';

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID phải là số nguyên dương',
  }),
});

const onboardExpertSchema = {
  body: Joi.object({
    user_id: Joi.number().integer().positive().optional(),
    type: Joi.string().valid('vet', 'groomer', 'trainer').required().messages({
      'any.only': 'Loại chuyên viên phải là vet, groomer hoặc trainer',
      'any.required': 'Vui lòng chọn loại chuyên viên',
    }),
    license_no: Joi.string().max(100).allow('', null).optional(),
    bio: Joi.string().max(2000).allow('', null).optional(),
    specialties: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    base_salary: Joi.number().min(0).optional(),
    commission_rate: Joi.number().min(0).max(1).optional(),
    certificates: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().max(150).required(),
          issuer: Joi.string().max(150).allow('', null).optional(),
          year: Joi.number().integer().min(1980).max(2030).optional(),
          file_url: Joi.string().max(255).allow('', null).optional(),
        })
      )
      .optional(),
  }),
};

const createPresignedUrlSchema = {
  body: Joi.object({
    file_name: Joi.string()
      .max(150)
      .pattern(/\.(jpg|jpeg|png|webp|pdf)$/i)
      .required()
      .messages({
        'string.pattern.base': 'Chỉ cho phép cấp Pre-signed URL cho file .jpg, .png, .webp hoặc .pdf',
        'any.required': 'Tên file (file_name) là bắt buộc',
      }),
    content_type: Joi.string()
      .valid('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
      .required()
      .messages({
        'any.only': 'content_type phải là image/jpeg, image/png, image/webp hoặc application/pdf',
      }),
  }),
};

const addCertificateSchema = {
  body: Joi.object({
    expert_id: Joi.number().integer().positive().optional(),
    name: Joi.string().max(150).required().messages({
      'any.required': 'Tên chứng chỉ là bắt buộc',
    }),
    issuer: Joi.string().max(150).allow('', null).optional(),
    year: Joi.number().integer().min(1980).max(2030).optional(),
    file_url: Joi.string().max(255).required().messages({
      'any.required': 'Đường dẫn file chứng chỉ trên Cloud (file_url) là bắt buộc',
    }),
  }),
};

const verifyExpertSchema = {
  params: idParamSchema,
  body: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required().messages({
      'any.only': 'Trạng thái duyệt phải là approved hoặc rejected',
      'any.required': 'Trạng thái duyệt là bắt buộc',
    }),
    type: Joi.string().valid('vet', 'groomer', 'trainer').optional(),
    base_salary: Joi.number().min(0).optional(),
    commission_rate: Joi.number().min(0).max(1).optional(),
    verify_all_certificates: Joi.boolean().default(true),
    reason: Joi.string().max(255).allow('', null).optional(),
  }),
};

const assignServicesSchema = {
  params: idParamSchema,
  body: Joi.object({
    service_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.min': 'Vui lòng chọn ít nhất 1 dịch vụ để gán cho chuyên viên',
      'any.required': 'Danh sách service_ids là bắt buộc',
    }),
  }),
};

const upsertScheduleSchema = {
  body: Joi.object({
    work_shift_id: Joi.number().integer().positive().optional(),
    work_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        'string.pattern.base': 'Ngày làm việc (work_date) phải có định dạng YYYY-MM-DD',
      }),
    note: Joi.string().max(255).allow('', null).optional(),
    is_day_off: Joi.boolean().default(false),
    shift_start: Joi.string()
      .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
      .default('08:00'),
    shift_end: Joi.string()
      .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
      .default('17:00'),
    slot_duration_min: Joi.number().integer().valid(30, 45, 60, 90, 120).default(60),
    break_start: Joi.string()
      .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
      .allow('', null)
      .default('12:00'),
    break_end: Joi.string()
      .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
      .allow('', null)
      .default('13:00'),
    custom_slots: Joi.array()
      .items(
        Joi.object({
          start_time: Joi.string()
            .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
            .required(),
          end_time: Joi.string()
            .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
            .required(),
          status: Joi.string().valid('available', 'off').default('available'),
        })
      )
      .optional(),
  }),
};

const updateSlotStatusSchema = {
  params: Joi.object({
    slotId: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('available', 'off').required().messages({
      'any.only': 'Trạng thái slot chỉ có thể chuyển sang available hoặc off',
    }),
  }),
};

const searchExpertsQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    after_id: Joi.number().integer().min(0).optional(),
    type: Joi.string().valid('vet', 'groomer', 'trainer').optional(),
    min_rating: Joi.number().min(0).max(5).optional(),
    service_id: Joi.number().integer().positive().optional(),
    work_shift_id: Joi.number().integer().positive().optional(),
    work_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    start_time: Joi.string()
      .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
      .optional(),
    search: Joi.string().max(100).allow('').optional(),
  }),
};

const rejectBookingSchema = {
  params: idParamSchema,
  body: Joi.object({
    reason: Joi.string().max(255).required().messages({
      'any.required': 'Vui lòng nhập lý do từ chối lịch hẹn',
    }),
  }),
};

const updateBookingSpecialStatusSchema = {
  params: idParamSchema,
  body: Joi.object({
    status: Joi.string().valid('in_progress', 'no_show', 'late').required().messages({
      'any.only': 'Trạng thái cập nhật phải là in_progress, no_show hoặc late',
      'any.required': 'Trạng thái là bắt buộc',
    }),
    late_minutes: Joi.number().integer().min(1).optional(),
    note: Joi.string().max(500).allow('', null).optional(),
  }),
};

const completeBookingSchema = {
  params: idParamSchema,
  body: Joi.object({
    care_type: Joi.string().valid('grooming', 'checkup', 'vaccination', 'deworming', 'other').optional(),
    care_note: Joi.string().max(255).allow('', null).optional(),
  }),
};

export {
  idParamSchema,
  onboardExpertSchema,
  createPresignedUrlSchema,
  addCertificateSchema,
  verifyExpertSchema,
  assignServicesSchema,
  upsertScheduleSchema,
  updateSlotStatusSchema,
  searchExpertsQuerySchema,
  rejectBookingSchema,
  updateBookingSpecialStatusSchema,
  completeBookingSchema,
};
export default {
  idParamSchema,
  onboardExpertSchema,
  createPresignedUrlSchema,
  addCertificateSchema,
  verifyExpertSchema,
  assignServicesSchema,
  upsertScheduleSchema,
  updateSlotStatusSchema,
  searchExpertsQuerySchema,
  rejectBookingSchema,
  updateBookingSpecialStatusSchema,
  completeBookingSchema,
};
