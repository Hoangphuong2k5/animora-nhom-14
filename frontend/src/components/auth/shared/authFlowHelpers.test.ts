import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGmailUser,
  buildModalFallbackUser,
  buildRegisteredUser,
  findUserByIdentifier,
  hasKnownAccount,
} from './authFlowHelpers';
import type { UserAccount } from '@/types';

describe('authFlowHelpers', () => {
  const sampleUser: UserAccount = {
    id: 'user-1',
    fullName: 'Nguyễn Minh Anh',
    email: 'minhanh@animora.vn',
    phone: '090 123 4567',
    passwordHash: '123456',
    role: 'owner',
    createdAt: '2026-01-15',
    addresses: [],
  };

  it('finds users by email (case-insensitive) or whitespace-normalized phone', () => {
    assert.equal(findUserByIdentifier([sampleUser], 'MINHANH@animora.vn')?.id, 'user-1');
    assert.equal(findUserByIdentifier([sampleUser], '0901234567')?.id, 'user-1');
    assert.equal(findUserByIdentifier([sampleUser], 'unknown@animora.vn'), undefined);
  });

  it('recognizes known accounts including CONTACT_INFO and registeredUsers', () => {
    assert.equal(hasKnownAccount([sampleUser], 'phanthidinhthuy6@gmail.com'), true);
    assert.equal(hasKnownAccount([sampleUser], '0337 203 332'), true);
    assert.equal(hasKnownAccount([sampleUser], 'minhanh@animora.vn'), true);
    assert.equal(hasKnownAccount([sampleUser], 'nobody@example.com'), false);
  });

  it('builds Gmail OAuth user with default home address', () => {
    const user = buildGmailUser(
      { fullName: 'Lê An', email: 'LeAn@Gmail.com ', phone: '' },
      'vi'
    );
    assert.equal(user.email, 'lean@gmail.com');
    assert.equal(user.passwordHash, 'gmail-oauth-verified');
    assert.equal(user.addresses.length, 1);
    assert.equal(user.addresses[0].isDefault, true);
  });

  it('builds modal fallback user for both email and phone identifiers', () => {
    const emailUser = buildModalFallbackUser('khach@test.vn', 'khach@test.vn', 'secret123', 'en');
    assert.equal(emailUser.email, 'khach@test.vn');
    assert.equal(emailUser.fullName, 'khach');

    const phoneUser = buildModalFallbackUser('0911222333', '0911222333', 'secret123', 'vi');
    assert.equal(phoneUser.phone, '0911222333');
    assert.equal(phoneUser.email, '0911222333@animora.vn');
  });

  it('builds registered user respecting includeDefaultAddress flag', () => {
    const pageUser = buildRegisteredUser({
      fullName: 'Trần Bình',
      email: 'binh@animora.vn',
      phone: '0912345678',
      password: 'password1',
      includeDefaultAddress: false,
      lang: 'vi',
    });
    assert.equal(pageUser.addresses.length, 0);

    const modalUser = buildRegisteredUser({
      fullName: 'Trần Bình',
      email: 'binh@animora.vn',
      phone: '0912345678',
      password: 'password1',
      includeDefaultAddress: true,
      lang: 'en',
    });
    assert.equal(modalUser.addresses.length, 1);
    assert.equal(modalUser.addresses[0].label, 'Home');
  });
});
