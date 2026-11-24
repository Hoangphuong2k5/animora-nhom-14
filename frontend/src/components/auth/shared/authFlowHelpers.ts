import { CONTACT_INFO } from '@/constants/contact.constant';
import { Language, UserAccount } from '@/types';

/** Builds a new OAuth/Gmail user account object. */
export function buildGmailUser(
  account: { fullName: string; email: string; phone: string },
  lang: Language
): UserAccount {
  const cleanEmail = account.email.trim().toLowerCase();
  const phone = account.phone || '0337203332';
  return {
    id: 'user-gmail-' + Date.now(),
    fullName: account.fullName,
    email: cleanEmail,
    phone,
    passwordHash: 'gmail-oauth-verified',
    role: 'owner',
    createdAt: new Date().toISOString().split('T')[0],
    addresses: [
      {
        id: 'addr-gmail-' + Date.now(),
        label: lang === 'vi' ? 'Nhà riêng' : 'Home',
        recipientName: account.fullName,
        phone,
        addressLine: '128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
        isDefault: true,
      },
    ],
  };
}

/** Builds a fallback user session for valid non-registered modal logins. */
export function buildModalFallbackUser(
  cleanId: string,
  normalizedPhoneId: string,
  password: string,
  lang: Language
): UserAccount {
  const isEmail = cleanId.includes('@');
  const displayName = isEmail ? cleanId.split('@')[0] : 'Khách hàng Animora';
  const phone = isEmail ? '0901234567' : normalizedPhoneId;
  return {
    id: 'user-' + Date.now(),
    fullName: displayName,
    email: isEmail ? cleanId : `${normalizedPhoneId}@animora.vn`,
    phone,
    passwordHash: password,
    role: 'owner',
    createdAt: new Date().toISOString().split('T')[0],
    addresses: [
      {
        id: 'addr-default-1',
        label: lang === 'vi' ? 'Nhà riêng' : 'Home',
        recipientName: displayName,
        phone,
        addressLine: '128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
        isDefault: true,
      },
    ],
  };
}

/** Builds a newly registered user account. */
export function buildRegisteredUser(params: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  includeDefaultAddress: boolean;
  lang: Language;
}): UserAccount {
  return {
    id: 'user-' + Date.now(),
    fullName: params.fullName,
    email: params.email,
    phone: params.phone,
    passwordHash: params.password,
    role: 'owner',
    createdAt: new Date().toISOString().split('T')[0],
    addresses: params.includeDefaultAddress
      ? [
          {
            id: 'addr-' + Date.now(),
            label: params.lang === 'vi' ? 'Nhà riêng' : 'Home',
            recipientName: params.fullName,
            phone: params.phone,
            addressLine:
              params.lang === 'vi'
                ? '128 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh'
                : '128 Nguyen Trai St, District 1, HCMC',
            isDefault: true,
          },
        ]
      : [],
  };
}

/** Finds a registered user by email or phone (case- and whitespace-normalized). */
export function findUserByIdentifier(
  registeredUsers: UserAccount[],
  identifier: string
): UserAccount | undefined {
  const cleanId = identifier.trim().toLowerCase();
  const normalizedPhone = cleanId.replace(/\s+/g, '');
  return registeredUsers.find(
    (u) =>
      u.email.trim().toLowerCase() === cleanId ||
      u.phone.replace(/\s+/g, '') === normalizedPhone
  );
}

/** Maps a Backend user object into the Animora UI UserAccount shape. */
export function mapBackendUserToAccount(
  rawUser: unknown,
  passwordFallback = ''
): UserAccount {
  const raw = (rawUser ?? {}) as Record<string, unknown>;
  const rawRole = typeof raw.role === 'string' ? raw.role.trim().toLowerCase() : 'customer';

  const roleMap: Record<string, UserAccount['role']> = {
    customer: 'owner',
    owner: 'owner',
    doctor: 'vet',
    expert: 'vet',
    vet: 'vet',
    admin: 'admin',
    manager: 'manager',
    carestaff: 'care_staff',
    care_staff: 'care_staff',
    staff: 'care_staff',
    warehouse: 'care_staff',
    support: 'care_staff',
    supplier: 'supplier',
    receptionist: 'receptionist',
    lt: 'receptionist',
  };

  const idValue = raw.id ?? raw._id;
  const createdAtRaw = raw.createdAt ? String(raw.createdAt) : '';

  return {
    id:
      idValue !== undefined && idValue !== null && String(idValue).trim() !== ''
        ? String(idValue)
        : `user-${Date.now()}`,
    fullName:
      typeof raw.fullName === 'string' && raw.fullName
        ? raw.fullName
        : 'Animora User',
    email: typeof raw.email === 'string' ? raw.email : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    passwordHash: passwordFallback,
    role: roleMap[rawRole] ?? 'owner',
    createdAt: createdAtRaw
      ? createdAtRaw.split('T')[0]
      : new Date().toISOString().split('T')[0],
    addresses: Array.isArray(raw.addresses) ? raw.addresses : [],
  };
}

/** Checks if identifier belongs to any known account (CONTACT_INFO or registeredUsers). */
export function hasKnownAccount(
  registeredUsers: UserAccount[],
  identifier: string
): boolean {
  const cleanId = identifier.trim().toLowerCase();
  const normalizedPhone = cleanId.replace(/\s+/g, '');
  return (
    cleanId === CONTACT_INFO.email.toLowerCase() ||
    normalizedPhone === '0337203332' ||
    Boolean(findUserByIdentifier(registeredUsers, cleanId))
  );
}
