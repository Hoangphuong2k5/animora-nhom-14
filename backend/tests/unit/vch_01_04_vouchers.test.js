import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { VoucherService } from '../../src/services/voucher.service.js';
import { authorizeRoles } from '../../src/middlewares/role.middleware.js';
import { ROLES, DB_ROLES } from '../../src/utils/constants.js';

describe('[VCH-01..04] Unit Tests - Quản lý & Áp dụng Voucher Shop (BS - KH - QL - AD)', () => {
  let mockVoucherRepo;
  let mockNotificationRepo;
  let mockDataSource;
  let voucherService;

  const managerUser = { id: 2, role: 'manager', dbRole: DB_ROLES.MANAGER };
  const adminUser = { id: 1, role: 'admin', dbRole: DB_ROLES.ADMIN };
  const doctorUser = { id: 3, role: 'expert', dbRole: DB_ROLES.DOCTOR };
  const careStaffUser = { id: 4, role: 'care_staff', dbRole: DB_ROLES.CARE_STAFF };
  const customerUser = { id: 10, role: 'customer', dbRole: DB_ROLES.CUSTOMER };

  const activeVoucher = {
    VoucherID: 1,
    VoucherCode: 'ANIMORA10',
    VoucherName: 'Giảm 10% đơn hàng Shop',
    DiscountType: 'Percentage',
    DiscountValue: 10,
    MaximumDiscountAmount: 100000,
    MinimumOrderAmount: 200000,
    StartAt: new Date(Date.now() - 86400000),
    EndAt: new Date(Date.now() + 86400000 * 30),
    UsageLimit: 100,
    UsedCount: 5,
    IsActive: true,
    CreatedAt: new Date(),
  };

  beforeEach(() => {
    mockVoucherRepo = {
      resolveCustomerByUserId: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      createVoucher: jest.fn(),
      updateVoucher: jest.fn(),
      deleteVoucher: jest.fn(),
      hasOrderReference: jest.fn(),
      findActiveUsageByCustomer: jest.fn(),
      findUsageByOrderId: jest.fn(),
      findOrderById: jest.fn(),
      incrementUsedCountAtomically: jest.fn(),
      decrementUsedCount: jest.fn(),
      createUsageHistory: jest.fn(),
      markUsageReverted: jest.fn(),
      updateOrderVoucherTotals: jest.fn(),
    };

    mockNotificationRepo = {
      createAuditLog: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(async (cb) => cb({})),
    };

    voucherService = new VoucherService(mockVoucherRepo, mockNotificationRepo, mockDataSource);
  });

  describe('RBAC Middleware (Tài liệu v1.2 & AnimoraDB v1.5)', () => {
    test('Chặn Bác sĩ (Doctor/Expert), Quản lý, Admin dùng endpoint VOUCHER.USE (chỉ KH)', () => {
      const guard = authorizeRoles(ROLES.CUSTOMER);
      const next = jest.fn();

      expect(() => guard({ user: doctorUser }, {}, next)).toThrow(
        'Bạn không có quyền thực hiện thao tác này'
      );
      expect(() => guard({ user: careStaffUser }, {}, next)).toThrow(
        'Bạn không có quyền thực hiện thao tác này'
      );
      expect(() => guard({ user: managerUser }, {}, next)).toThrow(
        'Bạn không có quyền thực hiện thao tác này'
      );
      expect(() => guard({ user: adminUser }, {}, next)).toThrow(
        'Bạn không có quyền thực hiện thao tác này'
      );

      guard({ user: customerUser }, {}, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('Chặn Admin và Bác sĩ thao tác quản lý VOUCHER.MANAGE (chỉ QL)', () => {
      const guard = authorizeRoles(ROLES.MANAGER);
      const next = jest.fn();

      expect(() => guard({ user: adminUser }, {}, next)).toThrow(
        'Bạn không có quyền thực hiện thao tác này'
      );
      expect(() => guard({ user: doctorUser }, {}, next)).toThrow(
        'Bạn không có quyền thực hiện thao tác này'
      );
      expect(() => guard({ user: customerUser }, {}, next)).toThrow(
        'Bạn không có quyền thực hiện thao tác này'
      );

      guard({ user: managerUser }, {}, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('Cho phép QL và AD xem danh sách VOUCHER.VIEW, chặn Bác sĩ và Khách hàng', () => {
      const guard = authorizeRoles(ROLES.MANAGER, ROLES.ADMIN);
      const next = jest.fn();

      expect(() => guard({ user: doctorUser }, {}, next)).toThrow(
        'Bạn không có quyền thực hiện thao tác này'
      );
      expect(() => guard({ user: customerUser }, {}, next)).toThrow(
        'Bạn không có quyền thực hiện thao tác này'
      );

      guard({ user: managerUser }, {}, next);
      guard({ user: adminUser }, {}, next);
      expect(next).toHaveBeenCalledTimes(2);
    });
  });

  describe('Quản lý Voucher (QL) - Ràng buộc DB & Audit Log', () => {
    test('Tạo voucher mới thành công và ghi AuditLog "Đã xử lý bởi Quản lý"', async () => {
      mockVoucherRepo.findByCode.mockResolvedValue(null);
      mockVoucherRepo.createVoucher.mockImplementation(async (data) => ({
        VoucherID: 99,
        ...data,
        CreatedAt: new Date(),
      }));

      const res = await voucherService.createVoucher(managerUser, {
        code: 'shop20',
        name: 'Ưu đãi Shop 20%',
        discountType: 'Percentage',
        discountValue: 20,
        maxDiscount: 80000,
        minOrderValue: 250000,
        startAt: '2026-11-01T00:00:00Z',
        endAt: '2026-12-31T23:59:59Z',
        usageLimit: 50,
      });

      expect(res.code).toBe('SHOP20');
      expect(res.applicableScope).toBe('shop');
      expect(mockNotificationRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'VOUCHER_CREATE',
          entity_type: 'Vouchers',
          reason: expect.stringContaining('Đã xử lý bởi Quản lý'),
        }),
        expect.anything()
      );
    });

    test('Từ chối tạo voucher trùng mã, % > 100 hoặc EndAt <= StartAt', async () => {
      await expect(
        voucherService.createVoucher(managerUser, {
          code: 'BAD_PCT',
          name: 'Sai %',
          discountType: 'Percentage',
          discountValue: 120,
          startAt: '2026-11-01T00:00:00Z',
          endAt: '2026-12-01T00:00:00Z',
        })
      ).rejects.toMatchObject({ errorCode: 'INVALID_PERCENT_RANGE' });

      await expect(
        voucherService.createVoucher(managerUser, {
          code: 'BAD_DATE',
          name: 'Sai ngày',
          discountType: 'FixedAmount',
          discountValue: 20000,
          startAt: '2026-12-01T00:00:00Z',
          endAt: '2026-11-01T00:00:00Z',
        })
      ).rejects.toMatchObject({ errorCode: 'INVALID_VOUCHER_DATES' });

      mockVoucherRepo.findByCode.mockResolvedValue(activeVoucher);
      await expect(
        voucherService.createVoucher(managerUser, {
          code: 'ANIMORA10',
          name: 'Trùng mã',
          discountType: 'Percentage',
          discountValue: 10,
          startAt: '2026-11-01T00:00:00Z',
          endAt: '2026-12-01T00:00:00Z',
        })
      ).rejects.toMatchObject({ errorCode: 'VOUCHER_CODE_EXISTS', statusCode: 409 });
    });

    test('Chặn xóa cứng voucher đã phát sinh lượt sử dụng (UsedCount > 0)', async () => {
      mockVoucherRepo.findById.mockResolvedValue(activeVoucher);
      mockVoucherRepo.hasOrderReference.mockResolvedValue(true);

      await expect(voucherService.deleteVoucher(managerUser, 1)).rejects.toMatchObject({
        errorCode: 'VOUCHER_IN_USE',
        statusCode: 409,
      });
      expect(mockVoucherRepo.deleteVoucher).not.toHaveBeenCalled();
    });

    test('Chặn kích hoạt lại voucher đã hết lượt (exhausted) hoặc hết hạn (expired)', async () => {
      mockVoucherRepo.findById.mockResolvedValue({
        ...activeVoucher,
        UsedCount: 100,
        UsageLimit: 100,
        IsActive: false,
      });

      await expect(
        voucherService.toggleVoucherStatus(managerUser, 1, { isActive: true })
      ).rejects.toMatchObject({ errorCode: 'VOUCHER_EXHAUSTED' });
    });
  });

  describe('Sử dụng Voucher Shop (KH) & Chặn Bác sĩ (BS)', () => {
    test('Chặn Bác sĩ gọi validateVoucherForCustomer và applyVoucherToOrder', async () => {
      await expect(
        voucherService.validateVoucherForCustomer(doctorUser, {
          code: 'ANIMORA10',
          subtotal: 300000,
        })
      ).rejects.toMatchObject({ errorCode: 'VOUCHER_ROLE_FORBIDDEN', statusCode: 403 });

      await expect(
        voucherService.applyVoucherToOrder(doctorUser, {
          code: 'ANIMORA10',
          orderId: 55,
          subtotal: 300000,
        })
      ).rejects.toMatchObject({ errorCode: 'VOUCHER_ROLE_FORBIDDEN', statusCode: 403 });
    });

    test('Chặn phạm vi ngoài Shop (ví dụ service/booking)', async () => {
      mockVoucherRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 10 });
      await expect(
        voucherService.validateVoucherForCustomer(customerUser, {
          code: 'ANIMORA10',
          subtotal: 300000,
          scope: 'service',
        })
      ).rejects.toMatchObject({ errorCode: 'VOUCHER_SCOPE_NOT_SUPPORTED', statusCode: 400 });
    });

    test('Chặn khách hàng dùng lại voucher đang trạng thái Used', async () => {
      mockVoucherRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 10 });
      mockVoucherRepo.findByCode.mockResolvedValue(activeVoucher);
      mockVoucherRepo.findActiveUsageByCustomer.mockResolvedValue({
        VoucherUsageHistoryID: 7,
        UsageStatus: 'Used',
      });

      await expect(
        voucherService.validateVoucherForCustomer(customerUser, {
          code: 'ANIMORA10',
          subtotal: 400000,
        })
      ).rejects.toMatchObject({
        errorCode: 'VOUCHER_ALREADY_USED_BY_CUSTOMER',
        statusCode: 409,
      });
    });

    test('Áp dụng voucher vào đơn hàng Shop nguyên tử (tăng UsedCount, ghi VoucherUsageHistory) và hoàn tác khi hủy đơn', async () => {
      mockVoucherRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 10 });
      mockVoucherRepo.findOrderById.mockResolvedValue({
        OrderID: 55,
        CustomerID: 10,
        OrderCode: 'ORD-55',
        VoucherID: null,
        SubtotalAmount: 500000,
        ShippingFee: 0,
        TotalAmount: 500000,
      });
      mockVoucherRepo.findByCode.mockResolvedValue(activeVoucher);
      mockVoucherRepo.findActiveUsageByCustomer.mockResolvedValue(null);
      mockVoucherRepo.incrementUsedCountAtomically.mockResolvedValue(true);
      mockVoucherRepo.createUsageHistory.mockResolvedValue({
        VoucherUsageHistoryID: 88,
        VoucherID: 1,
        CustomerID: 10,
        OrderID: 55,
        DiscountAmount: 50000,
        UsageStatus: 'Used',
        UsedAt: new Date(),
      });

      const applied = await voucherService.applyVoucherToOrder(customerUser, {
        code: 'ANIMORA10',
        orderId: 55,
        subtotal: 500000,
      });

      expect(applied.discountAmount).toBe(50000);
      expect(applied.totalAmount).toBe(450000);
      expect(mockVoucherRepo.incrementUsedCountAtomically).toHaveBeenCalledWith(1, expect.anything());
      expect(mockVoucherRepo.updateOrderVoucherTotals).toHaveBeenCalledWith(
        55,
        { voucherId: 1, discountAmount: 50000, totalAmount: 450000 },
        expect.anything()
      );

      // Revert khi hủy/trả đơn
      mockVoucherRepo.findUsageByOrderId.mockResolvedValue({
        VoucherUsageHistoryID: 88,
        VoucherID: 1,
        CustomerID: 10,
        OrderID: 55,
        DiscountAmount: 50000,
        UsageStatus: 'Used',
      });
      mockVoucherRepo.markUsageReverted.mockResolvedValue({
        VoucherUsageHistoryID: 88,
        VoucherID: 1,
        CustomerID: 10,
        OrderID: 55,
        DiscountAmount: 50000,
        UsageStatus: 'Reverted',
        RevertedAt: new Date(),
      });

      const reverted = await voucherService.revertVoucherForOrder(managerUser, 55, 'Đơn bị hủy');
      expect(reverted.reverted).toBe(true);
      expect(reverted.usage.usageStatus).toBe('Reverted');
      expect(mockVoucherRepo.decrementUsedCount).toHaveBeenCalledWith(1, expect.anything());
    });
  });
});

