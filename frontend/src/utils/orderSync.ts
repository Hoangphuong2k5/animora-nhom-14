import type {
  CustomerOrder,
  ReturnRefundRequest,
  ShopOrderStatus,
} from '@/types/order.type';
import type { UserAccount } from '@/types/animora.type';
import { cleanBookingPhoneDigits } from '@/data/serviceBookingData';
import { safeGetStorage, safeSetStorage } from './cartLogic';
import { revertVoucherUsageInStorage } from './voucherSync';

export const ORDERS_STORAGE_KEY = 'animora_shop_orders_v2';
export const RETURNS_STORAGE_KEY = 'animora_shop_returns_v2';
export const ORDERS_SYNC_EVENT = 'animora_orders_sync';

export const SAMPLE_SHOP_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-1',
    orderCode: 'ORD-94821',
    userId: 'user-demo-owner',
    customerName: 'Phan Thị Đinh Thùy',
    phone: '0337203332',
    email: 'phanthidinhthuy6@gmail.com',
    shippingAddress: 'Toà S2.05 Vinhome Grand Park, TP. Thủ Đức',
    items: [
      {
        productId: 'prod-1',
        productName: 'Hạt Royal Canin Mini Adult (2kg)',
        quantity: 1,
        price: 340000,
      },
      {
        productId: 'prod-2',
        productName: 'Pate Monge Cá Hồi & Lê (100g)',
        quantity: 4,
        price: 35000,
      },
    ],
    totalAmount: 480000,
    paymentMethod: 'COD',
    status: 'shipping',
    createdAt: '2026-11-03 10:24',
  },
  {
    id: 'ord-2',
    orderCode: 'ORD-94822',
    customerName: 'Nguyễn Minh Anh',
    phone: '0901234567',
    email: 'minhanh@animora.vn',
    shippingAddress: '45 Lê Lợi, Phường Bến Nghé, Quận 1',
    items: [
      {
        productName: 'Cát vệ sinh Cature Đậu Nành Gỗ Nén (6L)',
        quantity: 2,
        price: 210000,
      },
      {
        productName: 'Lược Chải Lông Tự Động Bấm Nhả',
        quantity: 1,
        price: 150000,
      },
      {
        productName: 'Dầu tắm trị nấm Virbac Sebazole',
        quantity: 1,
        price: 320000,
      },
    ],
    totalAmount: 890000,
    paymentMethod: 'Banking',
    status: 'pending',
    createdAt: '2026-11-03 11:40',
  },
  {
    id: 'ord-3',
    orderCode: 'ORD-94819',
    userId: 'user-demo-owner',
    customerName: 'Phan Thị Đinh Thùy',
    phone: '0337203332',
    email: 'phanthidinhthuy6@gmail.com',
    shippingAddress: '128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
    items: [
      {
        productName: 'Xương Gặm Sạch Răng Orgo Vị Bò (90g)',
        quantity: 2,
        price: 85000,
      },
      {
        productName: 'Sữa Tắm Thảo Mộc TropiClean (355ml)',
        quantity: 1,
        price: 230000,
      },
    ],
    totalAmount: 400000,
    paymentMethod: 'COD',
    status: 'delivered',
    createdAt: '2026-11-02 15:10',
  },
];

export const SAMPLE_RETURN_REQUESTS: ReturnRefundRequest[] = [
  {
    id: 'ret-1',
    requestCode: 'RET-2026-001',
    orderCode: 'ORD-94815',
    customerName: 'Vũ Hải Đăng',
    phone: '0944112233',
    productName: 'Bao Hạt Purina Pro Plan Vị Cá Hồi 2.5kg',
    reason:
      'Bao bì bị rách góc trong quá trình đơn vị vận chuyển giao tới, hạt bị đổ ra ngoài.',
    refundAmount: 420000,
    status: 'pending',
    createdAt: '2026-11-03 09:15',
  },
  {
    id: 'ret-2',
    requestCode: 'RET-2026-002',
    orderCode: 'ORD-94808',
    customerName: 'Đinh Thúy Hà',
    phone: '0918889900',
    productName: 'Áo Len Mùa Đông Thú Cưng Size L',
    reason:
      'Nhầm size bé cưng (bé nặng 8kg mặc chật), muốn đổi sang size XL hoặc hoàn tiền.',
    refundAmount: 180000,
    status: 'pending',
    createdAt: '2026-11-02 16:30',
  },
];

function dispatchOrdersSync(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ORDERS_SYNC_EVENT));
  }
}

export function readOrdersFromStorage(): CustomerOrder[] {
  const saved = safeGetStorage<CustomerOrder[]>(ORDERS_STORAGE_KEY, []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  safeSetStorage(ORDERS_STORAGE_KEY, SAMPLE_SHOP_ORDERS);
  return SAMPLE_SHOP_ORDERS;
}

export function writeOrdersToStorage(orders: CustomerOrder[]): void {
  safeSetStorage(ORDERS_STORAGE_KEY, orders);
  dispatchOrdersSync();
}

export function createCustomerOrderInStorage(order: CustomerOrder): CustomerOrder[] {
  const existing = readOrdersFromStorage();
  const next = [order, ...existing.filter((o) => o.orderCode !== order.orderCode)];
  writeOrdersToStorage(next);
  return next;
}

export function updateOrderStatusInStorage(
  orderIdOrCode: string,
  nextStatus: ShopOrderStatus
): CustomerOrder[] {
  const existing = readOrdersFromStorage();
  const next = existing.map((o) =>
    o.id === orderIdOrCode || o.orderCode.toUpperCase() === orderIdOrCode.toUpperCase()
      ? { ...o, status: nextStatus }
      : o
  );
  writeOrdersToStorage(next);
  return next;
}

export function readReturnsFromStorage(): ReturnRefundRequest[] {
  const saved = safeGetStorage<ReturnRefundRequest[]>(RETURNS_STORAGE_KEY, []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  safeSetStorage(RETURNS_STORAGE_KEY, SAMPLE_RETURN_REQUESTS);
  return SAMPLE_RETURN_REQUESTS;
}

export function writeReturnsToStorage(returns: ReturnRefundRequest[]): void {
  safeSetStorage(RETURNS_STORAGE_KEY, returns);
  dispatchOrdersSync();
}

export function createReturnRefundRequest(
  payload: Omit<ReturnRefundRequest, 'id' | 'requestCode' | 'status' | 'createdAt'>
): ReturnRefundRequest {
  const created: ReturnRefundRequest = {
    ...payload,
    id: `ret-${Date.now()}`,
    requestCode: `RET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
  const existing = readReturnsFromStorage();
  writeReturnsToStorage([created, ...existing]);
  return created;
}

export function processReturnRefundRequestInStorage(
  returnId: string,
  nextStatus: 'approved' | 'rejected'
): { returns: ReturnRefundRequest[]; orders: CustomerOrder[] } {
  const existingReturns = readReturnsFromStorage();
  let targetOrderCode: string | null = null;
  const updatedReturns = existingReturns.map((r) => {
    if (r.id === returnId) {
      targetOrderCode = r.orderCode;
      return {
        ...r,
        status: nextStatus,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
    }
    return r;
  });
  safeSetStorage(RETURNS_STORAGE_KEY, updatedReturns);

  let updatedOrders = readOrdersFromStorage();
  if (nextStatus === 'approved' && targetOrderCode) {
    updatedOrders = updatedOrders.map((o) =>
      o.orderCode.toUpperCase() === targetOrderCode!.toUpperCase()
        ? { ...o, status: 'returned' }
        : o
    );
    safeSetStorage(ORDERS_STORAGE_KEY, updatedOrders);
    revertVoucherUsageInStorage(targetOrderCode);
  }

  dispatchOrdersSync();
  return { returns: updatedReturns, orders: updatedOrders };
}

export function doesOrderBelongToUser(
  order: CustomerOrder,
  user: UserAccount | null
): boolean {
  if (!user) return false;
  if (order.userId && order.userId === user.id) return true;
  const demoOwnerIds = new Set(['user-demo', 'user-demo-owner']);
  if (
    order.userId &&
    demoOwnerIds.has(order.userId) &&
    demoOwnerIds.has(user.id)
  ) {
    return true;
  }
  const ordPhone = cleanBookingPhoneDigits(order.phone || '');
  const userPhone = cleanBookingPhoneDigits(user.phone || '');
  if (ordPhone && userPhone && ordPhone === userPhone) return true;
  const ordEmail = (order.email || '').trim().toLowerCase();
  const userEmail = (user.email || '').trim().toLowerCase();
  if (ordEmail && userEmail && ordEmail === userEmail) return true;
  return false;
}

export function getOrderStatusLabel(
  status: ShopOrderStatus,
  lang: 'vi' | 'en'
): string {
  const map: Record<ShopOrderStatus, { vi: string; en: string }> = {
    pending: { vi: 'Chờ xác nhận', en: 'Pending confirmation' },
    packing: { vi: 'Đang đóng gói', en: 'Packing' },
    shipping: { vi: 'Đang giao hàng', en: 'Shipping' },
    delivered: { vi: 'Hoàn tất / Đã giao', en: 'Delivered' },
    returned: { vi: 'Đã đổi trả / Hoàn tiền', en: 'Returned / Refunded' },
  };
  return map[status]?.[lang] ?? status;
}
