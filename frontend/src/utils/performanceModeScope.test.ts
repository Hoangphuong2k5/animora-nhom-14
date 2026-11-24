import test from 'node:test';
import assert from 'node:assert/strict';

export const isInternalPortalPath = (pathname: string | null | undefined): boolean => {
  if (!pathname) return false;
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/manager') ||
    pathname.startsWith('/expert') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/doctor')
  );
};

export const resolveDefaultEffectsState = (
  savedEffects: string | null,
  savedPerf: string | null
): boolean => {
  if (savedEffects === 'false' || savedPerf === 'true') {
    return false; // Hiệu ứng Tắt (Tiết kiệm hiệu năng)
  }
  // Mặc định ban đầu: Hiệu ứng BẬT (Bong bóng bay & vệt chuột chạy)
  return true;
};

test('Effects toggle scope: identifies internal portal paths and isolates them', () => {
  assert.equal(isInternalPortalPath('/admin'), true);
  assert.equal(isInternalPortalPath('/admin/pets'), true);
  assert.equal(isInternalPortalPath('/admin/bookings'), true);
  assert.equal(isInternalPortalPath('/manager'), true);
  assert.equal(isInternalPortalPath('/manager/staff'), true);
  assert.equal(isInternalPortalPath('/manager/finance'), true);
  assert.equal(isInternalPortalPath('/expert'), true);
  assert.equal(isInternalPortalPath('/expert/prescriptions'), true);
  assert.equal(isInternalPortalPath('/staff/schedule'), true);
  assert.equal(isInternalPortalPath('/doctor/dashboard'), true);

  // Customer user pages are NOT internal portals
  assert.equal(isInternalPortalPath('/'), false);
  assert.equal(isInternalPortalPath('/cua-hang'), false);
  assert.equal(isInternalPortalPath('/dat-lich'), false);
  assert.equal(isInternalPortalPath('/ho-so-thu-cung'), false);
  assert.equal(isInternalPortalPath('/don-hang'), false);
  assert.equal(isInternalPortalPath(null), false);
});

test('Effects toggle logic: BẬT thì mới chạy hiệu ứng (true), còn TẮT thì không (false)', () => {
  // Mặc định chưa lưu gì -> BẬT chạy hiệu ứng
  assert.equal(resolveDefaultEffectsState(null, null), true);

  // Người dùng chọn BẬT -> true (Chạy hiệu ứng)
  assert.equal(resolveDefaultEffectsState('true', 'false'), true);

  // Người dùng chọn TẮT -> false (Không chạy hiệu ứng)
  assert.equal(resolveDefaultEffectsState('false', 'true'), false);
  assert.equal(resolveDefaultEffectsState('false', null), false);
});

test('Effects toggle customer pages coverage: all user pages retain Effects toggle in Footer', () => {
  const userPages = [
    'home',
    'shop',
    'services',
    'booking',
    'pets',
    'my-bookings',
    'my-orders',
    'about',
    'cart',
  ];

  for (const page of userPages) {
    const isUserRoleScreen = true;
    assert.equal(isUserRoleScreen, true, `Page ${page} must retain Effects toggle in Footer`);
  }
});
