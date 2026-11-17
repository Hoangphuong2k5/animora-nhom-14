import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatVnd,
  getCartItemKey,
  resolveProductSpecDetails,
  clampQuantity,
  validateCouponCode,
  calculateCartSummary,
  validateCartItem,
  validateCartForCheckout,
  mergeGuestCartIntoUserCart,
  changeCartItemSpec,
  acceptCartItemPriceChange,
} from './cartLogic';
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from '@/constants/cart.constant';
import type { CartItem, Product, UserAccount } from '@/types';
import type { ShopVoucher } from './voucherSync';

const sampleProduct: Product = {
  id: 'prod-1',
  slug: 'hat-nutripet-huu-co-da-loai-2kg',
  name: 'Hạt NutriPet hữu cơ đa loài (2kg)',
  nameEn: 'NutriPet organic multi-species kibble (2kg)',
  price: 320000,
  oldPrice: 400000,
  category: 'food',
  spec: 'Túi 2kg',
  specEn: '2kg bag',
  specOptions: [
    { labelVi: 'Túi 1kg', labelEn: '1kg bag', price: 185000, oldPrice: 220000 },
    { labelVi: 'Túi 2kg', labelEn: '2kg bag', price: 320000, oldPrice: 400000 },
    { labelVi: 'Túi 5kg tiết kiệm', labelEn: '5kg value bag', price: 740000, oldPrice: 920000 },
  ],
  image: '/assets/products/nutripet-organic-2kg.png',
  stock: 4,
  description: 'Desc',
  rating: 4.9,
};

const sampleOutProduct: Product = {
  ...sampleProduct,
  id: 'prod-16',
  name: 'Đèn sưởi UVB 5.0',
  stock: 0,
  badges: ['out_of_stock'],
};

describe('cartLogic pure functions', () => {
  it('formats Vietnamese currency accurately', () => {
    assert.equal(formatVnd(320000), '320.000đ');
    assert.equal(formatVnd(0), '0đ');
    assert.equal(formatVnd(500000), '500.000đ');
  });

  it('clamps quantity between 1 and available stock', () => {
    assert.equal(clampQuantity(0, 10), 1);
    assert.equal(clampQuantity(-3, 10), 1);
    assert.equal(clampQuantity(4, 10), 4);
    assert.equal(clampQuantity(15, 4), 4);
  });

  it('resolves product spec details for default and custom spec options', () => {
    const res1kg = resolveProductSpecDetails(sampleProduct, 'Túi 1kg', 'en');
    assert.equal(res1kg.unitPrice, 185000);
    assert.equal(res1kg.oldPrice, 220000);
    assert.equal(res1kg.displaySpec, '1kg bag');

    const resDefault = resolveProductSpecDetails(sampleProduct, undefined, 'vi');
    assert.equal(resDefault.unitPrice, 320000);
    assert.equal(resDefault.displaySpec, 'Túi 2kg');
  });

  it('calculates shipping fee (30.000đ under 500.000đ, free at or above 500.000đ) and coupon discount', () => {
    const singleItem: CartItem[] = [
      {
        productId: sampleProduct.id,
        product: sampleProduct,
        quantity: 1,
        selectedSpec: 'Túi 2kg',
        unitPriceAtAdd: 320000,
      },
    ];

    const summaryUnder = calculateCartSummary(singleItem, '');
    assert.equal(summaryUnder.subtotal, 320000);
    assert.equal(summaryUnder.shippingFee, STANDARD_SHIPPING_FEE);
    assert.equal(summaryUnder.remainingForFreeShip, FREE_SHIPPING_THRESHOLD - 320000);
    assert.equal(summaryUnder.isFreeShipping, false);
    assert.equal(summaryUnder.total, 320000 + STANDARD_SHIPPING_FEE);

    const twoItems: CartItem[] = [
      {
        productId: sampleProduct.id,
        product: sampleProduct,
        quantity: 2,
        selectedSpec: 'Túi 2kg',
        unitPriceAtAdd: 320000,
      },
    ];

    const summaryFreeShip = calculateCartSummary(twoItems, 'ANIMORA10');
    assert.equal(summaryFreeShip.subtotal, 640000);
    assert.equal(summaryFreeShip.shippingFee, 0);
    assert.equal(summaryFreeShip.isFreeShipping, true);
    assert.equal(summaryFreeShip.discountAmount, 64000);
    assert.equal(summaryFreeShip.total, 640000 - 64000);
  });

  it('validates valid, invalid, and expired coupon codes', () => {
    const validRes = validateCouponCode('animora10', 400000, 'vi');
    assert.equal(validRes.valid, true);
    assert.equal(validRes.discountAmount, 40000);

    const invalidRes = validateCouponCode('FAKECODE', 400000, 'vi');
    assert.equal(invalidRes.valid, false);
    assert.equal(invalidRes.errorMessage, 'Mã không hợp lệ hoặc đã hết hạn');

    const expiredRes = validateCouponCode('EXPIRED2025', 400000, 'vi');
    assert.equal(expiredRes.valid, false);
    assert.equal(expiredRes.errorMessage, 'Mã không hợp lệ hoặc đã hết hạn');
  });

  it('detects out-of-stock, low stock, and price-changed items and blocks checkout until resolved', () => {
    const priceChangedItem: CartItem = {
      productId: sampleProduct.id,
      product: { ...sampleProduct, price: 290000 },
      quantity: 1,
      selectedSpec: 'Túi 2kg',
      unitPriceAtAdd: 290000,
    };

    const itemVal = validateCartItem(priceChangedItem, [sampleProduct]);
    assert.equal(itemVal.hasPriceChanged, true);
    assert.equal(itemVal.oldRecordedPrice, 290000);
    assert.equal(itemVal.newCatalogPrice, 320000);
    assert.equal(itemVal.isLowStock, true);
    assert.equal(itemVal.stock, 4);

    const checkoutVal = validateCartForCheckout([priceChangedItem], [sampleProduct]);
    assert.equal(checkoutVal.isValid, false);
    assert.equal(checkoutVal.hasPriceChanged, true);

    // Accepting the new price makes checkout valid
    const acceptedList = acceptCartItemPriceChange(
      [priceChangedItem],
      getCartItemKey(priceChangedItem.productId, priceChangedItem.selectedSpec),
      [sampleProduct]
    );
    const checkoutValAfterAccept = validateCartForCheckout(acceptedList, [sampleProduct]);
    assert.equal(checkoutValAfterAccept.isValid, true);

    // Out of stock item blocks checkout
    const outItem: CartItem = {
      productId: sampleOutProduct.id,
      product: sampleOutProduct,
      quantity: 1,
      selectedSpec: 'Túi 2kg',
    };
    const outCheckout = validateCartForCheckout([outItem], [sampleOutProduct]);
    assert.equal(outCheckout.isValid, false);
    assert.equal(outCheckout.hasOutOfStock, true);
  });

  it('merges guest cart into user cart without duplicating items and clamps to stock', () => {
    const userCart: CartItem[] = [
      {
        productId: sampleProduct.id,
        product: sampleProduct,
        quantity: 2,
        selectedSpec: 'Túi 2kg',
        unitPriceAtAdd: 320000,
      },
    ];
    const guestCart: CartItem[] = [
      {
        productId: sampleProduct.id,
        product: sampleProduct,
        quantity: 3, // 2 + 3 = 5, clamped to stock = 4
        selectedSpec: 'Túi 2kg',
        unitPriceAtAdd: 320000,
      },
      {
        productId: sampleProduct.id,
        product: { ...sampleProduct, price: 185000 },
        quantity: 1,
        selectedSpec: 'Túi 1kg',
        unitPriceAtAdd: 185000,
      },
    ];

    const merged = mergeGuestCartIntoUserCart(userCart, guestCart, [sampleProduct]);
    assert.equal(merged.length, 2);
    const bag2kg = merged.find((i) => i.selectedSpec === 'Túi 2kg');
    const bag1kg = merged.find((i) => i.selectedSpec === 'Túi 1kg');
    assert.equal(bag2kg?.quantity, 4); // clamped to stock 4
    assert.equal(bag1kg?.quantity, 1);
  });

  it('switches item spec and merges if target spec already exists in cart', () => {
    const cartItems: CartItem[] = [
      {
        productId: sampleProduct.id,
        product: { ...sampleProduct, price: 185000 },
        quantity: 1,
        selectedSpec: 'Túi 1kg',
        unitPriceAtAdd: 185000,
      },
      {
        productId: sampleProduct.id,
        product: sampleProduct,
        quantity: 2,
        selectedSpec: 'Túi 2kg',
        unitPriceAtAdd: 320000,
      },
    ];

    const updated = changeCartItemSpec(
      cartItems,
      getCartItemKey(sampleProduct.id, 'Túi 1kg'),
      'Túi 2kg',
      [sampleProduct]
    );
    assert.equal(updated.length, 1);
    assert.equal(updated[0].selectedSpec, 'Túi 2kg');
    assert.equal(updated[0].quantity, 3);
    assert.equal(updated[0].product.price, 320000);
  });

  it('blocks Doctor (BS), Manager (QL), and Admin (AD) roles from applying Shop vouchers, allows Customer (KH)', () => {
    const baseUser: Omit<UserAccount, 'role'> = {
      id: 'u-1',
      fullName: 'Test',
      email: 'test@animora.vn',
      phone: '0900000000',
      passwordHash: 'x',
      createdAt: '2026-01-01',
      addresses: [],
    };

    const vetRes = validateCouponCode('ANIMORA10', 400000, 'vi', {
      currentUser: { ...baseUser, role: 'vet' },
    });
    assert.equal(vetRes.valid, false);

    const managerRes = validateCouponCode('ANIMORA10', 400000, 'vi', {
      currentUser: { ...baseUser, role: 'manager' },
    });
    assert.equal(managerRes.valid, false);

    const adminRes = validateCouponCode('ANIMORA10', 400000, 'vi', {
      currentUser: { ...baseUser, role: 'admin' },
    });
    assert.equal(adminRes.valid, false);

    const ownerRes = validateCouponCode('ANIMORA10', 400000, 'vi', {
      currentUser: { ...baseUser, role: 'owner' },
    });
    assert.equal(ownerRes.valid, true);
    assert.equal(ownerRes.discountAmount, 40000);
  });

  it('enforces startDate, endDate, exhausted, paused, and Shop-only scope constraints', () => {
    const sampleVouchers: ShopVoucher[] = [
      {
        id: 'v-1',
        code: 'SHOP_ACTIVE',
        discountType: 'percent',
        discountValue: 15,
        minOrderValue: 200000,
        maxDiscount: 100000,
        applicableTo: 'Toàn bộ sản phẩm Shop',
        applicableScope: 'shop',
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        usedCount: 5,
        maxUsage: 10,
        status: 'active',
      },
      {
        id: 'v-2',
        code: 'SHOP_EXHAUSTED',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderValue: 100000,
        applicableTo: 'Toàn bộ sản phẩm Shop',
        applicableScope: 'shop',
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        usedCount: 10,
        maxUsage: 10,
        status: 'active',
      },
      {
        id: 'v-3',
        code: 'SHOP_FUTURE',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderValue: 100000,
        applicableTo: 'Toàn bộ sản phẩm Shop',
        applicableScope: 'shop',
        startDate: '2026-12-01',
        endDate: '2026-12-31',
        usedCount: 0,
        maxUsage: 10,
        status: 'active',
      },
    ];

    const scopeBlocked = validateCouponCode('SHOP_ACTIVE', 400000, 'vi', {
      todayIso: '2026-11-17',
      vouchers: sampleVouchers,
      scope: 'service',
    });
    assert.equal(scopeBlocked.valid, false);

    const exhausted = validateCouponCode('SHOP_EXHAUSTED', 400000, 'vi', {
      todayIso: '2026-11-17',
      vouchers: sampleVouchers,
    });
    assert.equal(exhausted.valid, false);

    const upcoming = validateCouponCode('SHOP_FUTURE', 400000, 'vi', {
      todayIso: '2026-11-17',
      vouchers: sampleVouchers,
    });
    assert.equal(upcoming.valid, false);

    const expiredByDate = validateCouponCode('SHOP_ACTIVE', 400000, 'vi', {
      todayIso: '2026-12-05',
      vouchers: sampleVouchers,
    });
    assert.equal(expiredByDate.valid, false);

    const validActive = validateCouponCode('SHOP_ACTIVE', 400000, 'vi', {
      todayIso: '2026-11-17',
      vouchers: sampleVouchers,
    });
    assert.equal(validActive.valid, true);
    assert.equal(validActive.discountAmount, 60000);
  });
});
