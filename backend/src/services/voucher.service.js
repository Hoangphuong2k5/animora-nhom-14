import { AppDataSource } from '../config/data-source.js';
import defaultVoucherRepo from '../repositories/voucher.repository.js';
import defaultNotificationRepo from '../repositories/notification.repository.js';
import ApiError from '../utils/ApiError.js';
import { toDbRoleName, DB_ROLES } from '../utils/constants.js';
import {
  computeEffectiveVoucherStatus,
  toVoucherDTO,
  toVoucherUsageDTO,
} from '../dtos/voucher.dto.js';

const MANAGER_ACTOR_LABEL = 'Đã xử lý bởi Quản lý';

/**
 * VoucherService - Quản lý & áp dụng Voucher Shop theo Tài liệu Nghiệp vụ v1.2 và AnimoraDB v1.5
 * - VOUCHER.VIEW: QL, AD
 * - VOUCHER.MANAGE: QL
 * - VOUCHER.USE: KH (chặn tuyệt đối Bác sĩ/BS, NVCS, QL, AD, SUP, TCH)
 */
class VoucherService {
  constructor(
    voucherRepo = defaultVoucherRepo,
    notificationRepo = defaultNotificationRepo,
    dataSource = AppDataSource
  ) {
    this.voucherRepo = voucherRepo;
    this.notificationRepo = notificationRepo;
    this.dataSource = dataSource;
  }

  resolveDbRole(currentUser) {
    if (!currentUser) return '';
    return String(currentUser.dbRole || toDbRoleName(currentUser.role) || '');
  }

  assertCustomerOnly(currentUser) {
    const dbRole = this.resolveDbRole(currentUser);
    if (dbRole !== DB_ROLES.CUSTOMER) {
      throw new ApiError(
        403,
        'Chỉ tài khoản Khách hàng mới được phép áp dụng voucher mua hàng tại Shop',
        'VOUCHER_ROLE_FORBIDDEN'
      );
    }
  }

  assertManagerOnly(currentUser) {
    const dbRole = this.resolveDbRole(currentUser);
    if (dbRole !== DB_ROLES.MANAGER) {
      throw new ApiError(
        403,
        'Chỉ Quản lý nghiệp vụ mới có quyền thao tác quản lý voucher',
        'VOUCHER_MANAGE_FORBIDDEN'
      );
    }
  }

  computeDiscountAmount(voucher, subtotal) {
    const safeSubtotal = Math.max(0, Number(subtotal || 0));
    const value = Number(voucher.DiscountValue || 0);
    let discount = 0;
    if (voucher.DiscountType === 'Percentage') {
      discount = Math.round((safeSubtotal * value) / 100);
      if (
        voucher.MaximumDiscountAmount !== null &&
        voucher.MaximumDiscountAmount !== undefined
      ) {
        discount = Math.min(discount, Number(voucher.MaximumDiscountAmount));
      }
    } else {
      discount = Math.round(value);
    }
    return Math.min(safeSubtotal, Math.max(0, discount));
  }

  async listVouchers(query = {}) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
    const statusFilter = query.status || 'all';
    const now = new Date();

    const rows = await this.voucherRepo.findAll({ search: query.search });
    let items = rows.map((row) => toVoucherDTO(row, now));

    if (statusFilter !== 'all') {
      items = items.filter((item) => item.effectiveStatus === statusFilter);
    }

    const totalItems = items.length;
    const start = (page - 1) * limit;
    const pagedItems = items.slice(start, start + limit);

    return { items: pagedItems, page, limit, totalItems };
  }

  async createVoucher(currentUser, payload, meta = {}) {
    this.assertManagerOnly(currentUser);
    const code = String(payload.code || '').trim().toUpperCase();
    const startAt = new Date(payload.startAt);
    const endAt = new Date(payload.endAt);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
      throw new ApiError(400, 'Thời hạn voucher không hợp lệ (EndAt phải sau StartAt)', 'INVALID_VOUCHER_DATES');
    }

    const discountValue = Number(payload.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new ApiError(400, 'Giá trị giảm giá phải lớn hơn 0', 'INVALID_DISCOUNT_VALUE');
    }
    if (payload.discountType === 'Percentage' && discountValue > 100) {
      throw new ApiError(400, 'Mức giảm theo phần trăm không được vượt quá 100%', 'INVALID_PERCENT_RANGE');
    }

    const existing = await this.voucherRepo.findByCode(code);
    if (existing) {
      throw new ApiError(409, `Mã voucher ${code} đã tồn tại trong hệ thống`, 'VOUCHER_CODE_EXISTS');
    }

    const created = await this.dataSource.transaction(async (manager) => {
      const entity = await this.voucherRepo.createVoucher(
        {
          VoucherCode: code,
          VoucherName: String(payload.name).trim(),
          DiscountType: payload.discountType,
          DiscountValue: discountValue,
          MaximumDiscountAmount:
            payload.discountType === 'Percentage' &&
            payload.maxDiscount !== null &&
            payload.maxDiscount !== undefined
              ? Number(payload.maxDiscount)
              : null,
          MinimumOrderAmount: Number(payload.minOrderValue ?? 0),
          StartAt: startAt,
          EndAt: endAt,
          UsageLimit:
            payload.usageLimit !== null && payload.usageLimit !== undefined
              ? Number(payload.usageLimit)
              : null,
          UsedCount: 0,
          IsActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
        },
        manager
      );

      await this.notificationRepo.createAuditLog(
        {
          actor_id: currentUser.id,
          action: 'VOUCHER_CREATE',
          entity_type: 'Vouchers',
          entity_id: String(entity.VoucherID),
          old_values: null,
          new_values: {
            VoucherCode: entity.VoucherCode,
            DiscountType: entity.DiscountType,
            DiscountValue: Number(entity.DiscountValue),
            UsageLimit: entity.UsageLimit,
            IsActive: entity.IsActive,
          },
          reason: `${MANAGER_ACTOR_LABEL}: Tạo voucher mới ${entity.VoucherCode}`,
          ip_address: meta.ipAddress || null,
          user_agent: meta.userAgent || null,
        },
        manager
      );

      return entity;
    });

    return toVoucherDTO(created);
  }

  async toggleVoucherStatus(currentUser, voucherId, { isActive, reason }, meta = {}) {
    this.assertManagerOnly(currentUser);
    const voucher = await this.voucherRepo.findById(voucherId);
    if (!voucher) {
      throw new ApiError(404, 'Không tìm thấy voucher', 'VOUCHER_NOT_FOUND');
    }

    const now = new Date();
    const effectiveStatus = computeEffectiveVoucherStatus(voucher, now);
    if (isActive && effectiveStatus === 'exhausted') {
      throw new ApiError(
        400,
        'Voucher đã đạt giới hạn lượt sử dụng, không thể kích hoạt lại',
        'VOUCHER_EXHAUSTED'
      );
    }
    if (isActive && effectiveStatus === 'expired') {
      throw new ApiError(
        400,
        'Voucher đã hết hạn sử dụng, không thể kích hoạt lại',
        'VOUCHER_EXPIRED'
      );
    }

    const updated = await this.dataSource.transaction(async (manager) => {
      const next = await this.voucherRepo.updateVoucher(
        voucherId,
        { IsActive: Boolean(isActive) },
        manager
      );

      await this.notificationRepo.createAuditLog(
        {
          actor_id: currentUser.id,
          action: isActive ? 'VOUCHER_ACTIVATE' : 'VOUCHER_PAUSE',
          entity_type: 'Vouchers',
          entity_id: String(voucher.VoucherID),
          old_values: { IsActive: Boolean(voucher.IsActive) },
          new_values: { IsActive: Boolean(isActive) },
          reason: `${MANAGER_ACTOR_LABEL}${reason ? `: ${reason}` : ''}`,
          ip_address: meta.ipAddress || null,
          user_agent: meta.userAgent || null,
        },
        manager
      );

      return next;
    });

    return toVoucherDTO(updated, now);
  }

  async deleteVoucher(currentUser, voucherId, meta = {}) {
    this.assertManagerOnly(currentUser);
    const voucher = await this.voucherRepo.findById(voucherId);
    if (!voucher) {
      throw new ApiError(404, 'Không tìm thấy voucher', 'VOUCHER_NOT_FOUND');
    }

    const hasRef = await this.voucherRepo.hasOrderReference(voucherId);
    if (Number(voucher.UsedCount ?? 0) > 0 || hasRef) {
      throw new ApiError(
        409,
        'Voucher đã phát sinh lượt sử dụng hoặc đơn hàng tham chiếu, không thể xóa vật lý. Vui lòng tạm dừng voucher.',
        'VOUCHER_IN_USE'
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await this.voucherRepo.deleteVoucher(voucherId, manager);
      await this.notificationRepo.createAuditLog(
        {
          actor_id: currentUser.id,
          action: 'VOUCHER_DELETE',
          entity_type: 'Vouchers',
          entity_id: String(voucher.VoucherID),
          old_values: {
            VoucherCode: voucher.VoucherCode,
            VoucherName: voucher.VoucherName,
            UsedCount: Number(voucher.UsedCount ?? 0),
          },
          new_values: null,
          reason: `${MANAGER_ACTOR_LABEL}: Xóa voucher chưa sử dụng ${voucher.VoucherCode}`,
          ip_address: meta.ipAddress || null,
          user_agent: meta.userAgent || null,
        },
        manager
      );
    });

    return { deleted: true, id: Number(voucher.VoucherID), code: voucher.VoucherCode };
  }

  async validateVoucherConditions({ code, subtotal, scope = 'shop', customerId, manager = null }) {
    if (String(scope || 'shop').toLowerCase() !== 'shop') {
      throw new ApiError(
        400,
        'Voucher hiện chỉ áp dụng cho đơn hàng Shop',
        'VOUCHER_SCOPE_NOT_SUPPORTED'
      );
    }

    const normalizedCode = String(code || '').trim().toUpperCase();
    const voucher = await this.voucherRepo.findByCode(normalizedCode, manager);
    if (!voucher) {
      throw new ApiError(404, 'Mã voucher không tồn tại hoặc không hợp lệ', 'VOUCHER_NOT_FOUND');
    }

    const now = new Date();
    const startAt = new Date(voucher.StartAt);
    const endAt = new Date(voucher.EndAt);

    if (!voucher.IsActive) {
      throw new ApiError(400, 'Voucher đang tạm dừng áp dụng', 'VOUCHER_PAUSED');
    }
    if (now < startAt) {
      throw new ApiError(400, 'Voucher chưa đến thời gian hiệu lực', 'VOUCHER_NOT_STARTED');
    }
    if (now > endAt) {
      throw new ApiError(400, 'Voucher đã hết hạn sử dụng', 'VOUCHER_EXPIRED');
    }
    if (
      voucher.UsageLimit !== null &&
      voucher.UsageLimit !== undefined &&
      Number(voucher.UsedCount ?? 0) >= Number(voucher.UsageLimit)
    ) {
      throw new ApiError(400, 'Voucher đã hết lượt sử dụng', 'VOUCHER_EXHAUSTED');
    }

    const safeSubtotal = Number(subtotal ?? 0);
    const minOrder = Number(voucher.MinimumOrderAmount ?? 0);
    if (safeSubtotal < minOrder) {
      throw new ApiError(
        400,
        `Đơn hàng chưa đạt giá trị tối thiểu ${minOrder.toLocaleString('vi-VN')}đ`,
        'VOUCHER_MIN_ORDER_NOT_MET'
      );
    }

    if (customerId) {
      const existingUsage = await this.voucherRepo.findActiveUsageByCustomer(
        voucher.VoucherID,
        customerId,
        manager
      );
      if (existingUsage) {
        throw new ApiError(
          409,
          'Bạn đã sử dụng mã voucher này cho một đơn hàng trước đó',
          'VOUCHER_ALREADY_USED_BY_CUSTOMER'
        );
      }
    }

    const discountAmount = this.computeDiscountAmount(voucher, safeSubtotal);
    return { voucher, discountAmount };
  }

  async validateVoucherForCustomer(currentUser, payload) {
    this.assertCustomerOnly(currentUser);
    const customer = await this.voucherRepo.resolveCustomerByUserId(currentUser.id);
    if (!customer) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
    }

    const { voucher, discountAmount } = await this.validateVoucherConditions({
      code: payload.code,
      subtotal: payload.subtotal,
      scope: payload.scope || 'shop',
      customerId: Number(customer.CustomerID),
    });

    return {
      valid: true,
      voucher: toVoucherDTO(voucher),
      discountAmount,
    };
  }

  async applyVoucherToOrder(currentUser, payload, meta = {}) {
    this.assertCustomerOnly(currentUser);

    return await this.dataSource.transaction(async (manager) => {
      const customer = await this.voucherRepo.resolveCustomerByUserId(currentUser.id, manager);
      if (!customer) {
        throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
      }

      const order = await this.voucherRepo.findOrderById(payload.orderId, manager);
      if (!order) {
        throw new ApiError(404, 'Không tìm thấy đơn hàng', 'ORDER_NOT_FOUND');
      }
      if (Number(order.CustomerID) !== Number(customer.CustomerID)) {
        throw new ApiError(403, 'Bạn không có quyền áp dụng voucher cho đơn hàng này', 'ORDER_FORBIDDEN');
      }
      if (order.VoucherID) {
        throw new ApiError(409, 'Đơn hàng này đã áp dụng voucher trước đó', 'ORDER_ALREADY_HAS_VOUCHER');
      }

      const orderSubtotal = Number(order.SubtotalAmount ?? payload.subtotal ?? 0);
      const { voucher, discountAmount } = await this.validateVoucherConditions({
        code: payload.code,
        subtotal: orderSubtotal,
        scope: payload.scope || 'shop',
        customerId: Number(customer.CustomerID),
        manager,
      });

      const incremented = await this.voucherRepo.incrementUsedCountAtomically(
        voucher.VoucherID,
        manager
      );
      if (!incremented) {
        throw new ApiError(
          409,
          'Voucher vừa hết lượt sử dụng hoặc đã bị tạm dừng',
          'VOUCHER_EXHAUSTED'
        );
      }

      const history = await this.voucherRepo.createUsageHistory(
        {
          VoucherID: Number(voucher.VoucherID),
          CustomerID: Number(customer.CustomerID),
          OrderID: Number(order.OrderID),
          DiscountAmount: discountAmount,
          UsageStatus: 'Used',
        },
        manager
      );

      const shippingFee = Number(order.ShippingFee ?? 0);
      const totalAmount = Math.max(0, orderSubtotal - discountAmount + shippingFee);

      await this.voucherRepo.updateOrderVoucherTotals(
        order.OrderID,
        {
          voucherId: voucher.VoucherID,
          discountAmount,
          totalAmount,
        },
        manager
      );

      await this.notificationRepo.createAuditLog(
        {
          actor_id: currentUser.id,
          action: 'VOUCHER_APPLY',
          entity_type: 'VoucherUsageHistory',
          entity_id: String(history.VoucherUsageHistoryID),
          old_values: { VoucherID: null, DiscountAmount: 0, TotalAmount: Number(order.TotalAmount) },
          new_values: {
            VoucherID: Number(voucher.VoucherID),
            VoucherCode: voucher.VoucherCode,
            OrderID: Number(order.OrderID),
            DiscountAmount: discountAmount,
            TotalAmount: totalAmount,
          },
          reason: `Khách hàng áp dụng voucher ${voucher.VoucherCode} cho đơn ${order.OrderCode}`,
          ip_address: meta.ipAddress || null,
          user_agent: meta.userAgent || null,
        },
        manager
      );

      return {
        applied: true,
        usage: toVoucherUsageDTO(history),
        discountAmount,
        totalAmount,
      };
    });
  }

  async revertVoucherForOrder(currentUser, orderId, reason = '', meta = {}) {
    const dbRole = this.resolveDbRole(currentUser);
    if (dbRole !== DB_ROLES.CUSTOMER && dbRole !== DB_ROLES.MANAGER) {
      throw new ApiError(
        403,
        'Chỉ Khách hàng sở hữu đơn hoặc Quản lý mới được hoàn tác voucher',
        'VOUCHER_REVERT_FORBIDDEN'
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const order = await this.voucherRepo.findOrderById(orderId, manager);
      if (!order) {
        throw new ApiError(404, 'Không tìm thấy đơn hàng', 'ORDER_NOT_FOUND');
      }

      if (dbRole === DB_ROLES.CUSTOMER) {
        const customer = await this.voucherRepo.resolveCustomerByUserId(currentUser.id, manager);
        if (!customer || Number(order.CustomerID) !== Number(customer.CustomerID)) {
          throw new ApiError(403, 'Bạn không có quyền hoàn tác voucher của đơn hàng này', 'ORDER_FORBIDDEN');
        }
      }

      const history = await this.voucherRepo.findUsageByOrderId(orderId, manager);
      if (!history || history.UsageStatus !== 'Used') {
        throw new ApiError(404, 'Đơn hàng không có lịch sử voucher đang hiệu lực để hoàn tác', 'VOUCHER_USAGE_NOT_FOUND');
      }

      const reverted = await this.voucherRepo.markUsageReverted(
        history.VoucherUsageHistoryID,
        manager
      );
      await this.voucherRepo.decrementUsedCount(history.VoucherID, manager);

      const actorPrefix = dbRole === DB_ROLES.MANAGER ? `${MANAGER_ACTOR_LABEL}: ` : '';
      await this.notificationRepo.createAuditLog(
        {
          actor_id: currentUser.id,
          action: 'VOUCHER_REVERT',
          entity_type: 'VoucherUsageHistory',
          entity_id: String(history.VoucherUsageHistoryID),
          old_values: { UsageStatus: 'Used' },
          new_values: { UsageStatus: 'Reverted' },
          reason: `${actorPrefix}Hoàn tác voucher đơn ${order.OrderCode}${reason ? ` - ${reason}` : ''}`,
          ip_address: meta.ipAddress || null,
          user_agent: meta.userAgent || null,
        },
        manager
      );

      return {
        reverted: true,
        usage: toVoucherUsageDTO(reverted),
      };
    });
  }
}

const defaultVoucherService = new VoucherService();
export { defaultVoucherService, VoucherService };
export default defaultVoucherService;

