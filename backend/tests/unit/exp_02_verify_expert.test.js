import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ExpertService } from '../../src/services/expert.service.js';

describe('[EXP-02] Unit Tests - Duyệt hồ sơ và phân loại chuyên viên (AnimoraDB EmployeeProfiles)', () => {
  let mockExpertRepo;
  let mockNotificationRepo;
  let mockCache;
  let mockDataSource;
  let expertService;

  beforeEach(() => {
    mockExpertRepo = {
      findById: jest.fn(),
      findPendingExperts: jest.fn(),
      updateExpert: jest.fn(),
      verifyAllCertificatesByExpertId: jest.fn(),
    };

    mockNotificationRepo = {
      createNotification: jest.fn(),
    };

    mockCache = {
      getOrSet: jest.fn((key, ttl, fetcher) => fetcher()),
      consumeInvalidationEvent: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(async (cb) => cb({})),
    };

    expertService = new ExpertService(
      mockExpertRepo,
      mockNotificationRepo,
      mockCache,
      mockDataSource
    );
  });

  describe('getPendingExperts()', () => {
    test('TC-1: Lấy danh sách chuyên viên chờ duyệt thành công với phân trang mặc định', async () => {
      const mockResult = {
        items: [
          {
            EmployeeID: 1,
            UserID: 10,
            FullName: 'Nguyễn Văn Minh',
            EmployeeType: 'Doctor',
            EmploymentType: 'FullTime',
            IsActive: false,
            status: 'pending',
            Specialization: 'VET-8899',
            Biography: 'Bác sĩ thú y giàu kinh nghiệm',
            user: { UserID: 10, Email: 'vet.minh@animora.vn', PhoneNumber: '0901234567' },
            certificates: [
              { CertificateID: 101, EmployeeID: 1, CertificateName: 'Bằng ĐH Thú Y', ApprovalStatus: 'Pending' },
            ],
          },
        ],
        totalItems: 1,
      };

      mockExpertRepo.findPendingExperts.mockResolvedValue(mockResult);

      const response = await expertService.getPendingExperts({ page: 1, limit: 10 });

      expect(mockExpertRepo.findPendingExperts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        after_id: undefined,
        status: 'pending',
        type: undefined,
      });
      expect(response.page).toBe(1);
      expect(response.limit).toBe(10);
      expect(response.totalItems).toBe(1);
      expect(response.items).toHaveLength(1);
      expect(response.items[0].id).toBe(1);
      expect(response.items[0].type).toBe('vet');
      expect(response.items[0].certificates).toHaveLength(1);
    });

    test('TC-2: Lấy danh sách hồ sơ với bộ lọc type và status tùy chỉnh', async () => {
      mockExpertRepo.findPendingExperts.mockResolvedValue({
        items: [],
        totalItems: 0,
      });

      const query = { page: 2, limit: 5, status: 'approved', type: 'groomer' };
      const response = await expertService.getPendingExperts(query);

      expect(mockExpertRepo.findPendingExperts).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        after_id: undefined,
        status: 'approved',
        type: 'groomer',
      });
      expect(response.items).toEqual([]);
      expect(response.totalItems).toBe(0);
    });
  });

  describe('verifyExpertProfile()', () => {
    test('TC-3: Ném lỗi 404 EXPERT_NOT_FOUND nếu không tìm thấy hồ sơ chuyên viên', async () => {
      mockExpertRepo.findById.mockResolvedValue(null);

      await expect(
        expertService.verifyExpertProfile(1, 999, { status: 'approved' })
      ).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'EXPERT_NOT_FOUND',
      });

      expect(mockExpertRepo.findById).toHaveBeenCalledWith(999);
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    test('TC-4: Chặn duyệt approved bác sĩ thú y (vet) nếu thiếu số giấy phép (license_no / Specialization)', async () => {
      mockExpertRepo.findById.mockResolvedValue({
        EmployeeID: 5,
        UserID: 50,
        EmployeeType: 'Doctor',
        Specialization: null,
        IsActive: false,
      });

      await expect(
        expertService.verifyExpertProfile(1, 5, { status: 'approved', type: 'vet' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'VET_LICENSE_REQUIRED',
      });

      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    test('TC-5: Chặn duyệt khi chuyển đổi type sang vet nhưng hồ sơ ban đầu không có license_no', async () => {
      mockExpertRepo.findById.mockResolvedValue({
        EmployeeID: 6,
        UserID: 60,
        EmployeeType: 'CareStaff',
        Specialization: null,
        IsActive: false,
      });

      await expect(
        expertService.verifyExpertProfile(1, 6, { status: 'approved', type: 'vet' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'VET_LICENSE_REQUIRED',
      });
    });

    test('TC-6: Duyệt thành công Bác sĩ thú y (vet) khi có license_no, tự động xác minh chứng chỉ & gửi thông báo', async () => {
      const expertRecord = {
        EmployeeID: 1,
        UserID: 10,
        FullName: 'BS. Minh',
        EmployeeType: 'Doctor',
        Specialization: 'VET-CERT-2026',
        IsActive: false,
        user: { UserID: 10, Email: 'minh@animora.vn' },
      };

      const updatedRecord = {
        ...expertRecord,
        IsActive: true,
        status: 'approved',
        certificates: [
          { CertificateID: 1, EmployeeID: 1, CertificateName: 'Bằng Thú Y ĐH Nông Lâm', ApprovalStatus: 'Approved' },
        ],
      };

      mockExpertRepo.findById.mockResolvedValue(expertRecord);
      mockExpertRepo.updateExpert.mockResolvedValue(updatedRecord);
      mockExpertRepo.verifyAllCertificatesByExpertId.mockResolvedValue({ affected: 1 });
      mockNotificationRepo.createNotification.mockResolvedValue({ NotificationID: 100 });

      const result = await expertService.verifyExpertProfile(1, 1, {
        status: 'approved',
        verify_all_certificates: true,
      });

      expect(mockExpertRepo.findById).toHaveBeenCalledWith(1);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockExpertRepo.updateExpert).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          IsActive: true,
          status: 'approved',
          type: 'vet',
        }),
        expect.anything()
      );
      expect(mockExpertRepo.verifyAllCertificatesByExpertId).toHaveBeenCalledWith(
        1,
        'Approved',
        1,
        expect.any(String),
        expect.anything()
      );
      expect(mockNotificationRepo.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 10,
          type: 'expert_verification',
          title: 'Hồ sơ chuyên viên đã được phê duyệt',
          ref_type: 'expert',
          ref_id: 1,
        }),
        expect.anything()
      );
      expect(result.status).toBe('approved');
      expect(result.certificates[0].is_verified).toBe(true);
    });

    test('TC-7: Duyệt thành công hồ sơ Groomer (không yêu cầu license_no)', async () => {
      const expertRecord = {
        EmployeeID: 2,
        UserID: 20,
        FullName: 'Lê Thị Lan',
        EmployeeType: 'CareStaff',
        Specialization: null,
        IsActive: false,
        user: { UserID: 20, Email: 'lan@animora.vn' },
      };

      const updatedRecord = {
        ...expertRecord,
        IsActive: true,
        status: 'approved',
        certificates: [],
      };

      mockExpertRepo.findById.mockResolvedValue(expertRecord);
      mockExpertRepo.updateExpert.mockResolvedValue(updatedRecord);
      mockNotificationRepo.createNotification.mockResolvedValue({ NotificationID: 101 });

      const result = await expertService.verifyExpertProfile(1, 2, {
        status: 'approved',
        type: 'groomer',
        verify_all_certificates: true,
      });

      expect(result.status).toBe('approved');
      expect(result.type).toBe('groomer');
    });

    test('TC-8: Từ chối (rejected) hồ sơ chuyên viên kèm lý do từ chối', async () => {
      const expertRecord = {
        EmployeeID: 3,
        UserID: 30,
        FullName: 'Trần Văn Huấn',
        EmployeeType: 'CareStaff',
        IsActive: false,
      };

      const updatedRecord = {
        ...expertRecord,
        IsActive: false,
        status: 'rejected',
      };

      mockExpertRepo.findById.mockResolvedValue(expertRecord);
      mockExpertRepo.updateExpert.mockResolvedValue(updatedRecord);
      mockExpertRepo.verifyAllCertificatesByExpertId.mockResolvedValue({ affected: 1 });
      mockNotificationRepo.createNotification.mockResolvedValue({ NotificationID: 102 });

      const payload = {
        status: 'rejected',
        reason: 'Chứng chỉ chuyên môn không đủ tính pháp lý',
      };

      const result = await expertService.verifyExpertProfile(1, 3, payload);

      expect(mockExpertRepo.updateExpert).toHaveBeenCalledWith(
        3,
        expect.objectContaining({
          IsActive: false,
          status: 'rejected',
        }),
        expect.anything()
      );
      expect(mockExpertRepo.verifyAllCertificatesByExpertId).toHaveBeenCalledWith(
        3,
        'Rejected',
        1,
        'Chứng chỉ chuyên môn không đủ tính pháp lý',
        expect.anything()
      );
      expect(mockNotificationRepo.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 30,
          type: 'expert_verification',
          title: 'Hồ sơ chuyên viên bị từ chối',
          content: expect.stringContaining('Chứng chỉ chuyên môn không đủ tính pháp lý'),
          ref_type: 'expert',
          ref_id: 3,
        }),
        expect.anything()
      );
      expect(result.status).toBe('rejected');
    });

    test('TC-9: Duyệt hồ sơ với verify_all_certificates = false không gọi verifyAllCertificatesByExpertId', async () => {
      const expertRecord = {
        EmployeeID: 2,
        UserID: 20,
        FullName: 'NVCS',
        EmployeeType: 'CareStaff',
        IsActive: false,
      };

      mockExpertRepo.findById.mockResolvedValue(expertRecord);
      mockExpertRepo.updateExpert.mockResolvedValue({ ...expertRecord, IsActive: true, status: 'approved' });

      await expertService.verifyExpertProfile(1, 2, {
        status: 'approved',
        verify_all_certificates: false,
      });

      expect(mockExpertRepo.verifyAllCertificatesByExpertId).not.toHaveBeenCalled();
    });
  });
});
