import React, { useState } from 'react';
import { RefreshCw, RotateCcw, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Language } from '@/types';
import type { CustomerOrder, ReturnRequestType } from '@/types/order.type';
import { formatVnd } from '@/utils/cartLogic';

interface ReturnRefundDialogProps {
  order: CustomerOrder | null;
  lang: Language;
  onClose: () => void;
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
  'Khác',
];

const RETURN_REASONS_EN = [
  'Damaged or defective item during delivery',
  'Wrong product or package size delivered',
  'Wrong size / not suitable for pet',
  'Changed mind / Want to cancel or exchange',
  'Other',
];

export const ReturnRefundDialog = ({
  order,
  lang,
  onClose,
  onSubmitReturn,
}: ReturnRefundDialogProps) => {
  const isVi = lang === 'vi';
  const [requestType, setRequestType] = useState<ReturnRequestType>('return_refund');
  const [selectedProductIdx, setSelectedProductIdx] = useState<number>(-1);
  const [reasonPreset, setReasonPreset] = useState('');
  const [reasonNote, setReasonNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  const isAllItems = selectedProductIdx === -1 || order.items.length <= 1;
  const targetItem =
    selectedProductIdx >= 0 ? order.items[selectedProductIdx] : null;
  const maxRefund =
    !isAllItems && targetItem
      ? targetItem.price * targetItem.quantity
      : order.totalAmount;

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

    const productSummary =
      !isAllItems && targetItem
        ? `${targetItem.productName} (x${targetItem.quantity})`
        : order.items
            .map((it) => `${it.productName} (x${it.quantity})`)
            .join(', ') || order.orderCode;

    onSubmitReturn({
      order,
      productName: productSummary,
      requestType,
      reason: `${typePrefix} ${combinedReason}`,
      refundAmount: Math.min(maxRefund, order.totalAmount),
    });
    setReasonPreset('');
    setReasonNote('');
    setSelectedProductIdx(-1);
    setError(null);
  };

  return (
    <Dialog
      open={Boolean(order)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        data-testid="return-refund-dialog"
        className="sm:max-w-lg rounded-[24px] border p-6 sm:p-7 gap-5 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <DialogTitle
              className="font-heading text-xl font-extrabold flex items-center gap-2"
              style={{ color: 'var(--primary)' }}
            >
              <RotateCcw className="w-5 h-5" />
              <span>
                {isVi
                  ? 'Yêu cầu Đổi trả / Hoàn hàng'
                  : 'Request Return / Refund'}
              </span>
            </DialogTitle>
            <DialogDescription
              className="text-xs font-semibold mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {order.orderCode} · {formatVnd(order.totalAmount)}
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isVi ? 'Đóng' : 'Close'}
            className="min-h-[40px] min-w-[40px] rounded-full border flex items-center justify-center shrink-0 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hình thức: Hoàn hàng hoàn tiền vs Đổi trả sản phẩm */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
              {isVi ? 'Hình thức hỗ trợ *' : 'Support type *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="return-type-refund"
                onClick={() => setRequestType('return_refund')}
                className="p-3 rounded-xl border text-left text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
                style={{
                  backgroundColor:
                    requestType === 'return_refund' ? 'var(--surface-2)' : 'var(--bg)',
                  borderColor:
                    requestType === 'return_refund' ? 'var(--primary)' : 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <RotateCcw
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--primary)' }}
                />
                <div>
                  <div className="font-extrabold" style={{ color: 'var(--primary)' }}>
                    {isVi ? 'Hoàn hàng & Hoàn tiền' : 'Return & Refund'}
                  </div>
                  <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {isVi ? 'Trả lại hàng và nhận tiền hoàn' : 'Return items for a refund'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                data-testid="return-type-exchange"
                onClick={() => setRequestType('exchange')}
                className="p-3 rounded-xl border text-left text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
                style={{
                  backgroundColor:
                    requestType === 'exchange' ? 'var(--surface-2)' : 'var(--bg)',
                  borderColor:
                    requestType === 'exchange' ? 'var(--primary)' : 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <RefreshCw
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--primary)' }}
                />
                <div>
                  <div className="font-extrabold" style={{ color: 'var(--primary)' }}>
                    {isVi ? 'Đổi trả sản phẩm' : 'Exchange Item'}
                  </div>
                  <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {isVi ? 'Đổi sang sản phẩm / quy cách mới' : 'Exchange for a new item/size'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {order.items.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
                {isVi ? 'Chọn sản phẩm cần đổi trả / hoàn hàng' : 'Select item(s) to return'}
              </label>
              <div className="space-y-2">
                {order.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSelectedProductIdx(-1)}
                    className="w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between gap-2 cursor-pointer"
                    style={{
                      backgroundColor:
                        selectedProductIdx === -1 ? 'var(--surface-2)' : 'var(--bg)',
                      borderColor:
                        selectedProductIdx === -1 ? 'var(--primary)' : 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <span>
                      {isVi
                        ? `Toàn bộ đơn hàng (${order.items.length} sản phẩm)`
                        : `Entire order (${order.items.length} items)`}
                    </span>
                    <span style={{ color: 'var(--primary)' }}>
                      {formatVnd(order.totalAmount)}
                    </span>
                  </button>
                )}
                {order.items.map((item, idx) => {
                  const active =
                    order.items.length === 1
                      ? true
                      : idx === selectedProductIdx;
                  return (
                    <button
                      key={`${item.productName}-${idx}`}
                      type="button"
                      onClick={() => setSelectedProductIdx(idx)}
                      className="w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between gap-2 cursor-pointer"
                      style={{
                        backgroundColor: active ? 'var(--surface-2)' : 'var(--bg)',
                        borderColor: active ? 'var(--primary)' : 'var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      <span>
                        {item.productName}{' '}
                        {item.selectedSpec ? `(${item.selectedSpec})` : ''} × {item.quantity}
                      </span>
                      <span style={{ color: 'var(--primary)' }}>
                        {formatVnd(item.price * item.quantity)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
              {isVi ? 'Lý do đổi trả / hoàn hàng *' : 'Reason for return *'}
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
                    className="px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer"
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

          <div className="space-y-1.5">
            <label className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
              {isVi ? 'Mô tả chi tiết tình trạng' : 'Additional details'}
            </label>
            <textarea
              rows={3}
              data-testid="return-reason-textarea"
              value={reasonNote}
              onChange={(e) => {
                setReasonNote(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                isVi
                  ? 'Mô tả tình trạng bao bì, sản phẩm muốn đổi hoặc thông tin nhận tiền hoàn...'
                  : 'Describe item condition, exchange preference, or refund details...'
              }
              className="form-input w-full text-sm resize-none"
            />
            {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
          </div>

          <div
            className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              {requestType === 'exchange'
                ? isVi
                  ? 'Giá trị sản phẩm đổi trả:'
                  : 'Exchange item value:'
                : isVi
                ? 'Số tiền hoàn dự kiến:'
                : 'Estimated refund:'}
            </span>
            <span className="text-sm font-extrabold" style={{ color: 'var(--primary)' }}>
              {formatVnd(Math.min(maxRefund, order.totalAmount))}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary min-h-[42px] px-5 py-2 text-xs font-bold cursor-pointer"
            >
              {isVi ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              data-testid="submit-return-refund-btn"
              className="btn-primary min-h-[42px] px-6 py-2 text-xs font-bold cursor-pointer"
            >
              {requestType === 'exchange'
                ? isVi
                  ? 'Gửi yêu cầu đổi trả'
                  : 'Submit exchange request'
                : isVi
                ? 'Gửi yêu cầu hoàn hàng / hoàn tiền'
                : 'Submit return request'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
