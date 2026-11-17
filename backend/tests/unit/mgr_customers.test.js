import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import customerRepository from '../../src/repositories/customer.repository.js';
import * as customerService from '../../src/services/customer.service.js';
import ApiError from '../../src/utils/ApiError.js';
import { USER_STATUS } from '../../src/utils/constants.js';

describe('[MGR-CUS] Unit Tests - Quản lý Khách Hàng (Manager Customer Management)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomers()', () => {
    test('TC-1: Lấy danh sách khách hàng phân trang thành công với query mặc định', async () => {
      const mockResult = {
        items: [
          {
            id: 'cus-1',
            customerId: 1,
            fullName: 'Phan Thị Đình Thùy',
            phoneNumber: '0337203332',
            email: 'phanthidinhthuy6@gmail.com',
            createdAt: '2026-01-15T00:00:00.000Z',
            petCount: 2,
            bookingsCount: 8,
            totalSpent: 4850000,
            status: 'Active',
          },
          {
            id: 'cus-2',
            customerId: 2,
            fullName: 'Nguyễn Minh Anh',
            phoneNumber: '0901234567',
            email: 'minhanh.ng@gmail.com',
            createdAt: '2026-02-04T00:00:00.000Z',
            petCount: 1,
            bookingsCount: 5,
            totalSpent: 3200000,
            status: 'Active',
          },
        ],
        totalItems: 2,
      };

      const spyFind = jest.spyOn(customerRepository, 'findCustomersPaginated').mockResolvedValue(mockResult);

      const result = await customerService.getCustomers({});

      expect(spyFind).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        status: 'all',
      });
      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalItems).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    test('TC-2: Truyền đúng bộ lọc search, status, page, limit', async () => {
      const mockResult = { items: [], totalItems: 0 };
      const spyFind = jest.spyOn(customerRepository, 'findCustomersPaginated').mockResolvedValue(mockResult);

      const result = await customerService.getCustomers({
        page: '2',
        limit: '5',
        search: 'Lê Thị Thảo Linh',
        status: 'locked',
      });

      expect(spyFind).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: 'Lê Thị Thảo Linh',
        status: 'locked',
      });
      expect(result.items).toHaveLength(0);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });
  });

  describe('getCustomerDetail()', () => {
    test('TC-3: Trả về hồ sơ chi tiết 360 độ của khách hàng', async () => {
      const mockCustomer = {
        id: 'cus-1',
        customerId: 1,
        fullName: 'Phan Thị Đình Thùy',
        phoneNumber: '0337203332',
        email: 'phanthidinhthuy6@gmail.com',
        accountStatus: 'Active',
        pets: [
          { petId: 1, name: 'Bơ', species: 'Chó', breed: 'Golden Retriever', weightKg: 15 },
        ],
        stats: {
          totalPets: 1,
          totalBookings: 8,
          totalSpent: 4850000,
        },
      };

      jest.spyOn(customerRepository, 'findCustomerDetailById').mockResolvedValue(mockCustomer);

      const result = await customerService.getCustomerDetail(1);

      expect(result).toBeDefined();
      expect(result.id).toBe('cus-1');
      expect(result.fullName).toBe('Phan Thị Đình Thùy');
      expect(result.pets).toHaveLength(1);
      expect(result.stats.totalSpent).toBe(4850000);
    });

    test('TC-4: Ném lỗi 404 CUSTOMER_NOT_FOUND nếu không tìm thấy hồ sơ', async () => {
      jest.spyOn(customerRepository, 'findCustomerDetailById').mockResolvedValue(null);

      await expect(customerService.getCustomerDetail(9999)).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'CUSTOMER_NOT_FOUND',
      });
    });
  });

  describe('updateCustomerStatus()', () => {
    test('TC-5: Khóa tài khoản khách hàng thành công khi truyền trạng thái Locked', async () => {
      const mockCustomer = {
        id: 'cus-4',
        customerId: 4,
        userId: 10,
        fullName: 'Lê Thị Thảo Linh',
        accountStatus: 'Active',
      };
      const mockUpdated = {
        ...mockCustomer,
        accountStatus: USER_STATUS.LOCKED,
      };

      jest.spyOn(customerRepository, 'findCustomerDetailById').mockResolvedValue(mockCustomer);
      jest.spyOn(customerRepository, 'updateCustomerAccountStatus').mockResolvedValue(mockUpdated);

      const result = await customerService.updateCustomerStatus('cus-4', {
        status: 'Locked',
        reason: 'Vi phạm chính sách thanh toán dịch vụ nhiều lần',
      }, 99);

      expect(result.customer.accountStatus).toBe(USER_STATUS.LOCKED);
      expect(result.message).toContain('Đã khóa tài khoản khách hàng');
      expect(result.reason).toBe('Vi phạm chính sách thanh toán dịch vụ nhiều lần');
    });

    test('TC-6: Mở khóa tài khoản khách hàng thành công khi truyền trạng thái Active', async () => {
      const mockCustomer = {
        id: 'cus-4',
        customerId: 4,
        userId: 10,
        fullName: 'Lê Thị Thảo Linh',
        accountStatus: 'Locked',
      };
      const mockUpdated = {
        ...mockCustomer,
        accountStatus: USER_STATUS.ACTIVE,
      };

      jest.spyOn(customerRepository, 'findCustomerDetailById').mockResolvedValue(mockCustomer);
      jest.spyOn(customerRepository, 'updateCustomerAccountStatus').mockResolvedValue(mockUpdated);

      const result = await customerService.updateCustomerStatus(4, {
        status: 'Active',
        reason: 'Khách hàng đã giải quyết xong khiếu nại',
      }, 99);

      expect(result.customer.accountStatus).toBe(USER_STATUS.ACTIVE);
      expect(result.message).toContain('Đã mở khóa tài khoản khách hàng');
    });

    test('TC-7: Ném lỗi 400 CANNOT_UPDATE_SELF khi quản lý tự khóa tài khoản của chính mình', async () => {
      await expect(
        customerService.updateCustomerStatus('cus-5', { status: 'Locked' }, 5)
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'CANNOT_UPDATE_SELF',
      });
    });

    test('TC-8: Ném lỗi 404 CUSTOMER_NOT_FOUND nếu không tìm thấy khách hàng cần đổi trạng thái', async () => {
      jest.spyOn(customerRepository, 'findCustomerDetailById').mockResolvedValue(null);

      await expect(
        customerService.updateCustomerStatus(9999, { status: 'Locked' }, 1)
      ).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'CUSTOMER_NOT_FOUND',
      });
    });
  });
});
