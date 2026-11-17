import { AppDataSource } from '../config/data-source.js';
import defaultAdoptionRepo from '../repositories/adoption.repository.js';
import defaultNotificationRepo from '../repositories/notification.repository.js';
import ApiError from '../utils/ApiError.js';

const STAFF_ROLES = new Set(['admin', 'manager', 'staff']);
const RESCUE_ROLES = new Set(['shelter', 'rescue_station', 'rescuestation']);

const ALLOWED_REVIEW_TRANSITIONS = {
  Pending: ['UnderReview', 'Approved', 'Rejected', 'Withdrawn'],
  UnderReview: ['Approved', 'Rejected', 'Withdrawn'],
  Approved: ['Rejected', 'Withdrawn'],
  Rejected: [],
  Withdrawn: [],
  Completed: [],
};

const toListingDTO = (row) => {
  if (!row) return null;
  return Object.freeze({
    id: Number(row.AdoptionListingID),
    pet_id: Number(row.PetID),
    rescue_station_id: Number(row.RescueStationID),
    title: row.ListingTitle,
    description: row.Description ?? null,
    health_summary: row.HealthSummary ?? null,
    temperament: row.Temperament ?? null,
    adoption_requirements: row.AdoptionRequirements ?? null,
    status: row.ListingStatus,
    published_at: row.PublishedAt ?? null,
    created_at: row.CreatedAt ?? null,
    pet_name: row.PetName ?? null,
    species: row.SpeciesName ?? null,
    breed: row.BreedName ?? null,
    gender: row.Gender ?? null,
    weight_kg: row.WeightKg !== undefined && row.WeightKg !== null ? Number(row.WeightKg) : null,
    color: row.Color ?? null,
    image_url: row.PrimaryImageUrl ?? null,
    station_name: row.StationName ?? null,
    station_address: row.StationAddress ?? null,
  });
};

const toApplicationDTO = (row) => {
  if (!row) return null;
  return Object.freeze({
    id: Number(row.AdoptionApplicationID),
    listing_id: Number(row.AdoptionListingID),
    customer_id: Number(row.CustomerID),
    pet_id: row.PetID ? Number(row.PetID) : null,
    pet_name: row.PetName ?? null,
    listing_title: row.ListingTitle ?? null,
    listing_status: row.ListingStatus ?? null,
    rescue_station_id: row.RescueStationID ? Number(row.RescueStationID) : null,
    station_name: row.StationName ?? null,
    status: row.ApplicationStatus,
    applicant_reason: row.ApplicantReason ?? null,
    living_environment: row.LivingEnvironment ?? null,
    experience_description: row.ExperienceDescription ?? null,
    customer_name: row.CustomerName ?? null,
    customer_email: row.CustomerEmail ?? null,
    customer_phone: row.CustomerPhone ?? null,
    reviewed_by: row.ReviewedByUserID ? Number(row.ReviewedByUserID) : null,
    reviewed_at: row.ReviewedAt ?? null,
    review_note: row.ReviewNote ?? null,
    handover_confirmed_by_station_at: row.HandoverConfirmedByStationAt ?? null,
    handover_confirmed_by_customer_at: row.HandoverConfirmedByCustomerAt ?? null,
    handover_note: row.HandoverNote ?? null,
    created_at: row.CreatedAt ?? null,
  });
};

class AdoptionService {
  constructor(
    adoptionRepo = defaultAdoptionRepo,
    notificationRepo = defaultNotificationRepo,
    dataSource = AppDataSource
  ) {
    this.adoptionRepo = adoptionRepo;
    this.notificationRepo = notificationRepo;
    this.dataSource = dataSource;
  }

  isStaffUser(currentUser) {
    const role = String(currentUser.role || '').toLowerCase();
    const dbRole = String(currentUser.dbRole || '').toLowerCase();
    return STAFF_ROLES.has(role) || dbRole === 'admin' || dbRole === 'manager';
  }

  isRescueUser(currentUser) {
    const role = String(currentUser.role || '').toLowerCase();
    const dbRole = String(currentUser.dbRole || '').toLowerCase();
    return RESCUE_ROLES.has(role) || dbRole === 'rescuestation';
  }

  async executeLockedTransaction(callback) {
    if (typeof this.adoptionRepo.runSerializableTransaction === 'function') {
      return await this.adoptionRepo.runSerializableTransaction(callback);
    }
    return await this.dataSource.transaction(callback);
  }

  async listListings(query = {}) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
    const { items, totalItems } = await this.adoptionRepo.findListings({
      page,
      limit,
      status: query.status || null,
      species: query.species || null,
      search: query.search || '',
    });
    return {
      items: items.map(toListingDTO),
      page,
      limit,
      totalItems,
    };
  }

  async createListing(currentUser, payload) {
    let stationId = payload.rescue_station_id ? Number(payload.rescue_station_id) : null;
    if (!stationId && this.isRescueUser(currentUser)) {
      const station = await this.adoptionRepo.findRescueStationByUserId(currentUser.id);
      if (!station) {
        throw new ApiError(404, 'Không tìm thấy hồ sơ trạm cứu hộ', 'RESCUE_STATION_NOT_FOUND');
      }
      stationId = Number(station.RescueStationID);
    }

    if (!stationId) {
      throw new ApiError(400, 'Vui lòng chọn trạm cứu hộ (rescue_station_id)', 'RESCUE_STATION_REQUIRED');
    }

    const station = await this.adoptionRepo.findRescueStationById(stationId);
    if (!station) {
      throw new ApiError(404, 'Trạm cứu hộ không tồn tại hoặc đã ngừng hoạt động', 'RESCUE_STATION_NOT_FOUND');
    }

    const pet = await this.adoptionRepo.findPetById(payload.pet_id);
    if (!pet) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ thú cưng', 'PET_NOT_FOUND');
    }

    const created = await this.executeLockedTransaction(async (manager) => {
      const existingOpen = await this.adoptionRepo.findOpenListingByPetId(pet.PetID, manager);
      if (existingOpen) {
        throw new ApiError(
          409,
          'Thú cưng này đã có tin nhận nuôi đang mở trên hệ thống',
          'ADOPTION_LISTING_ALREADY_OPEN'
        );
      }

      const listingStatus = payload.status || 'Available';
      return await this.adoptionRepo.createListing(
        {
          PetID: Number(pet.PetID),
          RescueStationID: stationId,
          ListingTitle: payload.title,
          Description: payload.description || null,
          HealthSummary: payload.health_summary || null,
          Temperament: payload.temperament || null,
          AdoptionRequirements: payload.adoption_requirements || null,
          ListingStatus: listingStatus,
          PublishedAt: listingStatus === 'Available' ? new Date() : null,
        },
        manager
      );
    });

    return toListingDTO(created);
  }

  async listApplications(currentUser, query = {}) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;

    let customerId = null;
    let rescueStationId = null;

    if (this.isStaffUser(currentUser)) {
      rescueStationId = query.rescue_station_id ? Number(query.rescue_station_id) : null;
    } else if (this.isRescueUser(currentUser)) {
      const station = await this.adoptionRepo.findRescueStationByUserId(currentUser.id);
      if (!station) {
        throw new ApiError(404, 'Không tìm thấy hồ sơ trạm cứu hộ', 'RESCUE_STATION_NOT_FOUND');
      }
      rescueStationId = Number(station.RescueStationID);
    } else {
      const customer = await this.adoptionRepo.resolveCustomerByUserId(currentUser.id);
      if (!customer) {
        throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
      }
      customerId = Number(customer.CustomerID);
    }

    const { items, totalItems } = await this.adoptionRepo.findApplications({
      customerId,
      rescueStationId,
      status: query.status || null,
      page,
      limit,
    });

    return {
      items: items.map(toApplicationDTO),
      page,
      limit,
      totalItems,
    };
  }

  async submitApplication(currentUser, payload) {
    const customer = await this.adoptionRepo.resolveCustomerByUserId(currentUser.id);
    if (!customer) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
    }

    const created = await this.executeLockedTransaction(async (manager) => {
      const listing = await this.adoptionRepo.findListingById(payload.listing_id, manager, true);
      if (!listing) {
        throw new ApiError(404, 'Không tìm thấy tin nhận nuôi', 'ADOPTION_LISTING_NOT_FOUND');
      }

      if (listing.ListingStatus !== 'Available') {
        throw new ApiError(
          400,
          'Thú cưng này hiện không còn mở nhận nuôi',
          'LISTING_NOT_AVAILABLE'
        );
      }

      const dupApp = await this.adoptionRepo.findActiveApplicationByListingAndCustomer(
        listing.AdoptionListingID,
        customer.CustomerID,
        manager
      );
      if (dupApp) {
        throw new ApiError(
          409,
          'Bạn đã gửi yêu cầu nhận nuôi đang chờ xử lý cho thú cưng này rồi',
          'DUPLICATE_ADOPTION_APPLICATION'
        );
      }

      const approvedApp = await this.adoptionRepo.findApprovedOrCompletedApplicationByListing(
        listing.AdoptionListingID,
        null,
        manager
      );
      if (approvedApp) {
        throw new ApiError(
          409,
          'Thú cưng này đã có hồ sơ nhận nuôi khác được phê duyệt',
          'LISTING_ALREADY_APPROVED'
        );
      }

      return await this.adoptionRepo.createApplicationAggregate(
        {
          applicationData: {
            AdoptionListingID: Number(listing.AdoptionListingID),
            CustomerID: Number(customer.CustomerID),
            ApplicationStatus: 'Pending',
            ApplicantReason: payload.applicant_reason || null,
            LivingEnvironment: payload.living_environment || null,
            ExperienceDescription: payload.experience_description || null,
          },
          historyData: {
            ChangedByUserID: Number(currentUser.id),
            OldStatus: null,
            NewStatus: 'Pending',
            ChangeNote: 'Khách hàng gửi hồ sơ đăng ký nhận nuôi',
          },
        },
        manager
      );
    });

    return toApplicationDTO(created);
  }

  async reviewApplication(currentUser, applicationId, payload) {
    const nextStatus = payload.status;
    const isStaff = this.isStaffUser(currentUser);
    const isRescue = this.isRescueUser(currentUser);

    const updated = await this.executeLockedTransaction(async (manager) => {
      const application = await this.adoptionRepo.findApplicationById(applicationId, manager, true);
      if (!application) {
        throw new ApiError(404, 'Không tìm thấy hồ sơ nhận nuôi', 'ADOPTION_APPLICATION_NOT_FOUND');
      }

      if (nextStatus === 'Withdrawn') {
        if (!isStaff && Number(application.CustomerUserID) !== Number(currentUser.id)) {
          throw new ApiError(403, 'Bạn không có quyền rút hồ sơ nhận nuôi này', 'FORBIDDEN');
        }
      } else {
        if (!isStaff && (!isRescue || Number(application.StationUserID) !== Number(currentUser.id))) {
          throw new ApiError(403, 'Bạn không có quyền xét duyệt hồ sơ nhận nuôi này', 'FORBIDDEN');
        }
      }

      const allowed = ALLOWED_REVIEW_TRANSITIONS[application.ApplicationStatus] || [];
      if (!allowed.includes(nextStatus)) {
        throw new ApiError(
          400,
          `Không thể chuyển hồ sơ từ trạng thái "${application.ApplicationStatus}" sang "${nextStatus}"`,
          'INVALID_ADOPTION_TRANSITION'
        );
      }

      if (nextStatus === 'Approved') {
        await this.adoptionRepo.findListingById(application.AdoptionListingID, manager, true);
        const existingApproved =
          await this.adoptionRepo.findApprovedOrCompletedApplicationByListing(
            application.AdoptionListingID,
            application.AdoptionApplicationID,
            manager
          );
        if (existingApproved) {
          throw new ApiError(
            409,
            'Tin nhận nuôi này đã có hồ sơ khác được phê duyệt hoặc hoàn tất',
            'LISTING_ALREADY_APPROVED'
          );
        }
        await this.adoptionRepo.updateListingStatus(application.AdoptionListingID, 'Pending', manager);
      } else if (
        ['Rejected', 'Withdrawn'].includes(nextStatus) &&
        application.ApplicationStatus === 'Approved'
      ) {
        await this.adoptionRepo.updateListingStatus(
          application.AdoptionListingID,
          'Available',
          manager
        );
      }

      const saved = await this.adoptionRepo.updateApplication(
        application.AdoptionApplicationID,
        {
          ApplicationStatus: nextStatus,
          ReviewedByUserID: Number(currentUser.id),
          ReviewedAt: new Date(),
          ReviewNote: payload.note || null,
        },
        manager
      );

      await this.adoptionRepo.addApplicationHistory(
        {
          AdoptionApplicationID: Number(application.AdoptionApplicationID),
          ChangedByUserID: Number(currentUser.id),
          OldStatus: application.ApplicationStatus,
          NewStatus: nextStatus,
          ChangeNote: payload.note || `Cập nhật trạng thái hồ sơ sang ${nextStatus}`,
        },
        manager
      );

      if (application.CustomerUserID && nextStatus !== 'Withdrawn') {
        await this.notificationRepo.createNotification(
          {
            user_id: Number(application.CustomerUserID),
            type: 'adoption_application_decided',
            title: `Cập nhật hồ sơ nhận nuôi ${application.PetName || ''}`.trim(),
            content: `Hồ sơ nhận nuôi của bạn đã được chuyển sang trạng thái ${nextStatus}.`,
            ref_type: 'AdoptionApplication',
            ref_id: Number(application.AdoptionApplicationID),
          },
          manager
        );
      }

      return saved;
    });

    return toApplicationDTO(updated);
  }

  async scheduleHandover(currentUser, applicationId, payload) {
    const application = await this.adoptionRepo.findApplicationById(applicationId);
    if (!application) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ nhận nuôi', 'ADOPTION_APPLICATION_NOT_FOUND');
    }

    const isStaff = this.isStaffUser(currentUser);
    const isRescue = this.isRescueUser(currentUser);
    if (!isStaff && (!isRescue || Number(application.StationUserID) !== Number(currentUser.id))) {
      throw new ApiError(403, 'Bạn không có quyền đặt lịch bàn giao cho hồ sơ này', 'FORBIDDEN');
    }

    if (application.ApplicationStatus !== 'Approved') {
      throw new ApiError(
        400,
        'Chỉ hồ sơ đã được duyệt (Approved) mới được đặt lịch bàn giao',
        'INVALID_ADOPTION_STATUS'
      );
    }

    const startAt = new Date(payload.start_at);
    const endAt = new Date(payload.end_at);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
      throw new ApiError(
        400,
        'Thời gian kết thúc bàn giao phải sau thời gian bắt đầu',
        'INVALID_HANDOVER_TIME'
      );
    }

    const hasServiceConflict = await this.adoptionRepo.hasOverlappingServiceAppointment(
      application.PetID,
      startAt,
      endAt
    );
    if (hasServiceConflict) {
      throw new ApiError(
        409,
        'Thú cưng đang có lịch hẹn dịch vụ trùng với khung giờ bàn giao này',
        'HANDOVER_APPOINTMENT_CONFLICT'
      );
    }

    const scheduled = await this.adoptionRepo.scheduleHandoverViaSp({
      applicationId: Number(application.AdoptionApplicationID),
      startAt,
      endAt,
      notes: payload.notes || null,
    });

    return scheduled;
  }

  async confirmHandover(currentUser, applicationId, payload = {}) {
    const isStaff = this.isStaffUser(currentUser);
    const isRescue = this.isRescueUser(currentUser);

    return await this.executeLockedTransaction(async (manager) => {
      const application = await this.adoptionRepo.findApplicationById(applicationId, manager, true);
      if (!application) {
        throw new ApiError(404, 'Không tìm thấy hồ sơ nhận nuôi', 'ADOPTION_APPLICATION_NOT_FOUND');
      }

      if (application.ApplicationStatus === 'Completed') {
        throw new ApiError(
          409,
          'Hồ sơ nhận nuôi này đã hoàn tất bàn giao trước đó',
          'HANDOVER_ALREADY_COMPLETED'
        );
      }

      if (application.ApplicationStatus !== 'Approved') {
        throw new ApiError(
          400,
          'Chỉ hồ sơ ở trạng thái Approved mới có thể xác nhận bàn giao',
          'INVALID_ADOPTION_STATUS'
        );
      }

      const isCustomerOwner = Number(application.CustomerUserID) === Number(currentUser.id);
      const isStationActor =
        isStaff || (isRescue && Number(application.StationUserID) === Number(currentUser.id));

      if (!isCustomerOwner && !isStationActor) {
        throw new ApiError(403, 'Bạn không có quyền xác nhận bàn giao hồ sơ này', 'FORBIDDEN');
      }

      const patch = {};
      if (isStationActor && !application.HandoverConfirmedByStationAt) {
        patch.HandoverConfirmedByStationAt = new Date();
      }
      if (isCustomerOwner && !application.HandoverConfirmedByCustomerAt) {
        patch.HandoverConfirmedByCustomerAt = new Date();
      }
      if (payload.note) {
        patch.HandoverNote = payload.note;
      }

      if (Object.keys(patch).length === 0) {
        throw new ApiError(
          409,
          'Bạn đã xác nhận bàn giao cho hồ sơ này trước đó rồi',
          'DUPLICATE_HANDOVER_CONFIRMATION'
        );
      }

      const updatedApp = await this.adoptionRepo.updateApplication(
        application.AdoptionApplicationID,
        patch,
        manager
      );

      let ownershipTransfer = null;
      if (
        updatedApp.HandoverConfirmedByStationAt &&
        updatedApp.HandoverConfirmedByCustomerAt
      ) {
        ownershipTransfer = await this.adoptionRepo.completeHandoverTransfer(
          { application: updatedApp, actorUserId: currentUser.id },
          manager
        );
        await this.adoptionRepo.addApplicationHistory(
          {
            AdoptionApplicationID: Number(updatedApp.AdoptionApplicationID),
            ChangedByUserID: Number(currentUser.id),
            OldStatus: 'Approved',
            NewStatus: 'Completed',
            ChangeNote: 'Hoàn tất xác nhận bàn giao 2 chiều và chuyển quyền sở hữu thú cưng',
          },
          manager
        );
      }

      const finalApp = await this.adoptionRepo.findApplicationById(
        application.AdoptionApplicationID,
        manager
      );
      return {
        application: toApplicationDTO(finalApp),
        completed: Boolean(ownershipTransfer),
        ownership_history_id: ownershipTransfer
          ? Number(ownershipTransfer.OwnershipHistoryID)
          : null,
      };
    });
  }
}

const defaultAdoptionService = new AdoptionService();
export { defaultAdoptionService, AdoptionService, toListingDTO, toApplicationDTO };
export default defaultAdoptionService;

