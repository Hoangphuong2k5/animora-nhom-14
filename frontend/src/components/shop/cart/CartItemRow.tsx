import React from 'react';
import {
  AlertTriangle,
  Bookmark,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react';
import { CartItem, Language, Product } from '@/types';
import {
  CartItemValidation,
  formatVnd,
  getCartItemKey,
  resolveProductSpecDetails,
} from '@/utils/cartLogic';
import { handleSpaLinkClick } from '@/utils/spaNavigation';

interface CartItemRowProps {
  lang: Language;
  item: CartItem;
  products: Product[];
  validation?: CartItemValidation;
  isSpecOpen: boolean;
  errorTextColor: string;
  errorBgColor: string;
  errorBorderColor: string;
  onToggleSpecSelector: (itemKey: string) => void;
  onCloseSpecSelector: () => void;
  onChangeSpec: (itemKey: string, newSpecVi: string) => void;
  onUpdateQuantity: (itemKey: string, delta: number) => void;
  onSaveForLater: (item: CartItem) => void;
  onRemoveItemWithUndo: (item: CartItem) => void;
  onAcceptPriceChange: (itemKey: string) => void;
  onAnnounceQuantity: (msg: string) => void;
  onNavigateUrl: (path: string) => void;
}

export const CartItemRow = ({
  lang,
  item,
  products,
  validation,
  isSpecOpen,
  errorTextColor,
  errorBgColor,
  errorBorderColor,
  onToggleSpecSelector,
  onCloseSpecSelector,
  onChangeSpec,
  onUpdateQuantity,
  onSaveForLater,
  onRemoveItemWithUndo,
  onAcceptPriceChange,
  onAnnounceQuantity,
  onNavigateUrl,
}: CartItemRowProps) => {
  const catalogProd =
    products.find((p) => p.id === item.productId) || item.product;
  const resolved = resolveProductSpecDetails(
    catalogProd,
    item.selectedSpec,
    lang
  );
  const itemKey = getCartItemKey(item.productId, item.selectedSpec);

  const displayName =
    lang === 'en' && item.product.nameEn
      ? item.product.nameEn
      : item.product.name;
  const productSlug = item.product.slug || catalogProd.slug || item.productId;
  const unitPrice = item.unitPriceAtAdd ?? item.product.price;
  const oldPrice = resolved.oldPrice;
  const lineTotal = unitPrice * item.quantity;
  const hasMultipleSpecs = (resolved.specOptions?.length || 0) > 1;
  const maxStock = validation && validation.stock > 0 ? validation.stock : 25;

  return (
    <div
      data-testid={`cart-row-${item.productId}`}
      className="py-5 first:pt-1 last:pb-1 space-y-3"
    >
      {validation?.isOutOfStock && (
        <div
          role="alert"
          data-testid={`row-out-of-stock-${item.productId}`}
          className="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-bold"
          style={{
            backgroundColor: errorBgColor,
            borderColor: errorBorderColor,
            color: errorTextColor,
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {lang === 'vi'
                ? 'Sản phẩm đã hết hàng'
                : 'This item is out of stock'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemoveItemWithUndo(item)}
            className="px-3 py-1 rounded-full text-xs font-extrabold underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
          >
            {lang === 'vi' ? 'Xóa khỏi giỏ' : 'Remove item'}
          </button>
        </div>
      )}

      {!validation?.isOutOfStock && validation?.hasPriceChanged && (
        <div
          role="alert"
          data-testid={`row-price-changed-${item.productId}`}
          className="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-bold"
          style={{
            backgroundColor: errorBgColor,
            borderColor: errorBorderColor,
            color: errorTextColor,
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {lang === 'vi'
                ? `Giá đã thay đổi từ ${formatVnd(validation.oldRecordedPrice)} thành ${formatVnd(validation.newCatalogPrice)}`
                : `Price changed from ${formatVnd(validation.oldRecordedPrice)} to ${formatVnd(validation.newCatalogPrice)}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid={`accept-price-${item.productId}`}
              onClick={() => onAcceptPriceChange(itemKey)}
              className="px-3 py-1.5 rounded-full text-xs font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
            >
              {lang === 'vi' ? 'Chấp nhận giá mới' : 'Accept new price'}
            </button>
            <button
              type="button"
              onClick={() => onRemoveItemWithUndo(item)}
              className="px-2.5 py-1 rounded-full text-xs font-bold underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
            >
              {lang === 'vi' ? 'Xóa' : 'Remove'}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 items-start">
        <a
          href={`/cua-hang/${productSlug}`}
          onClick={(e) =>
            handleSpaLinkClick(e, `/cua-hang/${productSlug}`, onNavigateUrl)
          }
          className="w-[88px] h-[88px] rounded-2xl border p-2 shrink-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: 'var(--border)',
          }}
        >
          <img
            loading="lazy"
            decoding="async"
            src={item.product.image}
            alt={displayName}
            className={`w-full h-full object-contain ${
              validation?.isOutOfStock ? 'opacity-50' : ''
            }`}
            referrerPolicy="no-referrer"
          />
        </a>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <a
                href={`/cua-hang/${productSlug}`}
                onClick={(e) =>
                  handleSpaLinkClick(e, `/cua-hang/${productSlug}`, onNavigateUrl)
                }
                data-testid={`cart-item-name-${item.productId}`}
                className="font-heading text-base sm:text-lg font-bold leading-snug line-clamp-2 break-words hover:underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-sm block"
                style={{ color: 'var(--text)' }}
              >
                {displayName}
              </a>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span
                  data-testid={`cart-item-spec-${item.productId}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {resolved.displaySpec}
                </span>

                {hasMultipleSpecs && (
                  <button
                    type="button"
                    data-testid={`change-spec-toggle-${item.productId}`}
                    aria-expanded={isSpecOpen}
                    onClick={() => onToggleSpecSelector(itemKey)}
                    className="text-xs font-extrabold underline px-1.5 py-1 rounded-md focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                    style={{ color: 'var(--primary)' }}
                  >
                    {lang === 'vi' ? 'Đổi quy cách' : 'Change spec'}
                  </button>
                )}
              </div>

              {hasMultipleSpecs && isSpecOpen && (
                <div
                  data-testid={`spec-selector-panel-${item.productId}`}
                  className="pt-1.5 flex flex-wrap gap-1.5"
                >
                  {resolved.specOptions.map((opt) => {
                    const isSelected = opt.labelVi === resolved.specLabelVi;
                    const label = lang === 'en' ? opt.labelEn : opt.labelVi;
                    return (
                      <button
                        key={opt.labelVi}
                        type="button"
                        onClick={() => {
                          onChangeSpec(itemKey, opt.labelVi);
                          onCloseSpecSelector();
                        }}
                        className="min-h-[36px] px-3 py-1 rounded-full text-xs font-bold border transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--primary)'
                            : 'var(--bg)',
                          color: isSelected
                            ? 'var(--on-primary)'
                            : 'var(--text)',
                          borderColor: isSelected
                            ? 'var(--primary)'
                            : 'var(--border)',
                        }}
                      >
                        {label} · {formatVnd(opt.price)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sm:text-right shrink-0">
              <div className="flex sm:justify-end items-baseline gap-2">
                <span
                  data-testid={`cart-item-unit-price-${item.productId}`}
                  className="text-sm sm:text-base font-extrabold"
                  style={{ color: 'var(--text)' }}
                >
                  {formatVnd(unitPrice)}
                </span>
                {oldPrice && oldPrice > unitPrice && (
                  <span
                    className="text-xs line-through font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatVnd(oldPrice)}
                  </span>
                )}
              </div>
              <span
                className="text-[11px] font-medium hidden sm:block"
                style={{ color: 'var(--text-muted)' }}
              >
                {lang === 'vi' ? 'Đơn giá' : 'Unit price'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="inline-flex items-center rounded-full border"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                }}
              >
                <button
                  type="button"
                  data-testid={`qty-decrease-${item.productId}`}
                  disabled={
                    item.quantity <= 1 || Boolean(validation?.isOutOfStock)
                  }
                  onClick={() => {
                    if (item.quantity > 1) {
                      const nextQty = item.quantity - 1;
                      onUpdateQuantity(itemKey, -1);
                      onAnnounceQuantity(
                        lang === 'vi'
                          ? `Số lượng: ${nextQty}`
                          : `Quantity: ${nextQty}`
                      );
                    }
                  }}
                  aria-label={
                    lang === 'vi'
                      ? `Giảm số lượng ${displayName}`
                      : `Decrease quantity for ${displayName}`
                  }
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                  style={{ color: 'var(--text)' }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  data-testid={`qty-value-${item.productId}`}
                  className="text-sm font-extrabold min-w-[34px] text-center"
                  style={{ color: 'var(--text)' }}
                >
                  {item.quantity}
                </span>
                <button
                  type="button"
                  data-testid={`qty-increase-${item.productId}`}
                  disabled={
                    item.quantity >= maxStock || Boolean(validation?.isOutOfStock)
                  }
                  onClick={() => {
                    if (item.quantity < maxStock) {
                      const nextQty = item.quantity + 1;
                      onUpdateQuantity(itemKey, 1);
                      onAnnounceQuantity(
                        lang === 'vi'
                          ? `Số lượng: ${nextQty}`
                          : `Quantity: ${nextQty}`
                      );
                    }
                  }}
                  aria-label={
                    lang === 'vi'
                      ? `Tăng số lượng ${displayName}`
                      : `Increase quantity for ${displayName}`
                  }
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                  style={{ color: 'var(--text)' }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {validation?.isLowStock && (
                <span
                  data-testid={`low-stock-badge-${item.productId}`}
                  className="text-xs font-extrabold px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: errorBgColor,
                    borderColor: errorBorderColor,
                    color: errorTextColor,
                  }}
                >
                  {lang === 'vi'
                    ? `Chỉ còn ${validation.stock} sản phẩm`
                    : `Only ${validation.stock} left in stock`}
                </span>
              )}
            </div>

            <div className="text-right ml-auto">
              <span
                data-testid={`cart-item-line-total-${item.productId}`}
                className="font-heading text-lg sm:text-xl font-extrabold block"
                style={{ color: 'var(--primary)' }}
              >
                {formatVnd(lineTotal)}
              </span>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-4">
            <button
              type="button"
              data-testid={`save-for-later-${item.productId}`}
              onClick={() => onSaveForLater(item)}
              className="min-h-[44px] px-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold hover:underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-lg cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Lưu để mua sau' : 'Save for later'}</span>
            </button>

            <button
              type="button"
              data-testid={`remove-item-${item.productId}`}
              onClick={() => onRemoveItemWithUndo(item)}
              aria-label={
                lang === 'vi' ? 'Xóa khỏi giỏ hàng' : 'Remove from cart'
              }
              className="min-h-[44px] px-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold hover:underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-lg cursor-pointer"
              style={{ color: errorTextColor }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Xóa' : 'Remove'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

