import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_SHOP_VOUCHERS,
  canUseVoucherRole,
  getEffectiveVoucherStatus,
  hasCustomerUsedVoucher,
  readVoucherAuditLogs,
  readVouchersFromStorage,
  recordVoucherUsageInStorage,
  revertVoucherUsageInStorage,
  validateVoucherFormInput,
  appendVoucherAuditLog,
} from './voucherSync';
import type { UserAccount } from '@/types/animora.type';

function installMockWindowStorage() {
  const store = new Map<string, string>();
  const mockWindow = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
    dispatchEvent: () => true,
  };
  (globalThis as unknown as { window: unknown }).window = mockWindow;
  (globalThis as unknown as { Event: unknown }).Event = class MockEvent {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  };
}

describe('voucherSync constraints & lifecycle', () => {
  const makeUser = (role: UserAccount['role'], id = 'u-1'): UserAccount => ({
    id,
    fullName: 'User',
    email: `${id}@animora.vn`,
    phone: '0900000000',
    passwordHash: '123',
    role,
    createdAt: '2026-01-01',
    addresses: [],
  });

  beforeEach(() => {
    installMockWindowStorage();
  });

  it('enforces role permissions: only Customer (owner) or guest preview allowed; Doctor (vet) & internal roles blocked', () => {
    assert.equal(canUseVoucherRole(makeUser('owner')), true);
    assert.equal(canUseVoucherRole(null), true);
    assert.equal(canUseVoucherRole(makeUser('vet')), false);
    assert.equal(canUseVoucherRole(makeUser('care_staff')), false);
    assert.equal(canUseVoucherRole(makeUser('manager')), false);
    assert.equal(canUseVoucherRole(makeUser('admin')), false);
    assert.equal(canUseVoucherRole(makeUser('supplier')), false);
    assert.equal(canUseVoucherRole(makeUser('receptionist')), false);
  });

  it('validates voucher creation constraints (unique code, >0, <=100%, dates, maxUsage)', () => {
    const dup = validateVoucherFormInput(
      {
        code: 'ANIMORA10',
        discountType: 'percent',
        discountValue: 10,
        minOrderValue: 0,
        maxDiscount: 50000,
        applicableTo: 'Shop',
        startDate: '2026-11-17',
        endDate: '2026-11-30',
        maxUsage: 10,
      },
      INITIAL_SHOP_VOUCHERS
    );
    assert.equal(dup.valid, false);

    const over100 = validateVoucherFormInput(
      {
        code: 'NEW_CODE',
        discountType: 'percent',
        discountValue: 110,
        minOrderValue: 0,
        maxDiscount: 50000,
        applicableTo: 'Shop',
        startDate: '2026-11-17',
        endDate: '2026-11-30',
        maxUsage: 10,
      },
      INITIAL_SHOP_VOUCHERS
    );
    assert.equal(over100.valid, false);

    const badDates = validateVoucherFormInput(
      {
        code: 'NEW_CODE',
        discountType: 'fixed',
        discountValue: 20000,
        minOrderValue: 0,
        applicableTo: 'Shop',
        startDate: '2026-11-20',
        endDate: '2026-11-10',
        maxUsage: 10,
      },
      INITIAL_SHOP_VOUCHERS
    );
    assert.equal(badDates.valid, false);

    const ok = validateVoucherFormInput(
      {
        code: 'NEW_SHOP_25',
        discountType: 'percent',
        discountValue: 25,
        minOrderValue: 100000,
        maxDiscount: 80000,
        applicableTo: 'Sản phẩm Shop',
        startDate: '2026-11-17',
        endDate: '2026-11-30',
        maxUsage: 50,
      },
      INITIAL_SHOP_VOUCHERS
    );
    assert.equal(ok.valid, true);
  });

  it('computes effective status and tracks usage/revert lifecycle + manager audit log', () => {
    const customer = makeUser('owner', 'kh-1');
    const initialList = readVouchersFromStorage();
    const before = initialList.find((v) => v.code === 'ANIMORA10')!;
    assert.equal(getEffectiveVoucherStatus(before, '2026-11-17'), 'active');
    assert.equal(hasCustomerUsedVoucher('ANIMORA10', customer), false);

    recordVoucherUsageInStorage({
      voucherCode: 'ANIMORA10',
      currentUser: customer,
      orderCode: 'DH-2026-9999',
      discountAmount: 30000,
    });

    const afterUse = readVouchersFromStorage().find((v) => v.code === 'ANIMORA10')!;
    assert.equal(afterUse.usedCount, before.usedCount + 1);
    assert.equal(hasCustomerUsedVoucher('ANIMORA10', customer), true);

    revertVoucherUsageInStorage('DH-2026-9999');
    const afterRevert = readVouchersFromStorage().find((v) => v.code === 'ANIMORA10')!;
    assert.equal(afterRevert.usedCount, before.usedCount);
    assert.equal(hasCustomerUsedVoucher('ANIMORA10', customer), false);

    appendVoucherAuditLog({
      action: 'PAUSE',
      voucherCode: 'ANIMORA10',
      detail: 'Tạm dừng test',
    });
    const logs = readVoucherAuditLogs();
    assert.equal(logs[0].actorLabel, 'Đã xử lý bởi Quản lý');
  });
});

