import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Language } from '@/types';
import type { CustomerOrder, ReturnRequestType } from '@/types/order.type';
import { formatVnd } from '@/utils/cartLogic';
import { getOrderStatusLabel } from '@/utils/orderSync';

interface OrderReturnPageViewProps {
  order: CustomerOrder;
  eligibleOrders: CustomerOrder[];
  lang: Language;
  onSelectOrder: (order: CustomerOrder) => void;
  onBack: () => void;
  onSubmitReturn: (payload: {
    order: CustomerOrder;
    productName: string;
    requestType: ReturnRequestType;
    reason: string;
    refundAmount: number;
  }) => void;
}

const RETURN_REASONS_VI = [
  'Sản phẩm bị lỗi / hư hỏng khi vận chuyển',
  'Giao sai sản phẩm / sai quy cách',
  'Thú cưng không phù hợp / nhầm kích cỡ',
  'Đổi ý / Muốn hủy hoặc đổi sang sản phẩm khác',
  'Hạn sử dụng cận ngày / Bao bì bị hở',
  'Khác',
];

const RETURN_REASONS_EN = [
  'Damaged or defective item during delivery',
  'Wrong product or package size delivered',
  'Wrong size / not suitable for pet',
  'Changed mind / Want to cancel or exchange',
  'Near expiration date / Unsealed packaging',
  'Other',
];

export const OrderReturnPageView = ({
  order,
  eligibleOrders,
  lang,
  onSelectOrder,
  onBack,
  onSubmitReturn,
}: OrderReturnPageViewProps) => {
  const isVi = lang === 'vi';
  const [requestType, setRequestType] = useState<ReturnRequestType>('return_refund');
  const [selectedProductIdx, setSelectedProductIdx] = useState<number>(-1);
  const [reasonPreset, setReasonPreset] = useState('');
  const [refundMethod, setRefundMethod] = useState<'bank' | 'wallet' | 'pickup'>('bank');
  const [reasonNote, setReasonNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isAllItems = selectedProductIdx === -1 || order.items.length <= 1;
  const targetItem =
    selectedProductIdx >= 0 ? order.items[selectedProductIdx] : null;
  const maxRefund =
    !isAllItems && targetItem
      ? targetItem.price * targetItem.quantity
      : order.totalAmount;

  const selectedProductSummary =
    !isAllItems && targetItem
      ? `${targetItem.productName} (x${targetItem.quantity})`
      : order.items
          .map((it) => `${it.productName} (x${it.quantity})`)
          .join(', ') || order.orderCode;

  const getMethodLabel = () => {
    if (requestType === 'exchange') {
      return isVi
        ? 'Shipper Animora giao sản phẩm mới & thu hồi tận nơi'
        : 'Courier exchange pickup at shipping address';
    }
    if (refundMethod === 'wallet') {
      return isVi
        ? 'Hoàn vào Ví Animora (Nhận ngay sau khi duyệt)'
        : 'Animora Wallet (Instant upon approval)';
    }
    return isVi
      ? 'Chuyển khoản Ngân hàng (Trong 24h làm việc)'
      : 'Bank Transfer (Within 24 business hours)';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedReason = [reasonPreset, reasonNote.trim()]
      .filter(Boolean)
      .join(' — ');
    if (!combinedReason) {
      setError(
        isVi
          ? 'Vui lòng chọn hoặc nhập lý do đổi trả / hoàn hàng.'
          : 'Please select or enter a return/refund reason.'
      );
      return;
    }

    const typePrefix =
      requestType === 'exchange'
        ? isVi
          ? '[Đổi trả sản phẩm]'
          : '[Exchange]'
        : isVi
        ? '[Hoàn hàng / Hoàn tiền]'
        : '[Return & Refund]';

    const methodSuffix = `(${getMethodLabel()})`;

    onSubmitReturn({
      order,
      productName: selectedProductSummary,
      requestType,
      reason: `${typePrefix} ${combinedReason} ${methodSuffix}`,
      refundAmount: Math.min(maxRefund, order.totalAmount),
    });
  };

  return (
    <div
      data-testid="page-order-return"
      className="min-h-screen pt-24 sm:pt-28 pb-24 shared-container space-y-7"
    >
      {/* Nút điều hướng quay lại */}
      <div>
        <button
          type="button"
          data-testid="return-page-back-btn"
          onClick={onBack}
          className="min-h-[42px] px-4 py-2 rounded-full border text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-transform hover:-translate-x-0.5"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--primary)',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isVi ? 'Quay lại Đơn hàng của tôi' : 'Back to My orders'}</span>
        </button>
      </div>

      {/* Tiêu đề trang */}
      <header className="space-y-2 max-w-2xl">
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
          {isVi ? 'TRUNG TÂM ĐỔI TRẢ & HOÀN TIỀN' : 'RETURN & REFUND CENTER'}
        </span>
        <h1
          className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
          style={{
            fontSize: 'clamp(28px, 3.6vw, 42px)',
            color: 'var(--primary)',
          }}
        >
          {isVi ? 'Gửi yêu cầu Đổi trả / Hoàn hàng' : 'Request Return or Exchange'}
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {isVi
            ? 'Chọn sản phẩm, hình thức hỗ trợ và lý do để đội ngũ Animora xử lý nhanh nhất cho bạn.'
            : 'Select items, support preference, and reason so the Animora team can assist you promptly.'}
        </p>
      </header>

      {/* Bố cục 2 cột: Cột trái Biểu mẫu - Cột phải Tóm tắt cố định */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start"
      >
        {/* CỘT TRÁI (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bước 1: Đơn hàng áp dụng */}
          <section
            className="rounded-[24px] border p-5 sm:p-6 space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                className="font-heading text-lg font-extrabold flex items-center gap-2"
                style={{ color: 'var(--primary)' }}
              >
                <Package className="w-5 h-5" />
                <span>{isVi ? '1. Đơn hàng cần hỗ trợ' : '1. Selected Order'}</span>
              </h2>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                }}
              >
                {getOrderStatusLabel(order.status, lang)}
              </span>
            </div>

            {eligibleOrders.length > 1 && (
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {isVi ? 'Chuyển sang đơn hàng khác:' : 'Switch order:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {eligibleOrders.map((ord) => {
                    const active = ord.orderCode === order.orderCode;
                    return (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => {
                          onSelectOrder(ord);
                          setSelectedProductIdx(-1);
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors"
                        style={{
                          backgroundColor: active ? 'var(--primary)' : 'var(--bg)',
                          color: active ? 'var(--on-primary)' : 'var(--text)',
                          borderColor: active ? 'var(--primary)' : 'var(--border)',
                        }}
                      >
                        {ord.orderCode} ({formatVnd(ord.totalAmount)})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="space-y-1">
                <div className="text-sm font-extrabold" style={{ color: 'var(--primary)' }}>
                  {order.orderCode} · {order.paymentMethod}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {isVi ? 'Ngày đặt: ' : 'Placed on: '}
                  {order.createdAt}
                </div>
                <div className="flex items-center gap-1" style={{ color: 'var(--text)' }}>
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                  <span>
                    {isVi ? 'Địa chỉ: ' : 'Address: '}
                    <strong>{order.shippingAddress}</strong>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {isVi ? 'Giá trị đơn hàng' : 'Order total'}
                </span>
                <span className="text-base font-extrabold" style={{ color: 'var(--primary)' }}>
                  {formatVnd(order.totalAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Bước 2: Hình thức hỗ trợ */}
          <section
            className="rounded-[24px] border p-5 sm:p-6 space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <h2
              className="font-heading text-lg font-extrabold flex items-center gap-2"
              style={{ color: 'var(--primary)' }}
            >
              <RotateCcw className="w-5 h-5" />
              <span>{isVi ? '2. Chọn hình thức hỗ trợ *' : '2. Choose Support Type *'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                data-testid="return-type-refund"
                onClick={() => setRequestType('return_refund')}
                className="p-4 rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all"
                style={{
                  backgroundColor:
                    requestType === 'return_refund' ? 'var(--surface-2)' : 'var(--bg)',
                  borderColor:
                    requestType === 'return_refund' ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor:
                      requestType === 'return_refund' ? 'var(--primary)' : 'var(--surface)',
                    color:
                      requestType === 'return_refund'
                        ? 'var(--on-primary)'
                        : 'var(--primary)',
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-extrabold" style={{ color: 'var(--primary)' }}>
                    {isVi ? 'Hoàn hàng & Hoàn tiền' : 'Return & Refund'}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {isVi
                      ? 'Trả lại sản phẩm (hoặc hủy đơn) và nhận lại 100% giá trị tiền hoàn.'
                      : 'Return items and receive a full refund to your bank or wallet.'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                data-testid="return-type-exchange"
                onClick={() => setRequestType('exchange')}
                className="p-4 rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all"
                style={{
                  backgroundColor:
                    requestType === 'exchange' ? 'var(--surface-2)' : 'var(--bg)',
                  borderColor:
                    requestType === 'exchange' ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor:
                      requestType === 'exchange' ? 'var(--primary)' : 'var(--surface)',
                    color:
                      requestType === 'exchange' ? 'var(--on-primary)' : 'var(--primary)',
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-extrabold" style={{ color: 'var(--primary)' }}>
                    {isVi ? 'Đổi trả sản phẩm mới' : 'Exchange Product'}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {isVi
                      ? 'Đổi sang sản phẩm mới nguyên vẹn hoặc đổi kích cỡ / quy cách phù hợp cho bé.'
                      : 'Exchange for a replacement product or different package size.'}
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* Bước 3: Chọn sản phẩm cần đổi trả */}
          <section
            className="rounded-[24px] border p-5 sm:p-6 space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <h2
              className="font-heading text-lg font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {isVi
                ? '3. Chọn sản phẩm trong đơn cần đổi trả / hoàn hàng'
                : '3. Select Item(s) from Order'}
            </h2>

            <div className="space-y-2.5">
              {order.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedProductIdx(-1)}
                  className="w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  style={{
                    backgroundColor:
                      selectedProductIdx === -1 ? 'var(--surface-2)' : 'var(--bg)',
                    borderColor:
                      selectedProductIdx === -1 ? 'var(--primary)' : 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0"
                      style={{
                        color:
                          selectedProductIdx === -1
                            ? 'var(--primary)'
                            : 'var(--text-muted)',
                      }}
                    />
                    <span>
                      {isVi
                        ? `Toàn bộ đơn hàng (${order.items.length} sản phẩm)`
                        : `Entire order (${order.items.length} items)`}
                    </span>
                  </div>
                  <span className="font-extrabold" style={{ color: 'var(--primary)' }}>
                    {formatVnd(order.totalAmount)}
                  </span>
                </button>
              )}

              {order.items.map((item, idx) => {
                const active =
                  order.items.length === 1 ? true : idx === selectedProductIdx;
                return (
                  <button
                    key={`${item.productName}-${idx}`}
                    type="button"
                    onClick={() => setSelectedProductIdx(idx)}
                    className="w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--surface-2)' : 'var(--bg)',
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0"
                        style={{
                          color: active ? 'var(--primary)' : 'var(--text-muted)',
                        }}
                      />
                      <span>
                        {item.productName}{' '}
                        {item.selectedSpec ? `(${item.selectedSpec})` : ''} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-extrabold" style={{ color: 'var(--primary)' }}>
                      {formatVnd(item.price * item.quantity)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Bước 4: Lý do & Mô tả chi tiết */}
          <section
            className="rounded-[24px] border p-5 sm:p-6 space-y-5"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <h2
              className="font-heading text-lg font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {isVi
                ? '4. Lý do & Phương thức xử lý *'
                : '4. Reason & Processing Method *'}
            </h2>

            <div className="space-y-2">
              <span className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
                {isVi ? 'Chọn nhanh lý do đổi trả / hoàn hàng *' : 'Select reason *'}
              </span>
              <div className="flex flex-wrap gap-2">
                {(isVi ? RETURN_REASONS_VI : RETURN_REASONS_EN).map((opt) => {
                  const active = reasonPreset === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setReasonPreset(opt);
                        if (error) setError(null);
                      }}
                      className="px-3.5 py-2 rounded-full text-xs font-bold border cursor-pointer transition-colors"
                      style={{
                        backgroundColor: active ? 'var(--primary)' : 'var(--bg)',
                        color: active ? 'var(--on-primary)' : 'var(--text)',
                        borderColor: active ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {requestType === 'return_refund' && (
              <div className="space-y-2">
                <span className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
                  {isVi ? 'Phương thức nhận tiền hoàn' : 'Refund destination'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRefundMethod('bank')}
                    className="p-3 rounded-xl border text-left text-xs font-bold cursor-pointer"
                    style={{
                      backgroundColor:
                        refundMethod === 'bank' ? 'var(--surface-2)' : 'var(--bg)',
                      borderColor:
                        refundMethod === 'bank' ? 'var(--primary)' : 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <div className="font-extrabold" style={{ color: 'var(--primary)' }}>
                      {isVi ? 'Chuyển khoản Ngân hàng' : 'Bank Transfer'}
                    </div>
                    <div className="text-[11px] font-normal mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {isVi ? 'Hoàn về STK ngân hàng trong 24h' : 'Refund to bank within 24h'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRefundMethod('wallet')}
                    className="p-3 rounded-xl border text-left text-xs font-bold cursor-pointer"
                    style={{
                      backgroundColor:
                        refundMethod === 'wallet' ? 'var(--surface-2)' : 'var(--bg)',
                      borderColor:
                        refundMethod === 'wallet' ? 'var(--primary)' : 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <div className="font-extrabold" style={{ color: 'var(--primary)' }}>
                      {isVi ? 'Ví chăm sóc Animora' : 'Animora Care Wallet'}
                    </div>
                    <div className="text-[11px] font-normal mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {isVi ? 'Nhận ngay lập tức sau khi duyệt' : 'Instant credit upon approval'}
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
                {isVi
                  ? 'Mô tả chi tiết tình trạng / Số tài khoản nhận hoàn tiền'
                  : 'Additional details / Refund account note'}
              </label>
              <textarea
                rows={4}
                data-testid="return-reason-textarea"
                value={reasonNote}
                onChange={(e) => {
                  setReasonNote(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={
                  isVi
                    ? 'Mô tả tình trạng bao bì, quy cách muốn đổi hoặc nhập Số tài khoản + Ngân hàng nhận tiền hoàn...'
                    : 'Describe item condition, desired exchange size, or bank account details...'
                }
                className="form-input w-full text-sm resize-none"
              />
              {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
            </div>
          </section>
        </div>

        {/* CỘT PHẢI: SIDEBAR TÓM TẮT CỐ ĐỊNH (5/12) */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-5">
          <div
            className="rounded-[24px] border p-6 space-y-5"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <h3
              className="font-heading text-lg font-extrabold border-b pb-3"
              style={{ color: 'var(--primary)', borderColor: 'var(--border)' }}
            >
              {isVi ? 'Tóm tắt yêu cầu của bạn' : 'Request Summary'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <span style={{ color: 'var(--text-muted)' }}>
                  {isVi ? 'Mã đơn hàng:' : 'Order code:'}
                </span>
                <span className="font-extrabold" style={{ color: 'var(--primary)' }}>
                  {order.orderCode}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span style={{ color: 'var(--text-muted)' }}>
                  {isVi ? 'Hình thức hỗ trợ:' : 'Support type:'}
                </span>
                <span className="font-bold text-right" style={{ color: 'var(--text)' }}>
                  {requestType === 'exchange'
                    ? isVi
                      ? 'Đổi trả sản phẩm mới'
                      : 'Exchange Product'
                    : isVi
                    ? 'Hoàn hàng & Hoàn tiền'
                    : 'Return & Refund'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span style={{ color: 'var(--text-muted)' }}>
                  {isVi ? 'Sản phẩm áp dụng:' : 'Selected item(s):'}
                </span>
                <span className="font-bold text-right max-w-[220px]" style={{ color: 'var(--text)' }}>
                  {selectedProductSummary}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span style={{ color: 'var(--text-muted)' }}>
                  {isVi ? 'Phương thức xử lý:' : 'Method:'}
                </span>
                <span className="font-semibold text-right max-w-[220px]" style={{ color: 'var(--text)' }}>
                  {getMethodLabel()}
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                {requestType === 'exchange'
                  ? isVi
                    ? 'Giá trị đổi trả:'
                    : 'Exchange value:'
                  : isVi
                  ? 'Số tiền hoàn dự kiến:'
                  : 'Estimated refund:'}
              </span>
              <span
                className="font-heading text-xl font-extrabold"
                style={{ color: 'var(--primary)' }}
              >
                {formatVnd(Math.min(maxRefund, order.totalAmount))}
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="submit"
                data-testid="submit-return-refund-btn"
                className="btn-primary w-full min-h-[48px] px-6 py-3 text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {requestType === 'exchange'
                    ? isVi
                      ? 'Gửi yêu cầu đổi trả sản phẩm'
                      : 'Submit Exchange Request'
                    : isVi
                    ? 'Gửi yêu cầu hoàn hàng / hoàn tiền'
                    : 'Submit Return & Refund Request'}
                </span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="btn-secondary w-full min-h-[44px] px-5 py-2.5 text-xs font-bold cursor-pointer"
              >
                {isVi ? 'Hủy & Quay lại đơn hàng' : 'Cancel & Go back'}
              </button>
            </div>
          </div>

          {/* Chính sách bảo vệ người mua Animora */}
          <div
            className="rounded-[24px] border p-5 space-y-3 text-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-2 font-extrabold text-sm" style={{ color: 'var(--primary)' }}>
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isVi
                  ? 'Cam kết Đổi trả 7 ngày Animora'
                  : 'Animora 7-Day Return Guarantee'}
              </span>
            </div>
            <ul className="space-y-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-start gap-2">
                <Truck className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <span>
                  {isVi
                    ? 'Miễn 100% phí vận chuyển thu hồi nếu sản phẩm bị lỗi, rách bao bì hoặc giao sai quy cách.'
                    : '100% free return shipping for damaged or wrong items.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <span>
                  {isVi
                    ? 'Quản lý Cửa hàng xét duyệt yêu cầu trong 2–4 giờ làm việc và hoàn tiền trong 24h.'
                    : 'Store manager reviews requests within 2–4 hours; refunds processed within 24h.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <span>
                  {isVi
                    ? 'Theo dõi trực tiếp tiến độ xét duyệt tại tab "Đổi trả & Hoàn tiền".'
                    : 'Track approval status live in the Return & Refund tab.'}
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
};

