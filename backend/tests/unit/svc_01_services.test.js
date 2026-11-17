import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import serviceRepository from '../../src/repositories/service.repository.js';
import * as serviceService from '../../src/services/service.service.js';
import ApiError from '../../src/utils/ApiError.js';

describe('[SVC-01] Unit Tests - Quản lý danh mục dịch vụ (Service Management)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getServices()', () => {
    test('TC-1: Lấy danh sách dịch vụ phân trang thành công với query mặc định', async () => {
      const mockResult = {
        items: [
          { id: 1, name: 'Khám tổng quát', price: 150000, duration_min: 30, is_active: true },
          { id: 2, name: 'Tắm thú cưng', price: 200000, duration_min: 60, is_active: true },
        ],
        totalItems: 2,
      };

      const spyFind = jest.spyOn(serviceRepository, 'findServicesPaginated').mockResolvedValue(mockResult);

      const result = await serviceService.getServices({});

      expect(spyFind).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        category: null,
        service_kind: null,
        is_active: undefined,
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].status).toBe('active');
      expect(result.items[0].duration_minutes).toBe(30);
      expect(result.totalItems).toBe(2);
    });

    test('TC-2: Phải truyền đúng các bộ lọc search, category, service_kind và is_active', async () => {
      const mockResult = { items: [], totalItems: 0 };
      const spyFind = jest.spyOn(serviceRepository, 'findServicesPaginated').mockResolvedValue(mockResult);

      await serviceService.getServices({
        page: '2',
        limit: '15',
        search: 'khám',
        category: 'Khám bệnh',
        service_kind: 'medical',
        status: 'active',
      });

      expect(spyFind).toHaveBeenCalledWith({
        page: 2,
        limit: 15,
        search: 'khám',
        category: 'Khám bệnh',
        service_kind: 'medical',
        is_active: true,
      });
    });
  });

  describe('getServiceById()', () => {
    test('TC-3: Ném lỗi 404 SERVICE_NOT_FOUND nếu không tìm thấy dịch vụ', async () => {
      jest.spyOn(serviceRepository, 'findById').mockResolvedValue(null);

      await expect(serviceService.getServiceById(999)).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'SERVICE_NOT_FOUND',
      });
    });

    test('TC-4: Lấy chi tiết dịch vụ thành công và bổ sung các trường alias tiện lợi', async () => {
      const fakeService = {
        id: 1,
        name: 'Tiêm phòng vaccine 7 bệnh',
        service_kind: 'medical',
        price: 250000,
        duration_min: 20,
        allow_postpay: true,
        cancel_policy: 'Hủy trước 24h miễn phí',
        is_active: true,
      };

      jest.spyOn(serviceRepository, 'findById').mockResolvedValue(fakeService);

      const result = await serviceService.getServiceById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Tiêm phòng vaccine 7 bệnh');
      expect(result.duration_minutes).toBe(20);
      expect(result.allow_pay_later).toBe(true);
      expect(result.status).toBe('active');
    });
  });

  describe('createService()', () => {
    test('TC-5: Ném lỗi 409 SERVICE_NAME_EXISTS nếu tên dịch vụ đã tồn tại', async () => {
      jest.spyOn(serviceRepository, 'findByName').mockResolvedValue({ id: 1, name: 'Khám tổng quát' });

      await expect(
        serviceService.createService({
          name: 'Khám tổng quát',
          price: 150000,
          duration_min: 30,
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode: 'SERVICE_NAME_EXISTS',
      });
    });

    test('TC-6: Ném lỗi 400 INVALID_CANCEL_POLICY nếu ngưỡng hủy trễ lớn hơn hạn hủy miễn phí', async () => {
      jest.spyOn(serviceRepository, 'findByName').mockResolvedValue(null);

      await expect(
        serviceService.createService({
          name: 'Dịch vụ Spa',
          price: 200000,
          duration_min: 60,
          free_cancel_hours: 12,
          late_threshold_hours: 24, // Sai logic: phạt trễ > hạn miễn phí
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'INVALID_CANCEL_POLICY',
      });
    });

    test('TC-7: Tạo dịch vụ mới thành công (chuẩn hóa duration_min và trạng thái active)', async () => {
      jest.spyOn(serviceRepository, 'findByName').mockResolvedValue(null);
      const spyCreate = jest.spyOn(serviceRepository, 'createService').mockImplementation(async (data) => ({
        id: 10,
        ...data,
      }));

      const payload = {
        name: 'Siêu âm tim thú cưng',
        category: 'Chẩn đoán hình ảnh',
        service_kind: 'medical',
        price: 400000,
        duration_minutes: 45,
        allow_pay_later: true,
      };

      const result = await serviceService.createService(payload);

      expect(spyCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Siêu âm tim thú cưng',
          service_kind: 'medical',
          price: 400000,
          duration_min: 45,
          allow_postpay: true,
          is_active: true,
        })
      );
      expect(result.id).toBe(10);
      expect(result.status).toBe('active');
    });
  });

  describe('updateService()', () => {
    test('TC-8: Ném lỗi 404 SERVICE_NOT_FOUND khi cập nhật dịch vụ không tồn tại', async () => {
      jest.spyOn(serviceRepository, 'findById').mockResolvedValue(null);

      await expect(serviceService.updateService(999, { price: 300000 })).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'SERVICE_NOT_FOUND',
      });
    });

    test('TC-9: Ném lỗi 409 SERVICE_NAME_EXISTS nếu đổi tên dịch vụ trùng với dịch vụ khác', async () => {
      jest.spyOn(serviceRepository, 'findById').mockResolvedValue({ id: 1, name: 'Tên Cũ' });
      jest.spyOn(serviceRepository, 'findByName').mockResolvedValue({ id: 2, name: 'Tên Đã Có' });

      await expect(
        serviceService.updateService(1, { name: 'Tên Đã Có' })
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode: 'SERVICE_NAME_EXISTS',
      });
    });

    test('TC-10: Cập nhật dịch vụ thành công', async () => {
      jest.spyOn(serviceRepository, 'findById').mockResolvedValue({
        id: 1,
        name: 'Tắm thú cưng',
        price: 200000,
        duration_min: 60,
        is_active: true,
      });
      jest.spyOn(serviceRepository, 'findByName').mockResolvedValue(null);
      jest.spyOn(serviceRepository, 'updateService').mockResolvedValue({
        id: 1,
        name: 'Tắm thú cưng cao cấp',
        price: 250000,
        duration_min: 60,
        is_active: true,
      });

      const result = await serviceService.updateService(1, {
        name: 'Tắm thú cưng cao cấp',
        price: 250000,
      });

      expect(result.name).toBe('Tắm thú cưng cao cấp');
      expect(result.price).toBe(250000);
    });
  });

  describe('updateServiceStatus()', () => {
    test('TC-11: Ném lỗi 404 SERVICE_NOT_FOUND khi đổi trạng thái dịch vụ không tồn tại', async () => {
      jest.spyOn(serviceRepository, 'findById').mockResolvedValue(null);

      await expect(serviceService.updateServiceStatus(999, false)).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'SERVICE_NOT_FOUND',
      });
    });

    test('TC-12: Bật / Tắt trạng thái hoạt động dịch vụ thành công (active <-> inactive)', async () => {
      jest.spyOn(serviceRepository, 'findById').mockResolvedValue({ id: 2, is_active: true });
      jest.spyOn(serviceRepository, 'updateService').mockResolvedValue({ id: 2, is_active: false });

      const result = await serviceService.updateServiceStatus(2, false);

      expect(result.id).toBe(2);
      expect(result.status).toBe('inactive');
      expect(result.is_active).toBe(false);
    });
  });

  describe('deleteService()', () => {
    test('TC-13: Ném lỗi 404 SERVICE_NOT_FOUND khi xóa dịch vụ không tồn tại', async () => {
      jest.spyOn(serviceRepository, 'findById').mockResolvedValue(null);

      await expect(serviceService.deleteService(999)).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'SERVICE_NOT_FOUND',
      });
    });

    test('TC-14: Xóa mềm dịch vụ thành công (chuyển is_active = false)', async () => {
      jest.spyOn(serviceRepository, 'findById').mockResolvedValue({ id: 3, is_active: true });
      const spyDelete = jest.spyOn(serviceRepository, 'deleteService').mockResolvedValue(true);

      const result = await serviceService.deleteService(3);

      expect(spyDelete).toHaveBeenCalledWith(3);
      expect(result).toEqual({ deleted: true, serviceId: 3 });
    });
  });
});
