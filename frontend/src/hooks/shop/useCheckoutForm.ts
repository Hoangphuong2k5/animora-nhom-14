import { useEffect, useState } from 'react';
import { CartItem, Language, Product, ShippingAddress, UserAccount } from '@/types';
import {
  calculateCartSummary,
  validateCartForCheckout,
  validateCouponCode,
} from '@/utils/cartLogic';
import { canUseVoucherRole } from '@/utils/voucherSync';

export interface SubmittedOrderInfo {
  orderCode: string;
  recipientName: string;
  phone: string;
  address: string;
  paymentMethod: 'cod' | 'bank';
  note: string;
  total: number;
  itemsCount: number;
}

export interface CheckoutFormErrors {
  recipientName?: string;
  phone?: string;
  address?: string;
}

interface UseCheckoutFormParams {
  lang: Language;
  cart: CartItem[];
  isCartHydrated: boolean;
  products: Product[];
  currentUser: UserAccount | null;
  appliedCoupon: string;
  orderNote: string;
  onReturnToCartWithNotice: (notice: string) => void;
  onClearInvalidCoupon?: () => void;
  onCompleteOrder: (orderDetails: {
    orderCode: string;
    recipientName: string;
    phone: string;
    address: string;
    paymentMethod: 'cod' | 'bank';
    note: string;
    total: number;
  }) => void;
}

/**
 * Manages checkout form state, cart/price re-validation on mount and submit,
 * and order submission.
 */
export function useCheckoutForm({
  lang,
  cart,
  isCartHydrated,
  products,
  currentUser,
  appliedCoupon,
  orderNote,
  onReturnToCartWithNotice,
  onClearInvalidCoupon,
  onCompleteOrder,
}: UseCheckoutFormParams) {
  const defaultAddressObj =
    currentUser?.addresses?.find((a) => a.isDefault) ||
    currentUser?.addresses?.[0] ||
    null;

  const [selectedAddressIdDraft, setSelectedAddressIdDraft] = useState<string | null>(
    null
  );
  const [recipientNameDraft, setRecipientNameDraft] = useState<string | null>(null);
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState<string | null>(null);

  const selectedAddressId =
    selectedAddressIdDraft ?? defaultAddressObj?.id ?? null;
  const recipientName =
    recipientNameDraft ??
    defaultAddressObj?.recipientName ??
    currentUser?.fullName ??
    '';
  const phone =
    phoneDraft ?? defaultAddressObj?.phone ?? currentUser?.phone ?? '';
  const address = addressDraft ?? defaultAddressObj?.addressLine ?? '';

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod');
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrderInfo | null>(
    null
  );

  useEffect(() => {
    if (!isCartHydrated || submittedOrder) return;

    if (cart.length === 0) {
      onReturnToCartWithNotice(
        lang === 'vi' ? 'Giỏ hàng đang trống' : 'Your cart is empty'
      );
      return;
    }

    const validation = validateCartForCheckout(cart, products);
    if (!validation.isValid) {
      const msg =
        lang === 'vi'
          ? validation.blockingMessageVi ||
            'Giỏ hàng có thay đổi về giá hoặc tồn kho. Vui lòng kiểm tra lại.'
          : validation.blockingMessageEn ||
            'Cart prices or stock have changed. Please review your cart.';
      onReturnToCartWithNotice(msg);
      return;
    }

    if (appliedCoupon) {
      const subtotalOnly = calculateCartSummary(cart, '', products).subtotal;
      const couponCheck = validateCouponCode(appliedCoupon, subtotalOnly, lang, {
        currentUser,
        scope: 'shop',
      });
      if (!couponCheck.valid) {
        onClearInvalidCoupon?.();
        onReturnToCartWithNotice(
          couponCheck.errorMessage ||
            (lang === 'vi'
              ? 'Mã voucher không còn hiệu lực. Vui lòng kiểm tra lại giỏ hàng.'
              : 'Your voucher is no longer valid. Please review your cart.')
        );
      }
    }
  }, [
    appliedCoupon,
    cart,
    currentUser,
    isCartHydrated,
    lang,
    onClearInvalidCoupon,
    onReturnToCartWithNotice,
    products,
    submittedOrder,
  ]);

  const summary = calculateCartSummary(cart, appliedCoupon, products, {
    currentUser,
  });

  const setRecipientName = (value: string) => {
    setRecipientNameDraft(value);
    if (errors.recipientName) {
      setErrors((prev) => ({ ...prev, recipientName: undefined }));
    }
  };

  const setPhone = (value: string) => {
    setPhoneDraft(value);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const setAddress = (value: string) => {
    setAddressDraft(value);
    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: undefined }));
    }
  };

  const applySavedAddress = (saved: ShippingAddress) => {
    setSelectedAddressIdDraft(saved.id);
    setRecipientNameDraft(saved.recipientName);
    setPhoneDraft(saved.phone);
    setAddressDraft(saved.addressLine);
    setErrors({});
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      onReturnToCartWithNotice(
        lang === 'vi' ? 'Giỏ hàng đang trống' : 'Your cart is empty'
      );
      return;
    }

    const validation = validateCartForCheckout(cart, products);
    if (!validation.isValid) {
      const msg =
        lang === 'vi'
          ? validation.blockingMessageVi ||
            'Giỏ hàng có thay đổi về giá hoặc tồn kho. Vui lòng kiểm tra lại.'
          : validation.blockingMessageEn ||
            'Cart prices or stock have changed. Please review your cart.';
      onReturnToCartWithNotice(msg);
      return;
    }

    if (!canUseVoucherRole(currentUser)) {
      onReturnToCartWithNotice(
        lang === 'vi'
          ? 'Chỉ tài khoản Khách hàng mới được phép đặt đơn Shop hoặc sử dụng voucher.'
          : 'Only Customer accounts can place Shop orders or use vouchers.'
      );
      return;
    }

    if (appliedCoupon) {
      const subtotalOnly = calculateCartSummary(cart, '', products).subtotal;
      const couponCheck = validateCouponCode(appliedCoupon, subtotalOnly, lang, {
        currentUser,
        scope: 'shop',
      });
      if (!couponCheck.valid) {
        onClearInvalidCoupon?.();
        onReturnToCartWithNotice(
          couponCheck.errorMessage ||
            (lang === 'vi'
              ? 'Mã voucher không còn hiệu lực. Vui lòng kiểm tra lại giỏ hàng.'
              : 'Your voucher is no longer valid. Please review your cart.')
        );
        return;
      }
    }

    const nextErrors: CheckoutFormErrors = {};

    if (!recipientName.trim()) {
      nextErrors.recipientName =
        lang === 'vi'
          ? 'Vui lòng nhập họ tên người nhận'
          : 'Please enter recipient name';
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 11) {
      nextErrors.phone =
        lang === 'vi'
          ? 'Vui lòng nhập số điện thoại hợp lệ (10 chữ số)'
          : 'Please enter a valid phone number';
    }
    if (!address.trim()) {
      nextErrors.address =
        lang === 'vi'
          ? 'Vui lòng nhập địa chỉ nhận hàng'
          : 'Please enter shipping address';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const orderCode = `DH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderInfo: SubmittedOrderInfo = {
      orderCode,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod,
      note: orderNote.trim(),
      total: summary.total,
      itemsCount: summary.totalQuantity,
    };

    setSubmittedOrder(orderInfo);
    onCompleteOrder(orderInfo);
  };

  return {
    selectedAddressId,
    recipientName,
    phone,
    address,
    paymentMethod,
    errors,
    submittedOrder,
    summary,
    setRecipientName,
    setPhone,
    setAddress,
    applySavedAddress,
    setPaymentMethod,
    handleSubmitOrder,
  };
}

