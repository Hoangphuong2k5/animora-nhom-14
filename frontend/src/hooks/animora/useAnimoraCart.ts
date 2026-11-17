import { useState, useEffect, useCallback } from 'react';
import {
  CartItem,
  Language,
  PageId,
  Product,
  UserAccount,
} from '@/types/animora.type';
import { translations } from '@/data/translations';
import { UNDO_TOAST_DURATION_MS } from '@/constants/cart.constant';
import {
  acceptCartItemPriceChange,
  calculateCartSummary,
  changeCartItemSpec,
  clampQuantity,
  getCartItemKey,
  mergeGuestCartIntoUserCart,
  resolveProductSpecDetails,
  safeGetStorage,
  safeSetStorage,
} from '@/utils/cartLogic';
import { ToastOptions } from './useAnimoraPreferences';
import type { Prescription } from '@/types/expert.type';
import { MEDICINE_CATALOG } from '@/data/medicineCatalog';
import { SHOP_PRODUCTS } from '@/data/shopData';
import { recordPrescriptionRefillOrder } from '@/utils/clinicalSync';
import { createCustomerOrderInStorage } from '@/utils/orderSync';
import { recordVoucherUsageInStorage } from '@/utils/voucherSync';

interface UseAnimoraCartParams {
  lang: Language;
  activePage: PageId;
  products: Product[];
  currentUser: UserAccount | null;
  isStorageHydrated: boolean;
  onOpenCartDrawer: () => void;
  onCloseCartDrawer: () => void;
  onNavigateCustomUrl: (path: string) => void;
  addToast: (text: string, options?: ToastOptions) => void;
}

function upsertProductInCart(
  prevCart: CartItem[],
  product: Product,
  quantity: number,
  selectedSpec?: string,
  prescriptionMeta?: { prescriptionId: string; prescriptionCode: string }
): CartItem[] {
  const resolved = resolveProductSpecDetails(product, selectedSpec, 'vi');
  const maxStock = resolved.stock > 0 ? resolved.stock : 25;
  const specVi = resolved.specLabelVi;
  const targetKey = getCartItemKey(product.id, specVi);

  const existing = prevCart.find(
    (item) =>
      getCartItemKey(
        item.productId,
        resolveProductSpecDetails(product, item.selectedSpec, 'vi').specLabelVi
      ) === targetKey
  );

  if (existing) {
    return prevCart.map((item) => {
      const itemSpecVi = resolveProductSpecDetails(
        product,
        item.selectedSpec,
        'vi'
      ).specLabelVi;
      if (getCartItemKey(item.productId, itemSpecVi) === targetKey) {
        return {
          ...item,
          product: {
            ...product,
            price: resolved.unitPrice,
            oldPrice: resolved.oldPrice,
          },
          selectedSpec: specVi,
          unitPriceAtAdd: resolved.unitPrice,
          quantity: clampQuantity(item.quantity + quantity, maxStock),
          ...(prescriptionMeta ?? {}),
        };
      }
      return item;
    });
  }

  return [
    ...prevCart,
    {
      productId: product.id,
      product: {
        ...product,
        price: resolved.unitPrice,
        oldPrice: resolved.oldPrice,
      },
      quantity: clampQuantity(quantity, maxStock),
      selectedSpec: specVi,
      unitPriceAtAdd: resolved.unitPrice,
      ...(prescriptionMeta ?? {}),
    },
  ];
}

/**
 * Manages shopping cart, saved-for-later items, coupons, order notes,
 * and guest-to-user cart merging with localStorage sync.
 */
export function useAnimoraCart({
  lang,
  activePage,
  products,
  currentUser,
  isStorageHydrated,
  onOpenCartDrawer,
  onCloseCartDrawer,
  onNavigateCustomUrl,
  addToast,
}: UseAnimoraCartParams) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');
  const [cartRedirectNotice, setCartRedirectNotice] = useState<string | null>(null);

  const hydrateCartFromStorage = useCallback(() => {
    setCart(safeGetStorage<CartItem[]>('animora_cart', []));
    setSavedForLater(safeGetStorage<CartItem[]>('animora_saved_for_later', []));
    setAppliedCoupon(safeGetStorage<string>('animora_cart_coupon', ''));
    setOrderNote(safeGetStorage<string>('animora_cart_note', ''));
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('animora_cart', cart);
    if (currentUser) {
      safeSetStorage(`animora_cart_user_${currentUser.id}`, cart);
    }
  }, [cart, currentUser, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('animora_saved_for_later', savedForLater);
  }, [savedForLater, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('animora_cart_coupon', appliedCoupon);
  }, [appliedCoupon, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('animora_cart_note', orderNote);
  }, [orderNote, isStorageHydrated]);

  const handleMergeCartOnUserLogin = useCallback(
    (user: UserAccount) => {
      setCart((guestCart) => {
        const savedUserCart = safeGetStorage<CartItem[]>(
          `animora_cart_user_${user.id}`,
          []
        );
        const merged = mergeGuestCartIntoUserCart(
          savedUserCart,
          guestCart,
          products
        );
        safeSetStorage(`animora_cart_user_${user.id}`, merged);
        safeSetStorage('animora_cart', merged);
        return merged;
      });
    },
    [products]
  );

  const handleAddToCart = useCallback(
    (product: Product, quantity = 1, selectedSpec?: string) => {
      setCart((prev) => upsertProductInCart(prev, product, quantity, selectedSpec));
      if (activePage !== 'cart') {
        onOpenCartDrawer();
      }
      addToast(translations[lang].shop.addedToast);
    },
    [activePage, addToast, lang, onOpenCartDrawer]
  );

  const handleBuyNow = useCallback(
    (product: Product, quantity = 1, selectedSpec?: string) => {
      setCart((prev) => upsertProductInCart(prev, product, quantity, selectedSpec));
      onCloseCartDrawer();
      onNavigateCustomUrl('/thanh-toan');
    },
    [onCloseCartDrawer, onNavigateCustomUrl]
  );

  const handleUpdateCartQuantity = useCallback(
    (itemKeyOrProductId: string, delta: number) => {
      setCart((prevCart) =>
        prevCart.map((item) => {
          const key = getCartItemKey(item.productId, item.selectedSpec);
          if (key === itemKeyOrProductId || item.productId === itemKeyOrProductId) {
            const catalogProd =
              products.find((p) => p.id === item.productId) || item.product;
            const resolved = resolveProductSpecDetails(
              catalogProd,
              item.selectedSpec,
              'vi'
            );
            const maxStock = resolved.stock > 0 ? resolved.stock : 25;
            return {
              ...item,
              quantity: clampQuantity(item.quantity + delta, maxStock),
            };
          }
          return item;
        })
      );
    },
    [products]
  );

  const handleSetCartQuantity = useCallback(
    (itemKey: string, newQty: number) => {
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (getCartItemKey(item.productId, item.selectedSpec) === itemKey) {
            const catalogProd =
              products.find((p) => p.id === item.productId) || item.product;
            const resolved = resolveProductSpecDetails(
              catalogProd,
              item.selectedSpec,
              'vi'
            );
            const maxStock = resolved.stock > 0 ? resolved.stock : 25;
            return { ...item, quantity: clampQuantity(newQty, maxStock) };
          }
          return item;
        })
      );
    },
    [products]
  );

  const handleRemoveItemWithUndo = useCallback(
    (removedItem: CartItem) => {
      const removedKey = getCartItemKey(
        removedItem.productId,
        removedItem.selectedSpec
      );
      setCart((prevCart) =>
        prevCart.filter(
          (item) =>
            getCartItemKey(item.productId, item.selectedSpec) !== removedKey
        )
      );

      const displayName =
        lang === 'en' && removedItem.product.nameEn
          ? removedItem.product.nameEn
          : removedItem.product.name;

      addToast(
        lang === 'vi' ? `Đã xóa ${displayName}` : `Removed ${displayName}`,
        {
          actionLabel: lang === 'vi' ? 'Hoàn tác' : 'Undo',
          durationMs: UNDO_TOAST_DURATION_MS,
          onAction: () => {
            setCart((current) => {
              const exists = current.some(
                (i) => getCartItemKey(i.productId, i.selectedSpec) === removedKey
              );
              if (exists) {
                return current.map((i) =>
                  getCartItemKey(i.productId, i.selectedSpec) === removedKey
                    ? { ...i, quantity: i.quantity + removedItem.quantity }
                    : i
                );
              }
              return [...current, removedItem];
            });
          },
        }
      );
    },
    [addToast, lang]
  );

  const handleSaveForLater = useCallback(
    (item: CartItem) => {
      const itemKey = getCartItemKey(item.productId, item.selectedSpec);
      setCart((prev) =>
        prev.filter((i) => getCartItemKey(i.productId, i.selectedSpec) !== itemKey)
      );
      setSavedForLater((prev) => {
        if (
          prev.some((i) => getCartItemKey(i.productId, i.selectedSpec) === itemKey)
        ) {
          return prev;
        }
        return [...prev, item];
      });
      const displayName =
        lang === 'en' && item.product.nameEn
          ? item.product.nameEn
          : item.product.name;
      addToast(
        lang === 'vi'
          ? `Đã lưu "${displayName}" để mua sau.`
          : `Saved "${displayName}" for later.`
      );
    },
    [addToast, lang]
  );

  const handleMoveSavedToCart = useCallback(
    (item: CartItem) => {
      const itemKey = getCartItemKey(item.productId, item.selectedSpec);
      setSavedForLater((prev) =>
        prev.filter((i) => getCartItemKey(i.productId, i.selectedSpec) !== itemKey)
      );
      setCart((prev) => mergeGuestCartIntoUserCart(prev, [item], products));
      const displayName =
        lang === 'en' && item.product.nameEn
          ? item.product.nameEn
          : item.product.name;
      addToast(
        lang === 'vi'
          ? `Đã chuyển "${displayName}" vào giỏ hàng.`
          : `Moved "${displayName}" to cart.`
      );
    },
    [addToast, lang, products]
  );

  const handleRemoveSavedItem = useCallback((itemKey: string) => {
    setSavedForLater((prev) =>
      prev.filter((i) => getCartItemKey(i.productId, i.selectedSpec) !== itemKey)
    );
  }, []);

  const handleChangeCartItemSpec = useCallback(
    (itemKey: string, newSpecVi: string) => {
      setCart((prev) => changeCartItemSpec(prev, itemKey, newSpecVi, products));
    },
    [products]
  );

  const handleAcceptCartPriceChange = useCallback(
    (itemKey: string) => {
      setCart((prev) => acceptCartItemPriceChange(prev, itemKey, products));
    },
    [products]
  );

  const handleAddPrescriptionRefillToCart = useCallback(
    (prescription: Prescription) => {
      if (prescription.severity === 'severe') {
        addToast(
          lang === 'vi'
            ? 'Đơn bệnh nặng bắt buộc khám lại trực tiếp để có đơn thuốc mới.'
            : 'Severe prescriptions require an in-clinic revisit.'
        );
        return;
      }
      if (prescription.refillsUsed >= prescription.refillsAllowed) {
        addToast(
          lang === 'vi'
            ? 'Đơn thuốc đã hết lượt mua lại. Vui lòng đặt lịch khám mới.'
            : 'Prescription refills exhausted. Please book a new exam.'
        );
        return;
      }

      let addedCount = 0;
      setCart((prev) => {
        let next = [...prev];
        for (const line of prescription.lines) {
          const med = MEDICINE_CATALOG.find((m) => m.id === line.medicineId);
          const catalogSource = products.length > 0 ? products : SHOP_PRODUCTS;
          const shopProduct = catalogSource.find(
            (p) =>
              p.medicineId === line.medicineId ||
              (med && p.id === med.shopProductId)
          );
          if (shopProduct && (shopProduct.stock ?? 0) > 0) {
            next = upsertProductInCart(next, shopProduct, 1, shopProduct.spec, {
              prescriptionId: prescription.id,
              prescriptionCode: prescription.code,
            });
            addedCount += 1;
          }
        }
        return next;
      });

      if (addedCount > 0) {
        onOpenCartDrawer();
        addToast(
          lang === 'vi'
            ? `Đã thêm thuốc từ đơn ${prescription.code} vào giỏ hàng Shop!`
            : `Added medicines from ${prescription.code} to your Shop cart!`
        );
      } else {
        addToast(
          lang === 'vi'
            ? 'Thuốc trong đơn hiện tạm hết tồn kho tại Shop.'
            : 'Prescribed medicines are currently out of stock in the Shop.'
        );
      }
    },
    [addToast, lang, onOpenCartDrawer, products]
  );

  const handleCompleteOrder = useCallback(
    (orderDetails?: {
      orderCode?: string;
      recipientName?: string;
      phone?: string;
      address?: string;
      paymentMethod?: 'cod' | 'bank';
      note?: string;
      total?: number;
    }) => {
      const rxIds = Array.from(
        new Set(
          cart
            .map((item) => item.prescriptionId)
            .filter((id): id is string => Boolean(id))
        )
      );
      const orderCode =
        orderDetails?.orderCode || `DH-RX-${Math.floor(1000 + Math.random() * 9000)}`;

      for (const rxId of rxIds) {
        recordPrescriptionRefillOrder(rxId, orderCode);
      }

      if (cart.length > 0) {
        const orderItems = cart.map((item) => {
          const catalogProd =
            products.find((p) => p.id === item.productId) || item.product;
          const resolved = resolveProductSpecDetails(
            catalogProd,
            item.selectedSpec,
            'vi'
          );
          return {
            productId: item.productId,
            productName: item.product.name,
            selectedSpec: resolved.specLabelVi,
            quantity: item.quantity,
            price: resolved.unitPrice,
            image: item.product.image,
            prescriptionCode: item.prescriptionCode,
          };
        });
        const subtotal = orderItems.reduce(
          (sum, it) => sum + it.price * it.quantity,
          0
        );
        const cartSummary = calculateCartSummary(cart, appliedCoupon, products, {
          currentUser,
        });
        const appliedCode = cartSummary.appliedCouponCode || undefined;
        const discountAmount = cartSummary.discountAmount || 0;

        createCustomerOrderInStorage({
          id: `ord-${Date.now()}`,
          orderCode,
          userId: currentUser?.id ?? null,
          customerName:
            orderDetails?.recipientName || currentUser?.fullName || 'Khách hàng Animora',
          phone: orderDetails?.phone || currentUser?.phone || '',
          email: currentUser?.email,
          shippingAddress: orderDetails?.address || '',
          items: orderItems,
          subtotal,
          discountAmount,
          couponCode: appliedCode,
          totalAmount: orderDetails?.total ?? cartSummary.total,
          paymentMethod: orderDetails?.paymentMethod === 'bank' ? 'Banking' : 'COD',
          note: orderDetails?.note || orderNote || undefined,
          status: 'pending',
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        });

        if (appliedCode) {
          recordVoucherUsageInStorage({
            voucherCode: appliedCode,
            currentUser,
            orderCode,
            discountAmount,
          });
        }
      }

      setCart([]);
      setAppliedCoupon('');
      setOrderNote('');
      addToast(
        lang === 'vi'
          ? 'Thanh toán đơn hàng thành công! Đội ngũ Animora đang đóng gói cho bé.'
          : 'Order placed successfully! Animora team is packing your items.'
      );
    },
    [addToast, appliedCoupon, cart, currentUser, lang, orderNote, products]
  );

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cart,
    savedForLater,
    appliedCoupon,
    setAppliedCoupon,
    orderNote,
    setOrderNote,
    cartRedirectNotice,
    setCartRedirectNotice,
    totalCartCount,
    hydrateCartFromStorage,
    handleMergeCartOnUserLogin,
    handleAddToCart,
    handleBuyNow,
    handleUpdateCartQuantity,
    handleSetCartQuantity,
    handleRemoveItemWithUndo,
    handleSaveForLater,
    handleMoveSavedToCart,
    handleRemoveSavedItem,
    handleChangeCartItemSpec,
    handleAcceptCartPriceChange,
    handleAddPrescriptionRefillToCart,
    handleCompleteOrder,
  };
}

