import React from 'react';
import { Bookmark, ShoppingBag } from 'lucide-react';
import { CartItem, Language, Product } from '@/types';
import {
  formatVnd,
  getCartItemKey,
  resolveProductSpecDetails,
} from '@/utils/cartLogic';
import { handleSpaLinkClick } from '@/utils/spaNavigation';

interface SavedForLaterSectionProps {
  lang: Language;
  savedForLater: CartItem[];
  products: Product[];
  onMoveSavedToCart: (item: CartItem) => void;
  onRemoveSavedItem: (itemKey: string) => void;
  onNavigateUrl: (path: string) => void;
}

export const SavedForLaterSection = ({
  lang,
  savedForLater,
  products,
  onMoveSavedToCart,
  onRemoveSavedItem,
  onNavigateUrl,
}: SavedForLaterSectionProps) => {
  if (savedForLater.length === 0) return null;

  return (
    <section
      data-testid="saved-for-later-section"
      aria-labelledby="saved-for-later-heading"
      className="rounded-[24px] border p-5 sm:p-6 space-y-4"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          <h2
            id="saved-for-later-heading"
            className="font-heading text-xl font-bold"
            style={{ color: 'var(--primary)' }}
          >
            {lang === 'vi'
              ? `Đã lưu để mua sau (${savedForLater.length})`
              : `Saved for later (${savedForLater.length})`}
          </h2>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {savedForLater.map((item) => {
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
          const productSlug =
            item.product.slug || catalogProd.slug || item.productId;
          const isOutOfStock = resolved.stock <= 0;

          return (
            <div
              key={itemKey}
              data-testid={`saved-item-${item.productId}`}
              className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <a
                  href={`/cua-hang/${productSlug}`}
                  onClick={(e) =>
                    handleSpaLinkClick(e, `/cua-hang/${productSlug}`, onNavigateUrl)
                  }
                  className="w-18 h-18 rounded-2xl border p-2 shrink-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
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
                    className="w-full h-full object-contain"
                  />
                </a>
                <div className="min-w-0 space-y-1">
                  <a
                    href={`/cua-hang/${productSlug}`}
                    onClick={(e) =>
                      handleSpaLinkClick(e, `/cua-hang/${productSlug}`, onNavigateUrl)
                    }
                    className="font-heading text-base font-bold line-clamp-2 hover:underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-sm"
                    style={{ color: 'var(--text)' }}
                  >
                    {displayName}
                  </a>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {resolved.displaySpec}
                  </p>
                  <p
                    className="text-sm font-extrabold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {formatVnd(resolved.unitPrice)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  data-testid={`move-to-cart-${item.productId}`}
                  onClick={() => onMoveSavedToCart(item)}
                  className="btn-secondary min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {lang === 'vi' ? 'Chuyển vào giỏ' : 'Move to cart'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveSavedItem(itemKey)}
                  aria-label={
                    lang === 'vi'
                      ? `Xóa ${displayName} khỏi danh sách đã lưu`
                      : `Remove ${displayName} from saved list`
                  }
                  className="min-h-[44px] px-3 py-2 rounded-full text-xs font-bold transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Xóa' : 'Remove'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

