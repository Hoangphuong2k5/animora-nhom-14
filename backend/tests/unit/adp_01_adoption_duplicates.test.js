import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { AdoptionService } from '../../src/services/adoption.service.js';

describe('[ADP-01] Unit Tests - Chống trùng tin nhận nuôi, hồ sơ & lịch bàn giao', () => {
  let mockAdoptionRepo;
  let mockNotificationRepo;
  let mockDataSource;
  let adoptionService;

  beforeEach(() => {
    mockAdoptionRepo = {
      runSerializableTransaction: jest.fn(async (cb) => cb({})),
      resolveCustomerByUserId: jest.fn(),
      findRescueStationByUserId: jest.fn(),
      findRescueStationById: jest.fn(),
      findPetById: jest.fn(),
      findOpenListingByPetId: jest.fn(),
      findListingById: jest.fn(),
      createListing: jest.fn(),
      updateListingStatus: jest.fn(),
      findListings: jest.fn(),
      findActiveApplicationByListingAndCustomer: jest.fn(),
      findApprovedOrCompletedApplicationByListing: jest.fn(),
      createApplicationAggregate: jest.fn(),
      findApplicationById: jest.fn(),
      findApplications: jest.fn(),
      updateApplication: jest.fn(),
      addApplicationHistory: jest.fn(),
      hasOverlappingServiceAppointment: jest.fn(),
      scheduleHandoverViaSp: jest.fn(),
      completeHandoverTransfer: jest.fn(),
    };
    mockNotificationRepo = {
      createNotification: jest.fn(),
    };
    mockDataSource = {
      transaction: jest.fn(async (cb) => cb({})),
    };

    adoptionService = new AdoptionService(mockAdoptionRepo, mockNotificationRepo, mockDataSource);
  });

  test('TC-1: createListing() chặn tạo tin nhận nuôi thứ 2 khi thú cưng đang có tin mở', async () => {
    mockAdoptionRepo.findRescueStationById.mockResolvedValue({ RescueStationID: 1, IsActive: true });
    mockAdoptionRepo.findPetById.mockResolvedValue({ PetID: 20, PetName: 'Mochi' });
    mockAdoptionRepo.findOpenListingByPetId.mockResolvedValue({
      AdoptionListingID: 5,
      ListingStatus: 'Available',
    });

    await expect(
      adoptionService.createListing(
        { id: 2, role: 'manager' },
        { pet_id: 20, rescue_station_id: 1, title: 'Tìm nhà cho Mochi' }
      )
    ).rejects.toMatchObject({ statusCode: 409, errorCode: 'ADOPTION_LISTING_ALREADY_OPEN' });
  });

  test('TC-2: submitApplication() chặn khách hàng gửi trùng hồ sơ nhận nuôi cho cùng 1 tin', async () => {
    mockAdoptionRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 11, UserID: 100 });
    mockAdoptionRepo.findListingById.mockResolvedValue({
      AdoptionListingID: 7,
      ListingStatus: 'Available',
    });
    mockAdoptionRepo.findActiveApplicationByListingAndCustomer.mockResolvedValue({
      AdoptionApplicationID: 88,
      ApplicationStatus: 'Pending',
    });

    await expect(
      adoptionService.submitApplication(
        { id: 100, role: 'customer' },
        { listing_id: 7, applicant_reason: 'Yêu thương thú cưng' }
      )
    ).rejects.toMatchObject({ statusCode: 409, errorCode: 'DUPLICATE_ADOPTION_APPLICATION' });
  });

  test('TC-3: reviewApplication() chặn duyệt Approved hồ sơ thứ 2 cho cùng 1 tin nhận nuôi', async () => {
    mockAdoptionRepo.findApplicationById.mockResolvedValue({
      AdoptionApplicationID: 90,
      AdoptionListingID: 7,
      CustomerID: 12,
      CustomerUserID: 101,
      StationUserID: 50,
      ApplicationStatus: 'Pending',
    });
    mockAdoptionRepo.findListingById.mockResolvedValue({
      AdoptionListingID: 7,
      ListingStatus: 'Pending',
    });
    mockAdoptionRepo.findApprovedOrCompletedApplicationByListing.mockResolvedValue({
      AdoptionApplicationID: 89,
      ApplicationStatus: 'Approved',
    });

    await expect(
      adoptionService.reviewApplication(
        { id: 2, role: 'manager' },
        90,
        { status: 'Approved', note: 'Duyệt hồ sơ' }
      )
    ).rejects.toMatchObject({ statusCode: 409, errorCode: 'LISTING_ALREADY_APPROVED' });
  });

  test('TC-4: scheduleHandover() chặn đặt lịch bàn giao trùng với lịch hẹn dịch vụ của thú cưng', async () => {
    mockAdoptionRepo.findApplicationById.mockResolvedValue({
      AdoptionApplicationID: 91,
      AdoptionListingID: 7,
      PetID: 20,
      StationUserID: 50,
      ApplicationStatus: 'Approved',
    });
    mockAdoptionRepo.hasOverlappingServiceAppointment.mockResolvedValue(true);

    await expect(
      adoptionService.scheduleHandover(
        { id: 2, role: 'manager' },
        91,
        {
          start_at: '2026-11-25T09:00:00Z',
          end_at: '2026-11-25T10:00:00Z',
        }
      )
    ).rejects.toMatchObject({ statusCode: 409, errorCode: 'HANDOVER_APPOINTMENT_CONFLICT' });
  });

  test('TC-5: confirmHandover() chặn xác nhận trùng 2 lần và hoàn tất chuyển chủ sở hữu khi cả 2 bên xác nhận', async () => {
    mockAdoptionRepo.findApplicationById
      .mockResolvedValueOnce({
        AdoptionApplicationID: 92,
        AdoptionListingID: 7,
        PetID: 20,
        CustomerID: 12,
        CustomerUserID: 101,
        StationUserID: 50,
        ApplicationStatus: 'Approved',
        HandoverConfirmedByStationAt: new Date(),
        HandoverConfirmedByCustomerAt: null,
      })
      .mockResolvedValueOnce({
        AdoptionApplicationID: 92,
        AdoptionListingID: 7,
        PetID: 20,
        CustomerID: 12,
        CustomerUserID: 101,
        StationUserID: 50,
        ApplicationStatus: 'Completed',
        HandoverConfirmedByStationAt: new Date(),
        HandoverConfirmedByCustomerAt: new Date(),
      });

    mockAdoptionRepo.updateApplication.mockResolvedValue({
      AdoptionApplicationID: 92,
      AdoptionListingID: 7,
      PetID: 20,
      CustomerID: 12,
      ApplicationStatus: 'Approved',
      HandoverConfirmedByStationAt: new Date(),
      HandoverConfirmedByCustomerAt: new Date(),
    });
    mockAdoptionRepo.completeHandoverTransfer.mockResolvedValue({
      OwnershipHistoryID: 777,
    });

    const res = await adoptionService.confirmHandover(
      { id: 101, role: 'customer' },
      92,
      { note: 'Đã đón bé' }
    );
    expect(res.completed).toBe(true);
    expect(res.ownership_history_id).toBe(777);
    expect(mockAdoptionRepo.completeHandoverTransfer).toHaveBeenCalledTimes(1);
  });
});

