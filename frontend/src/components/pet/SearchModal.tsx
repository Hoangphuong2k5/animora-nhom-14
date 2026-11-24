'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import { Product, Language, PageId } from '@/types';
import { translations } from '@/data/translations';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

interface SearchModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onNavigate?: (page: PageId) => void;
}

export const SearchModal = ({
  lang,
  isOpen,
  onClose,
  products,
  onNavigate,
}: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const t = translations[lang].common;

  const trimmed = query.toLowerCase().trim();

  const matchingProducts = trimmed
    ? products.filter(
        (prod) =>
          prod.name.toLowerCase().includes(trimmed) ||
          prod.category.toLowerCase().includes(trimmed) ||
          prod.description.toLowerCase().includes(trimmed)
      )
    : [];

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleSelectPage = (page: PageId) => {
    onNavigate?.(page);
    handleClose();
  };

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title={lang === 'vi' ? 'Tìm kiếm nhanh Animora' : 'Animora Quick Search'}
      description={translations[lang].nav.searchPlaceholder}
      className="sm:max-w-xl rounded-2xl! border border-border bg-popover text-popover-foreground shadow-2xl"
    >
      <Command
        shouldFilter={false}
        className="bg-popover text-popover-foreground rounded-2xl!"
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={translations[lang].nav.searchPlaceholder}
        />

        <CommandList className="max-h-96 p-2 scrollbar-thin">
          {!trimmed ? (
            <CommandGroup
              heading={
                lang === 'vi'
                  ? 'Khám phá nhanh hệ sinh thái Animora'
                  : 'Explore Animora'
              }
            >
              <CommandItem
                value="services-booking"
                onSelect={() => handleSelectPage('services')}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer data-selected:bg-primary/8 dark:data-selected:bg-(--coral)/15"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-xl bg-primary/10 dark:bg-(--coral)/20 text-primary dark:text-(--coral) flex items-center justify-center shrink-0">
                    <CalendarCheck className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground">
                      {lang === 'vi'
                        ? 'Dịch vụ Spa, Khách sạn & Thú y'
                        : 'Spa, Hotel & Veterinary Services'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {lang === 'vi'
                        ? 'Đặt lịch chăm sóc chuyên sâu cùng chuyên gia'
                        : 'Book premium pet care appointments'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </CommandItem>

              <CommandItem
                value="pet-shop"
                onSelect={() => handleSelectPage('shop')}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer data-selected:bg-primary/8 dark:data-selected:bg-(--coral)/15"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-xl bg-primary/10 dark:bg-(--coral)/20 text-primary dark:text-(--coral) flex items-center justify-center shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground">
                      {lang === 'vi'
                        ? 'Cửa hàng vật phẩm cao cấp'
                        : 'Premium Pet Shop'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {lang === 'vi'
                        ? 'Hạt dinh dưỡng, phụ kiện, đồ chơi chính hãng'
                        : 'Nutrition, accessories & curated toys'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </CommandItem>
            </CommandGroup>
          ) : matchingProducts.length === 0 ? (
            <CommandEmpty className="py-10 text-center text-xs text-muted-foreground">
              {t.noSearchResults} &ldquo;
              <span className="font-bold text-(--coral)">{query}</span>&rdquo;
            </CommandEmpty>
          ) : (
            <>
              {matchingProducts.length > 0 && (
                <CommandGroup
                  heading={`${
                    lang === 'vi' ? 'Sản phẩm' : 'Products'
                  } (${matchingProducts.length})`}
                >
                  {matchingProducts.map((prod) => (
                    <CommandItem
                      key={prod.id}
                      value={`prod-${prod.id}-${prod.name}`}
                      onSelect={() => handleSelectPage('shop')}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer data-selected:bg-primary/8 dark:data-selected:bg-(--coral)/15"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={prod.image}
                          alt={prod.name}
                          className="size-9 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground truncate">
                            {prod.name}
                          </p>
                          <p className="price-number text-[11px] font-bold text-(--coral)">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(prod.price)}
                          </p>
                        </div>
                      </div>
                      <ShoppingBag className="size-3.5 text-muted-foreground shrink-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>

        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
          <span>
            {lang === 'vi'
              ? 'Gõ từ khóa (vd: Golden, Mèo, Hạt) • ↑↓ chọn • Enter mở'
              : 'Type keywords • ↑↓ navigate • Enter select'}
          </span>
          <span className="font-mono">ESC</span>
        </div>
      </Command>
    </CommandDialog>
  );
};
