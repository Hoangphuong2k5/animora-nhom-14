import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import { Language, PageId, UserAccount } from '@/types';
import type {
  CustomerOrder,
  ReturnRefundRequest,
  ReturnRequestType,
} from '@/types/order.type';
import {
  ORDERS_SYNC_EVENT,
  createReturnRefundRequest,
  doesOrderBelongToUser,
  getOrderStatusLabel,
  readOrdersFromStorage,
  readReturnsFromStorage,
  updateOrderStatusInStorage,
} from '@/utils/orderSync';
import { cleanBookingPhoneDigits } from '@/data/serviceBookingData';
import { formatVnd } from '@/utils/cartLogic';
import { OrderReturnPageView } from './OrderReturnPageView';

interface MyOrdersPageProps {
  lang: Language;
  currentUser: UserAccount | null;
  onNavigate: (page: PageId) => void;
  onShowToast: (text: string) => void;
}

type OrdersMainTab = 'orders' | 'returns';
type OrderStatusFilter = 'all' | 'pending' | 'in_progress' | 'delivered' | 'returned';

function parseMyOrdersRoute(): {
  isReturnRoute: boolean;
  orderCodeParam: string | null;
  activeTab: OrdersMainTab;
} {
  if (typeof window === 'undefined') {
    return { isReturnRoute: false, orderCodeParam: null, activeTab: 'orders' };
  }
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const isReturnRoute = path.startsWith('/don-hang/doi-tra');
  const orderCodeParam = params.get('order');
  const tabParam = params.get('tab');
  return {
    isReturnRoute,
    orderCodeParam,
    activeTab: tabParam === 'returns' ? 'returns' : 'orders',
  };
}

export const MyOrdersPage = ({
  lang,
  currentUser,
  onNavigate,
  onShowToast,
}: MyOrdersPageProps) => {
  const isVi = lang === 'vi';
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [returns, setReturns] = useState<ReturnRefundRequest[]>([]);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [verifiedGuestOrderCode, setVerifiedGuestOrderCode] = useState<string | null>(
    null
  );
  const [lookupError, setLookupError] = useState<string | null>(null);

  const initialRoute = parseMyOrdersRoute();
  const [activeTab, setActiveTab] = useState<OrdersMainTab>(initialRoute.activeTab);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [isReturnRoute, setIsReturnRoute] = useState<boolean>(initialRoute.isReturnRoute);
  const [returningOrder, setReturningOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    const syncData = () => {
      setOrders(readOrdersFromStorage());
      setReturns(readReturnsFromStorage());
    };
    syncData();
    window.addEventListener(ORDERS_SYNC_EVENT, syncData);
    window.addEventListener('storage', syncData);
    return () => {
      window.removeEventListener(ORDERS_SYNC_EVENT, syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  const visibleOrders = useMemo(() => {
    if (currentUser) {
      return orders.filter((o) => doesOrderBelongToUser(o, currentUser));
    }
    if (verifiedGuestOrderCode) {
      return orders.filter(
        (o) => o.orderCode.toUpperCase() === verifiedGuestOrderCode.toUpperCase()
      );
    }
    return [];
  }, [orders, currentUser, verifiedGuestOrderCode]);

  // Đồng bộ URL khi bấm Back/Forward trình duyệt hoặc truy cập trực tiếp /don-hang/doi-tra
  useEffect(() => {
    const syncRouteState = () => {
      const parsed = parseMyOrdersRoute();
      setIsReturnRoute(parsed.isReturnRoute);
      setActiveTab(parsed.activeTab);
      if (parsed.isReturnRoute) {
        const matched = parsed.orderCodeParam
          ? visibleOrders.find(
              (o) =>
                o.orderCode.toUpperCase() === parsed.orderCodeParam!.toUpperCase()
            )
          : visibleOrders.find((o) => o.status !== 'returned');
        setReturningOrder(matched || visibleOrders[0] || null);
      } else {
        setReturningOrder(null);
      }
    };

    syncRouteState();
    window.addEventListener('popstate', syncRouteState);
    return () => window.removeEventListener('popstate', syncRouteState);
  }, [visibleOrders]);

  const visibleReturns = useMemo(() => {
    const orderCodes = new Set(visibleOrders.map((o) => o.orderCode.toUpperCase()));
    return returns.filter((r) => {
      if (orderCodes.has(r.orderCode.toUpperCase())) return true;
      if (currentUser) {
        if (r.userId && r.userId === currentUser.id) return true;
        const rPhone = cleanBookingPhoneDigits(r.phone || '');
        const uPhone = cleanBookingPhoneDigits(currentUser.phone || '');
        if (rPhone && uPhone && rPhone === uPhone) return true;
      }
      return false;
    });
  }, [returns, visibleOrders, currentUser]);

  const eligibleOrdersForReturn = useMemo(() => {
    const requestedCodes = new Set(returns.map((r) => r.orderCode.toUpperCase()));
    const list = visibleOrders.filter(
      (o) =>
        o.status !== 'returned' && !requestedCodes.has(o.orderCode.toUpperCase())
    );
    return list.length > 0 ? list : visibleOrders;
  }, [visibleOrders, returns]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return visibleOrders;
    if (statusFilter === 'in_progress') {
      return visibleOrders.filter(
        (o) => o.status === 'packing' || o.status === 'shipping'
      );
    }
    return visibleOrders.filter((o) => o.status === statusFilter);
  }, [visibleOrders, statusFilter]);

  const openReturnPageForOrder = (order: CustomerOrder) => {
    const targetUrl = `/don-hang/doi-tra?order=${encodeURIComponent(order.orderCode)}`;
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setReturningOrder(order);
    setIsReturnRoute(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const closeReturnPage = (nextTab: OrdersMainTab = 'orders') => {
    const targetUrl = nextTab === 'returns' ? '/don-hang?tab=returns' : '/don-hang';
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', targetUrl);
    }
    setIsReturnRoute(false);
    setReturningOrder(null);
    setActiveTab(nextTab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handleSwitchMainTab = (tab: OrdersMainTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const targetUrl = tab === 'returns' ? '/don-hang?tab=returns' : '/don-hang';
      window.history.replaceState({}, '', targetUrl);
    }
  };

  const handleGuestLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const codeClean = lookupCode.trim().toUpperCase();
    const phoneClean = cleanBookingPhoneDigits(lookupPhone);
    const found = orders.find(
      (o) =>
        o.orderCode.toUpperCase() === codeClean &&
        cleanBookingPhoneDigits(o.phone) === phoneClean
    );
    if (!found) {
      setVerifiedGuestOrderCode(null);
      setLookupError(
        isVi
          ? 'Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại.'
          : 'No order matched that order code and phone number.'
      );
      return;
    }
    setVerifiedGuestOrderCode(found.orderCode);
  };

  const handleSubmitReturn = (payload: {
    order: CustomerOrder;
    productName: string;
    requestType: ReturnRequestType;
    reason: string;
    refundAmount: number;
  }) => {
    createReturnRefundRequest({
      orderCode: payload.order.orderCode,
      userId: currentUser?.id ?? null,
      customerName: payload.order.customerName,
      phone: payload.order.phone,
      productName: payload.productName,
      requestType: payload.requestType,
      reason: payload.reason,
      refundAmount: payload.refundAmount,
    });
    setReturns(readReturnsFromStorage());
    closeReturnPage('returns');
    onShowToast(
      isVi
        ? `Đã gửi yêu cầu đổi trả/hoàn hàng cho đơn ${payload.order.orderCode}!`
        : `Submitted return/refund request for ${payload.order.orderCode}!`
    );
  };

  const handleConfirmDelivered = (order: CustomerOrder) => {
    const nextOrders = updateOrderStatusInStorage(order.id, 'delivered');
    setOrders(nextOrders);
    onShowToast(
      isVi
        ? `Đã xác nhận nhận hàng thành công cho đơn ${order.orderCode}!`
        : `Confirmed delivery for order ${order.orderCode}!`
    );
  };

  const renderStatusIcon = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />;
      case 'packing':
        return <Package className="w-3.5 h-3.5" />;
      case 'shipping':
        return <Truck className="w-3.5 h-3.5" />;
      case 'delivered':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'returned':
        return <RotateCcw className="w-3.5 h-3.5" />;
    }
  };

  // CHẾ ĐỘ TRANG RIÊNG: /don-hang/doi-tra?order=...
  if (isReturnRoute && returningOrder) {
    return (
      <OrderReturnPageView
        order={returningOrder}
        eligibleOrders={eligibleOrdersForReturn}
        lang={lang}
        onSelectOrder={(nextOrd) => openReturnPageForOrder(nextOrd)}
        onBack={() => closeReturnPage('orders')}
        onSubmitReturn={handleSubmitReturn}
      />
    );
  }

  return (
    <div
      data-testid="page-my-orders"
      className="min-h-screen pt-24 sm:pt-28 pb-24 shared-container space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2.5 max-w-2xl">
          <span
            className="block uppercase font-bold"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--primary)',
            }}
          >
            {currentUser
              ? (isVi ? 'ĐƠN HÀNG THÀNH VIÊN' : 'MEMBER ORDERS')
              : (isVi ? 'TRA CỨU ĐƠN HÀNG' : 'ORDER LOOKUP')}
          </span>
          <h1
            data-testid="my-orders-title"
            className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: 'var(--primary)',
            }}
          >
            {currentUser
              ? (isVi ? 'Đơn hàng của tôi' : 'My orders')
              : (isVi ? 'Tra cứu đơn hàng' : 'Order tracking')}
          </h1>
          <p className="text-[18px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {currentUser
              ? (isVi
                  ? 'Theo dõi trạng thái giao hàng và gửi yêu cầu đổi trả / hoàn tiền.'
                  : 'Track delivery progress and manage return or refund requests.')
              : (isVi
                  ? 'Tra cứu nhanh tiến độ giao hàng bằng mã đơn và số điện thoại người nhận.'
                  : 'Track your package progress using order code and recipient phone number.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className="btn-primary min-h-[46px] px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isVi ? 'Tiếp tục mua sắm' : 'Continue shopping'}</span>
        </button>
      </header>

      {/* Thanh chuyển 2 Tab chính: Đơn hàng mua sắm vs Trung tâm Đổi trả & Hoàn tiền */}
      {visibleOrders.length > 0 && (
        <div
          className="flex flex-wrap items-center justify-between gap-4 border-b pb-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="inline-flex p-1 rounded-2xl border gap-1"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <button
              type="button"
              data-testid="tab-orders-list"
              onClick={() => handleSwitchMainTab('orders')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  activeTab === 'orders' ? 'var(--primary)' : 'transparent',
                color:
                  activeTab === 'orders' ? 'var(--on-primary)' : 'var(--text)',
              }}
            >
              <Package className="w-4 h-4" />
              <span>{isVi ? 'Đơn hàng mua sắm' : 'Orders'}</span>
              <span
                className="px-2 py-0.5 rounded-full text-[11px]"
                style={{
                  backgroundColor:
                    activeTab === 'orders'
                      ? 'rgba(255,255,255,0.2)'
                      : 'var(--surface-2)',
                  color:
                    activeTab === 'orders'
                      ? 'var(--on-primary)'
                      : 'var(--primary)',
                }}
              >
                {visibleOrders.length}
              </span>
            </button>

            <button
              type="button"
              data-testid="tab-returns-center"
              onClick={() => handleSwitchMainTab('returns')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  activeTab === 'returns' ? 'var(--primary)' : 'transparent',
                color:
                  activeTab === 'returns' ? 'var(--on-primary)' : 'var(--text)',
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isVi ? 'Đổi trả & Hoàn tiền' : 'Returns & Refunds'}</span>
              <span
                className="px-2 py-0.5 rounded-full text-[11px]"
                style={{
                  backgroundColor:
                    activeTab === 'returns'
                      ? 'rgba(255,255,255,0.2)'
                      : 'var(--surface-2)',
                  color:
                    activeTab === 'returns'
                      ? 'var(--on-primary)'
                      : 'var(--primary)',
                }}
              >
                {visibleReturns.length}
              </span>
            </button>
          </div>

          {/* Bộ lọc trạng thái đơn hàng khi đang ở Tab Đơn hàng */}
          {activeTab === 'orders' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', vi: 'Tất cả', en: 'All' },
                  { id: 'pending', vi: 'Chờ xác nhận', en: 'Pending' },
                  { id: 'in_progress', vi: 'Đang giao', en: 'Shipping' },
                  { id: 'delivered', vi: 'Đã giao', en: 'Delivered' },
                  { id: 'returned', vi: 'Đã đổi trả', en: 'Returned' },
                ] as const
              ).map((flt) => {
                const active = statusFilter === flt.id;
                return (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setStatusFilter(flt.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--surface-2)' : 'var(--surface)',
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                      color: active ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >
                    {isVi ? flt.vi : flt.en}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!currentUser && (
        <form
          onSubmit={handleGuestLookup}
          className="max-w-xl rounded-[24px] border p-6 space-y-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <h2 className="font-heading text-lg font-extrabold" style={{ color: 'var(--primary)' }}>
            {isVi ? 'Tra cứu đơn hàng nhanh' : 'Look up your order'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder={isVi ? 'Mã đơn (vd: ORD-94821)' : 'Order code'}
              className="form-input text-sm"
              required
            />
            <input
              type="tel"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
              placeholder={isVi ? 'Số điện thoại đặt hàng' : 'Phone number'}
              className="form-input text-sm"
              required
            />
          </div>
          {lookupError && <p className="text-xs font-bold text-rose-600">{lookupError}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isVi ? 'Tra cứu' : 'Look up'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="btn-secondary px-5 py-2.5 text-xs font-bold cursor-pointer"
            >
              {isVi ? 'Đăng nhập xem tất cả đơn' : 'Sign in to view all'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 1: DANH SÁCH ĐƠN HÀNG MUA SẮM */}
      {activeTab === 'orders' && (
        <>
          {visibleOrders.length === 0 ? (
            currentUser ? (
              <div
                className="rounded-[24px] border p-10 text-center space-y-4 max-w-2xl mx-auto"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <Package className="w-10 h-10 mx-auto" style={{ color: 'var(--primary)' }} />
                <h2 className="font-heading text-xl font-bold" style={{ color: 'var(--primary)' }}>
                  {isVi ? 'Bạn chưa có đơn hàng nào' : 'You have no orders yet'}
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="btn-primary px-6 py-2.5 text-sm font-bold cursor-pointer"
                >
                  {isVi ? 'Khám phá Cửa hàng' : 'Browse Shop'}
                </button>
              </div>
            ) : null
          ) : filteredOrders.length === 0 ? (
            <div
              className="rounded-[24px] border p-8 text-center space-y-3"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                {isVi
                  ? 'Không có đơn hàng nào ở trạng thái này.'
                  : 'No orders match this status filter.'}
              </p>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                {isVi ? 'Xem tất cả đơn hàng' : 'View all orders'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const linkedReturn = returns.find(
                  (r) => r.orderCode.toUpperCase() === order.orderCode.toUpperCase()
                );
                return (
                  <article
                    key={order.id}
                    data-testid={`customer-order-card-${order.orderCode}`}
                    className="rounded-[20px] border p-5 sm:p-6 space-y-4"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow)',
                    }}
                  >
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 border-b pb-3"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div>
                        <span
                          className="font-heading text-lg font-extrabold"
                          style={{ color: 'var(--primary)' }}
                        >
                          {order.orderCode}
                        </span>
                        <span
                          className="block text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {order.createdAt} · {order.paymentMethod}
                        </span>
                      </div>

                      <span
                        data-testid={`order-status-badge-${order.orderCode}`}
                        className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          borderColor: 'var(--border)',
                          color: 'var(--primary)',
                        }}
                      >
                        {renderStatusIcon(order.status)}
                        <span>{getOrderStatusLabel(order.status, lang)}</span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${order.id}-item-${idx}`}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span style={{ color: 'var(--text)' }}>
                            {item.productName}{' '}
                            {item.selectedSpec ? `(${item.selectedSpec})` : ''} ×{' '}
                            {item.quantity}
                          </span>
                          <span
                            className="font-bold tabular-nums"
                            style={{ color: 'var(--text)' }}
                          >
                            {formatVnd(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className="pt-3 border-t flex flex-wrap items-center justify-between gap-3"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                        <div>
                          {isVi ? 'Giao tới: ' : 'Ship to: '}
                          <strong style={{ color: 'var(--text)' }}>
                            {order.shippingAddress}
                          </strong>
                        </div>
                        {order.couponCode && (
                          <div className="font-semibold" style={{ color: 'var(--primary)' }}>
                            {isVi ? 'Voucher áp dụng: ' : 'Voucher applied: '}
                            <span className="font-mono font-extrabold">{order.couponCode}</span>
                            {typeof order.discountAmount === 'number' && order.discountAmount > 0
                              ? ` (-${formatVnd(order.discountAmount)})`
                              : ''}
                          </div>
                        )}
                      </div>
                      <div
                        className="text-base font-extrabold"
                        style={{ color: 'var(--primary)' }}
                      >
                        {isVi ? 'Tổng cộng: ' : 'Total: '}
                        {formatVnd(order.totalAmount)}
                      </div>
                    </div>

                    {/* Thanh tiến trình 4 bước */}
                    {order.status !== 'returned' && (
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {[
                          { id: 'pending', vi: '1. Chờ xác nhận', en: '1. Pending' },
                          { id: 'packing', vi: '2. Đóng gói', en: '2. Packing' },
                          { id: 'shipping', vi: '3. Đang giao', en: '3. Shipping' },
                          { id: 'delivered', vi: '4. Đã giao', en: '4. Delivered' },
                        ].map((st, idx) => {
                          const steps = ['pending', 'packing', 'shipping', 'delivered'];
                          const currentIdx = steps.indexOf(order.status);
                          const isCurrent = order.status === st.id;
                          const isDone = currentIdx >= idx;
                          return (
                            <div
                              key={st.id}
                              className="py-1.5 px-2 rounded-xl text-center text-[11px] font-bold border transition-colors"
                              style={{
                                backgroundColor: isCurrent
                                  ? 'var(--primary)'
                                  : isDone
                                  ? 'var(--surface-2)'
                                  : 'var(--bg)',
                                borderColor:
                                  isCurrent || isDone
                                    ? 'var(--primary)'
                                    : 'var(--border)',
                                color: isCurrent
                                  ? 'var(--on-primary)'
                                  : isDone
                                  ? 'var(--primary)'
                                  : 'var(--text-muted)',
                              }}
                            >
                              {isVi ? st.vi : st.en}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {linkedReturn ? (
                      <div
                        data-testid={`order-return-status-${order.orderCode}`}
                        className="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div>
                          <span
                            className="font-extrabold"
                            style={{ color: 'var(--primary)' }}
                          >
                            {isVi
                              ? `Yêu cầu đổi trả ${linkedReturn.requestCode}: `
                              : `Return ${linkedReturn.requestCode}: `}
                          </span>
                          <span style={{ color: 'var(--text)' }}>
                            {linkedReturn.reason}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                            linkedReturn.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : linkedReturn.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {linkedReturn.status === 'approved' && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {linkedReturn.status === 'rejected' && (
                            <XCircle className="w-3 h-3" />
                          )}
                          {linkedReturn.status === 'pending' && (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>
                            {linkedReturn.status === 'approved'
                              ? isVi
                                ? `Đã hoàn ${formatVnd(linkedReturn.refundAmount)}`
                                : `Refunded ${formatVnd(linkedReturn.refundAmount)}`
                              : linkedReturn.status === 'rejected'
                              ? isVi
                                ? 'Từ chối đổi trả'
                                : 'Rejected'
                              : isVi
                              ? 'Đang chờ xử lý đổi trả / hoàn tiền'
                              : 'Pending return/refund review'}
                          </span>
                        </span>
                      </div>
                    ) : (
                      order.status !== 'returned' && (
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {order.status === 'delivered'
                              ? isVi
                                ? 'Đơn hàng đã giao thành công. Bạn có thể yêu cầu đổi trả hoặc hoàn tiền trong 7 ngày.'
                                : 'Order delivered. You can request a return or refund within 7 days.'
                              : isVi
                              ? 'Bạn có thể xác nhận khi đã nhận hàng hoặc chuyển sang trang gửi yêu cầu đổi trả / hoàn hàng.'
                              : 'Confirm delivery once received or open the return/refund request page.'}
                          </span>

                          <div className="flex flex-wrap items-center gap-2.5 ml-auto">
                            {order.status !== 'delivered' && (
                              <button
                                type="button"
                                data-testid={`confirm-received-btn-${order.orderCode}`}
                                onClick={() => handleConfirmDelivered(order)}
                                className="btn-secondary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {isVi ? 'Đã nhận được hàng' : 'Confirm received'}
                                </span>
                              </button>
                            )}

                            <button
                              type="button"
                              data-testid={`request-return-btn-${order.orderCode}`}
                              onClick={() => openReturnPageForOrder(order)}
                              className="btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>
                                {isVi ? 'Đổi trả / Hoàn hàng' : 'Return / Refund'}
                              </span>
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: TRUNG TÂM ĐỔI TRẢ & HOÀN TIỀN */}
      {activeTab === 'returns' && (
        <section data-testid="returns-center-section" className="space-y-4">
          {visibleReturns.length === 0 ? (
            <div
              className="rounded-[24px] border p-10 text-center space-y-3 max-w-2xl mx-auto"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <RotateCcw
                className="w-9 h-9 mx-auto"
                style={{ color: 'var(--primary)' }}
              />
              <h3
                className="font-heading text-lg font-extrabold"
                style={{ color: 'var(--primary)' }}
              >
                {isVi
                  ? 'Chưa có yêu cầu đổi trả hoặc hoàn tiền nào'
                  : 'No return or refund requests yet'}
              </h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {isVi
                  ? 'Để gửi yêu cầu đổi trả hoặc hoàn tiền, hãy chọn đơn hàng tương ứng trong tab "Đơn hàng mua sắm" và bấm "Đổi trả / Hoàn hàng".'
                  : 'To submit a return or refund request, select your order in the "Orders" tab and click "Return / Refund".'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMainTab('orders')}
                  className="btn-secondary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>
                    {isVi ? 'Chọn đơn hàng mua sắm' : 'View my orders'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleReturns.map((ret) => (
                <div
                  key={ret.id}
                  data-testid={`return-request-card-${ret.requestCode}`}
                  className="p-5 rounded-[22px] border space-y-3 text-xs"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <span
                        className="font-heading text-sm font-extrabold block"
                        style={{ color: 'var(--primary)' }}
                      >
                        {ret.requestCode} · {isVi ? 'Đơn' : 'Order'} {ret.orderCode}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {ret.createdAt}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                        ret.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : ret.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ret.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {ret.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {ret.status === 'pending' && <Clock className="w-3 h-3" />}
                      <span>
                        {ret.status === 'approved'
                          ? isVi
                            ? 'Đã duyệt hoàn tiền'
                            : 'Approved & Refunded'
                          : ret.status === 'rejected'
                          ? isVi
                            ? 'Từ chối đổi trả'
                            : 'Rejected'
                          : isVi
                          ? 'Đang chờ xét duyệt'
                          : 'Pending review'}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {isVi ? 'Sản phẩm đổi trả:' : 'Returned item(s):'}
                    </span>
                    <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                      {ret.productName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {isVi ? 'Lý do & Hình thức:' : 'Reason & Method:'}
                    </span>
                    <p className="leading-relaxed" style={{ color: 'var(--text)' }}>
                      {ret.reason}
                    </p>
                  </div>

                  <div
                    className="pt-2.5 border-t flex items-center justify-between"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>
                      {isVi ? 'Giá trị hoàn / đổi trả:' : 'Refund / Exchange amount:'}
                    </span>
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: 'var(--primary)' }}
                    >
                      {formatVnd(ret.refundAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
