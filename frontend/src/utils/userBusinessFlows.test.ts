import test from 'node:test';
import assert from 'node:assert/strict';
import { getActiveMedicationReminders } from './clinicalSync';
import { getDoctorsWithLiveRatings } from '@/data/doctorsDirectory';
import {
  SERVICES_DATA,
  resolveServicePaymentTiming,
} from '@/data/servicesData';
import {
  createReturnRefundRequest,
  doesOrderBelongToUser,
  getOrderStatusLabel,
  processReturnRefundRequestInStorage,
  SAMPLE_SHOP_ORDERS,
  updateOrderStatusInStorage,
} from './orderSync';
import type { Prescription } from '@/types/expert.type';
import type { UserAccount } from '@/types/animora.type';

test('getActiveMedicationReminders returns active prescriptions and excludes expired ones', () => {
  const now = new Date(2026, 10, 12, 10, 0, 0); // 2026-11-12
  const prescriptions: Prescription[] = [
    {
      id: 'rx-active',
      code: 'DT-2026-101',
      expertId: 'exp-vet-01',
      petId: 'pet-001',
      ownerId: 'own-001',
      issuedAt: '2026-11-10',
      diagnosis: 'Viêm da nhẹ',
      severity: 'mild',
      lines: [
        {
          medicineId: 'med-001',
          dosage: '1 viên/ngày',
          days: 7,
          instruction: 'Uống sau ăn',
        },
      ],
      refillsAllowed: 2,
      refillsUsed: 0,
      refillLog: [],
    },
    {
      id: 'rx-expired',
      code: 'DT-2026-090',
      expertId: 'exp-vet-01',
      petId: 'pet-001',
      ownerId: 'own-001',
      issuedAt: '2026-10-01',
      diagnosis: 'Rối loạn tiêu hóa',
      severity: 'mild',
      lines: [
        {
          medicineId: 'med-001',
          dosage: '1 viên/ngày',
          days: 5,
          instruction: 'Uống sáng',
        },
      ],
      refillsAllowed: 1,
      refillsUsed: 0,
      refillLog: [],
    },
  ];

  const active = getActiveMedicationReminders(prescriptions, now);
  assert.equal(active.length, 1);
  assert.equal(active[0].prescriptionCode, 'DT-2026-101');
  assert.equal(active[0].daysLeft, 5);
});

test('getDoctorsWithLiveRatings filters by category and sorts highest rated first', () => {
  const vetDoctors = getDoctorsWithLiveRatings([], 'vet');
  assert.ok(vetDoctors.length >= 2);
  for (let i = 1; i < vetDoctors.length; i++) {
    assert.ok(vetDoctors[i - 1].rating >= vetDoctors[i].rating);
  }
});

test('resolveServicePaymentTiming distinguishes prepaid vs postpaid defaults', () => {
  const checkup = SERVICES_DATA.find((s) => s.id === 'checkup')!;
  const dental = SERVICES_DATA.find((s) => s.id === 'dental')!;
  assert.equal(resolveServicePaymentTiming(checkup), 'postpaid');
  assert.equal(resolveServicePaymentTiming(dental), 'prepaid');
});

test('doesOrderBelongToUser and getOrderStatusLabel work accurately', () => {
  const user: UserAccount = {
    id: 'user-demo-owner',
    fullName: 'Phan Thị Đinh Thùy',
    email: 'phanthidinhthuy6@gmail.com',
    phone: '0337203332',
    passwordHash: '123456',
    role: 'owner',
    createdAt: '2026-01-15',
    addresses: [],
  };
  const matched = SAMPLE_SHOP_ORDERS.filter((o) => doesOrderBelongToUser(o, user));
  assert.equal(matched.length, 2);

  const sessionDemoUser: UserAccount = {
    id: 'user-demo',
    fullName: 'Animora User',
    email: 'user@animora.vn',
    phone: '0900000000',
    passwordHash: '123456',
    role: 'owner',
    createdAt: '2026-01-01',
    addresses: [],
  };
  const sessionMatched = SAMPLE_SHOP_ORDERS.filter((o) =>
    doesOrderBelongToUser(o, sessionDemoUser)
  );
  assert.equal(sessionMatched.length, 2);

  assert.equal(getOrderStatusLabel('delivered', 'vi'), 'Đã giao');
  assert.equal(getOrderStatusLabel('received', 'vi'), 'Đã nhận hàng');
  assert.equal(getOrderStatusLabel('received', 'en'), 'Received');
  assert.equal(getOrderStatusLabel('returned', 'en'), 'Returned / Refunded');
});

test('updateOrderStatusInStorage and processReturnRefundRequestInStorage sync order, return status and defective stockDisposition (ver1.4.1)', () => {
  const storageMap = new Map<string, string>();
  const prevWindow = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => storageMap.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storageMap.set(k, v);
      },
      removeItem: (k: string) => {
        storageMap.delete(k);
      },
    },
    dispatchEvent: () => true,
  };

  try {
    const updatedOrders = updateOrderStatusInStorage('ord-2', 'delivered');
    const ord2 = updatedOrders.find((o) => o.id === 'ord-2');
    assert.equal(ord2?.status, 'delivered');

    const receivedOrders = updateOrderStatusInStorage('ord-2', 'received');
    const ord2Received = receivedOrders.find((o) => o.id === 'ord-2');
    assert.equal(ord2Received?.status, 'received');

    // Trả hàng lỗi -> mặc định defective_writeoff (tuyệt đối không cộng lại tồn bán được)
    const req = createReturnRefundRequest({
      orderCode: 'ORD-94822',
      userId: 'user-demo',
      customerName: 'Nguyễn Minh Anh',
      phone: '0901234567',
      productName: 'Cát vệ sinh Cature (x2)',
      requestType: 'return_refund',
      reason: '[Hoàn hàng / Hoàn tiền] Sản phẩm bị lỗi',
      refundAmount: 420000,
    });
    assert.equal(req.status, 'pending');

    const { returns, orders } = processReturnRefundRequestInStorage(req.id, 'approved');
    const approvedReq = returns.find((r) => r.id === req.id);
    const returnedOrder = orders.find((o) => o.orderCode === 'ORD-94822');
    assert.equal(approvedReq?.status, 'approved');
    assert.equal(approvedReq?.stockDisposition, 'defective_writeoff');
    assert.equal(returnedOrder?.status, 'returned');

    // Đơn hủy trước khi giao -> mặc định restock_sellable (Hoàn bán +)
    const cancelReq = createReturnRefundRequest({
      orderCode: 'ORD-94821',
      userId: 'user-demo',
      customerName: 'Nguyễn Minh Anh',
      phone: '0901234567',
      productName: 'Hạt khô Royal Canin',
      requestType: 'cancel',
      reason: 'Khách hủy trước khi giao hàng',
      refundAmount: 350000,
    });
    const cancelRes = processReturnRefundRequestInStorage(cancelReq.id, 'approved');
    const approvedCancel = cancelRes.returns.find((r) => r.id === cancelReq.id);
    assert.equal(approvedCancel?.stockDisposition, 'restock_sellable');
  } finally {
    (globalThis as { window?: unknown }).window = prevWindow;
  }
});
