import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ExpertService } from '../../src/services/expert.service.js';
import ApiError from '../../src/utils/ApiError.js';

describe('[SVC-02] Unit Tests - Gán dịch vụ cho chuyên viên (assignServicesToExpert & getServicesOfExpert)', () => {
  let mockExpertRepo;
  let mockNotificationRepo;
  let mockCache;
  let expertService;

  beforeEach(() => {
    // 1. Mock Expert Repository
    mockExpertRepo = {
      findById: jest.fn(),
      findServicesByIds: jest.fn(),
      replaceExpertServices: jest.fn(),
      findExpertServices: jest.fn(),
    };

    // 2. Mock Notification Repository
    mockNotificationRepo = {
      createNotification: jest.fn(),
    };

    // 3. Mock Cache Service
    mockCache = {
      getOrSet: jest.fn((key, ttl, fetcher) => fetcher()),
      consumeInvalidationEvent: jest.fn(),
    };

    // 4. Khởi tạo ExpertService với các dependency đã được Mock độc lập
    expertService = new ExpertService(mockExpertRepo, mockNotificationRepo, mockCache, {});
  });

  describe('assignServicesToExpert()', () => {
    test('TC-1: Phải ném lỗi 404 EXPERT_NOT_FOUND nếu chuyên viên không tồn tại', async () => {
      // Giả lập không tìm thấy chuyên viên
      mockExpertRepo.findById.mockResolvedValue(null);

      await expect(
        expertService.assignServicesToExpert(999, [1, 2])
      ).rejects.toThrow(ApiError);

      await expect(
        expertService.assignServicesToExpert(999, [1, 2])
      ).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'EXPERT_NOT_FOUND',
      });

      expect(mockExpertRepo.findById).toHaveBeenCalledWith(999);
      expect(mockExpertRepo.replaceExpertServices).not.toHaveBeenCalled();
    });

    test('TC-2: Phải ném lỗi 400 INVALID_SERVICES nếu một trong các service_id không tồn tại', async () => {
      // Giả lập chuyên viên tồn tại
      mockExpertRepo.findById.mockResolvedValue({
        id: 1,
        type: 'groomer',
      });

      // Truyền vào 2 ID: [10, 20] nhưng DB chỉ tìm thấy 1 service hợp lệ: [10]
      mockExpertRepo.findServicesByIds.mockResolvedValue([
        { id: 10, name: 'Tắm Spa', service_kind: 'care' },
      ]);

      await expect(
        expertService.assignServicesToExpert(1, [10, 20])
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'INVALID_SERVICES',
      });

      expect(mockExpertRepo.replaceExpertServices).not.toHaveBeenCalled();
    });

    test('TC-3: Phải chặn và ném lỗi 400 MEDICAL_SERVICE_REQUIRES_VET khi gán dịch vụ y tế cho Groomer / Trainer', async () => {
      // Chuyên viên là kỹ thuật viên chăm sóc lông (groomer)
      mockExpertRepo.findById.mockResolvedValue({
        id: 2,
        type: 'groomer',
      });

      // Danh sách dịch vụ có chứa dịch vụ y tế (service_kind = 'medical')
      mockExpertRepo.findServicesByIds.mockResolvedValue([
        { id: 101, name: 'Phẫu thuật triệt sản', service_kind: 'medical' },
      ]);

      await expect(
        expertService.assignServicesToExpert(2, [101])
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'MEDICAL_SERVICE_REQUIRES_VET',
      });

      expect(mockExpertRepo.replaceExpertServices).not.toHaveBeenCalled();
    });

    test('TC-4: Bác sĩ thú y (vet) được phép gán thành công cả dịch vụ Y tế (medical) và Chăm sóc (care)', async () => {
      // Chuyên viên là Bác sĩ thú y (vet)
      mockExpertRepo.findById.mockResolvedValue({
        id: 5,
        type: 'vet',
      });

      // Danh sách gồm cả Care và Medical
      const mockServices = [
        { id: 10, name: 'Tắm Spa', service_kind: 'care', price: 150000, duration_min: 60 },
        { id: 20, name: 'Tiêm phòng dại', service_kind: 'medical', price: 200000, duration_min: 30 },
      ];
      mockExpertRepo.findServicesByIds.mockResolvedValue(mockServices);
      mockExpertRepo.replaceExpertServices.mockResolvedValue(true);
      mockExpertRepo.findExpertServices.mockResolvedValue(mockServices);

      const result = await expertService.assignServicesToExpert(5, [10, 20], 1);

      expect(result).toBeDefined();
      expect(result.expert_id).toBe(5);
      expect(result.expert_type).toBe('vet');
      expect(result.services).toHaveLength(2);
      expect(mockExpertRepo.replaceExpertServices).toHaveBeenCalledWith(5, [10, 20], 1);
    });
  });

  describe('getServicesOfExpert()', () => {
    test('TC-5: Lấy danh sách dịch vụ của chuyên viên thành công', async () => {
      mockExpertRepo.findById.mockResolvedValue({ id: 10, type: 'groomer' });
      const mockAssigned = [
        { id: 1, name: 'Cắt tỉa lông poodle', service_kind: 'care', price: 250000, duration_min: 90 },
      ];
      mockExpertRepo.findExpertServices.mockResolvedValue(mockAssigned);

      const result = await expertService.getServicesOfExpert(10);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cắt tỉa lông poodle');
      expect(mockExpertRepo.findExpertServices).toHaveBeenCalledWith(10);
    });

    test('TC-6: Ném lỗi 404 EXPERT_NOT_FOUND nếu chuyên viên không tồn tại khi lấy dịch vụ', async () => {
      mockExpertRepo.findById.mockResolvedValue(null);

      await expect(
        expertService.getServicesOfExpert(888)
      ).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'EXPERT_NOT_FOUND',
      });

      expect(mockExpertRepo.findExpertServices).not.toHaveBeenCalled();
    });
  });
});
