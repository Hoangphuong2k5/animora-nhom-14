import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ExpertService } from '../../src/services/expert.service.js';

describe('[EXP-01] Unit Tests - Tạo hồ sơ chuyên viên & chứng chỉ (AnimoraDB EmployeeProfiles)', () => {
  let mockExpertRepo;
  let mockNotificationRepo;
  let mockCache;
  let mockDataSource;
  let expertService;

  beforeEach(() => {
    mockExpertRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findUserById: jest.fn(),
      createExpert: jest.fn(),
      createCertificates: jest.fn(),
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

  describe('generateCertificatePresignedUrl()', () => {
    test('TC-1: Cấp Pre-signed URL thành công với HMAC SHA-256 signature và method PUT', async () => {
      const currentUser = { id: 10, role: 'expert' };
      const payload = {
        file_name: 'bang_dai_hoc_thu_y.pdf',
        content_type: 'application/pdf',
      };

      const result = await expertService.generateCertificatePresignedUrl(currentUser, payload);

      expect(result).toHaveProperty('upload_url');
      expect(result).toHaveProperty('file_url');
      expect(result).toHaveProperty('object_key');
      expect(result.method).toBe('PUT');
      expect(result.headers['Content-Type']).toBe('application/pdf');
      expect(result.upload_url).toContain('signature=');
      expect(result.upload_url).toContain('expires=');
    });
  });

  describe('onboardExpert()', () => {
    test('TC-2: Phải ném lỗi 409 EXPERT_ALREADY_EXISTS nếu tài khoản đã có hồ sơ chuyên viên', async () => {
      mockExpertRepo.findByUserId.mockResolvedValue({ EmployeeID: 1, UserID: 10, IsActive: false });

      await expect(
        expertService.onboardExpert({ id: 10, role: 'expert' }, { type: 'vet' })
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode: 'EXPERT_ALREADY_EXISTS',
      });

      expect(mockExpertRepo.findByUserId).toHaveBeenCalledWith(10);
    });

    test('TC-3: Chuyên viên tự tạo hồ sơ (onboard) thành công với trạng thái pending (IsActive = false)', async () => {
      mockExpertRepo.findByUserId.mockResolvedValue(null);

      const fakeCreatedExpert = {
        EmployeeID: 1,
        UserID: 10,
        FullName: 'BS. Minh',
        EmployeeType: 'Doctor',
        EmploymentType: 'FullTime',
        Specialization: 'VET-2026-HCM01',
        Biography: 'Bác sĩ thú y chuyên nội khoa thú nhỏ',
        IsActive: false,
        certificates: [],
      };

      mockExpertRepo.createExpert.mockResolvedValue(fakeCreatedExpert);

      const payload = {
        fullName: 'BS. Minh',
        type: 'vet',
        license_no: 'VET-2026-HCM01',
        bio: 'Bác sĩ thú y chuyên nội khoa thú nhỏ',
      };

      const result = await expertService.onboardExpert({ id: 10, role: 'expert' }, payload);

      expect(mockExpertRepo.createExpert).toHaveBeenCalledWith(
        expect.objectContaining({
          UserID: 10,
          FullName: 'BS. Minh',
          EmployeeType: 'Doctor',
          EmploymentType: 'FullTime',
          Specialization: 'VET-2026-HCM01',
          IsActive: false,
        }),
        expect.anything()
      );

      expect(result.id).toBe(1);
      expect(result.type).toBe('vet');
      expect(result.status).toBe('pending');
      expect(result.license_no).toBe('VET-2026-HCM01');
    });

    test('TC-4: Admin tạo hồ sơ cho nhân viên khác kèm danh sách chứng chỉ ban đầu', async () => {
      mockExpertRepo.findByUserId.mockResolvedValue(null);

      const fakeCreatedExpert = {
        EmployeeID: 2,
        UserID: 20,
        FullName: 'NVCS Lan',
        EmployeeType: 'CareStaff',
        EmploymentType: 'FullTime',
        IsActive: false,
        certificates: [],
      };

      const fakeSavedCerts = [
        {
          CertificateID: 101,
          EmployeeID: 2,
          CertificateName: 'Chứng chỉ Cắt tỉa lông Quốc tế',
          IssuingOrganization: 'Hiệp hội Pet Grooming VN',
          IssuedDate: '2024-01-01',
          CertificateUrl: 'http://localhost:5000/uploads/cert101.jpg',
          ApprovalStatus: 'Pending',
        },
      ];

      mockExpertRepo.createExpert.mockResolvedValue(fakeCreatedExpert);
      mockExpertRepo.createCertificates.mockResolvedValue(fakeSavedCerts);

      const payload = {
        user_id: 20,
        fullName: 'NVCS Lan',
        type: 'groomer',
        certificates: [
          {
            name: 'Chứng chỉ Cắt tỉa lông Quốc tế',
            issuer: 'Hiệp hội Pet Grooming VN',
            year: 2024,
            file_url: 'http://localhost:5000/uploads/cert101.jpg',
          },
        ],
      };

      const result = await expertService.onboardExpert({ id: 1, role: 'admin' }, payload);

      expect(mockExpertRepo.findByUserId).toHaveBeenCalledWith(20);
      expect(mockExpertRepo.createCertificates).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            EmployeeID: 2,
            CertificateName: 'Chứng chỉ Cắt tỉa lông Quốc tế',
            ApprovalStatus: 'Pending',
          }),
        ],
        expect.anything()
      );
      expect(result.id).toBe(2);
      expect(result.certificates).toHaveLength(1);
      expect(result.certificates[0].is_verified).toBe(false);
    });
  });

  describe('addCertificate()', () => {
    test('TC-5: Ném lỗi 404 EXPERT_NOT_FOUND nếu không tìm thấy hồ sơ chuyên viên', async () => {
      mockExpertRepo.findByUserId.mockResolvedValue(null);

      await expect(
        expertService.addCertificate(
          { id: 10, role: 'expert' },
          { name: 'Chứng chỉ mới', file_url: 'http://cdn/cert.jpg' }
        )
      ).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'EXPERT_NOT_FOUND',
      });
    });

    test('TC-6: Ném lỗi 403 FORBIDDEN nếu chuyên viên cố tình thêm chứng chỉ cho chuyên viên khác (ABAC)', async () => {
      mockExpertRepo.findByUserId.mockResolvedValue({ EmployeeID: 5, UserID: 99 });

      await expect(
        expertService.addCertificate(
          { id: 10, role: 'expert' },
          { name: 'Chứng chỉ giả', file_url: 'http://cdn/fake.jpg' }
        )
      ).rejects.toMatchObject({
        statusCode: 403,
        errorCode: 'FORBIDDEN',
      });
    });

    test('TC-7: Thêm chứng chỉ thành công với trạng thái chờ duyệt ApprovalStatus = Pending', async () => {
      mockExpertRepo.findByUserId.mockResolvedValue({ EmployeeID: 5, UserID: 10 });
      mockExpertRepo.createCertificates.mockResolvedValue([
        {
          CertificateID: 50,
          EmployeeID: 5,
          CertificateName: 'Chứng chỉ Phẫu thuật Thú nhỏ',
          IssuingOrganization: 'ĐH Nông Lâm',
          IssuedDate: '2023-01-01',
          CertificateUrl: 'http://localhost:5000/uploads/cert50.pdf',
          ApprovalStatus: 'Pending',
        },
      ]);

      const payload = {
        name: 'Chứng chỉ Phẫu thuật Thú nhỏ',
        issuer: 'ĐH Nông Lâm',
        year: 2023,
        file_url: 'http://localhost:5000/uploads/cert50.pdf',
      };

      const result = await expertService.addCertificate({ id: 10, role: 'expert' }, payload);

      expect(mockExpertRepo.createCertificates).toHaveBeenCalledWith([
        expect.objectContaining({
          EmployeeID: 5,
          CertificateName: 'Chứng chỉ Phẫu thuật Thú nhỏ',
          ApprovalStatus: 'Pending',
        }),
      ]);

      expect(result.id).toBe(50);
      expect(result.name).toBe('Chứng chỉ Phẫu thuật Thú nhỏ');
      expect(result.is_verified).toBe(false);

      await new Promise((resolve) => setImmediate(resolve));
      expect(mockCache.consumeInvalidationEvent).toHaveBeenCalledWith('expert:profile:5');
    });
  });
});
