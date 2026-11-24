import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Language, UserAccount } from '@/types/animora.type';
import { translations } from '@/data/translations';
import { devGetSessionInfoAction, devLogoutAction } from '@/actions/auth.action';
import { ROUTES } from '@/constants/config.constant';
import { getMeUser, logoutUser } from '@/services/animora/authApi';
import { mapBackendUserToAccount } from '@/components/auth/shared/authFlowHelpers';
import {
  safeGetStorage,
  safeRemoveStorage,
  safeSetStorage,
} from '@/utils/cartLogic';
import { ToastOptions } from './useAnimoraPreferences';

function mapSessionRoleToAccountRole(
  role: string,
  expertType?: string
): UserAccount['role'] {
  switch (role) {
    case 'admin':
      return 'admin';
    case 'manager':
      return 'manager';
    case 'expert':
      return expertType === 'vet' ? 'vet' : 'care_staff';
    case 'supplier':
      return 'supplier';
    case 'receptionist':
      return 'receptionist';
    default:
      return 'owner';
  }
}

const PORTAL_BY_ACCOUNT_ROLE: Record<UserAccount['role'], string> = {
  admin: ROUTES.ADMIN,
  manager: ROUTES.MANAGER,
  vet: ROUTES.EXPERT,
  care_staff: ROUTES.EXPERT,
  supplier: '/supplier',
  receptionist: '/receptionist',
  owner: ROUTES.HOME,
};

export const DEFAULT_DEMO_USER: UserAccount = {
  id: 'user-demo-owner',
  fullName: 'Phan Thị Đinh Thùy',
  email: 'phanthidinhthuy6@gmail.com',
  phone: '0337203332',
  passwordHash: '123456',
  role: 'owner',
  createdAt: '2026-01-15',
  addresses: [
    {
      id: 'addr-demo-1',
      label: 'Nhà riêng',
      recipientName: 'Phan Thị Đinh Thùy',
      phone: '0337203332',
      addressLine: '128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      isDefault: true,
    },
  ],
};

export const SECONDARY_DEMO_USER: UserAccount = {
  id: 'user-demo-owner',
  fullName: 'Nguyễn Minh Anh',
  email: 'minhanh@animora.vn',
  phone: '0901234567',
  passwordHash: '123456',
  role: 'owner',
  createdAt: '2026-01-15',
  addresses: [],
};

interface UseAnimoraAuthParams {
  lang: Language;
  isStorageHydrated: boolean;
  addToast: (text: string, options?: ToastOptions) => void;
}

/**
 * Manages registered demo users, currentUser persistence,
 * HttpOnly session cookie synchronization, and auth actions.
 */
export function useAnimoraAuth({
  lang,
  isStorageHydrated,
  addToast,
}: UseAnimoraAuthParams) {
  const router = useRouter();
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([
    DEFAULT_DEMO_USER,
    SECONDARY_DEMO_USER,
  ]);
  const isInitialMountUserRef = useRef(true);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const hydrateAuthFromStorage = useCallback(() => {
    setRegisteredUsers(
      safeGetStorage<UserAccount[]>('animora_users_v2', [
        DEFAULT_DEMO_USER,
        SECONDARY_DEMO_USER,
      ])
    );
    const saved = safeGetStorage<UserAccount | null>('animora_current_user', null);
    if (saved) {
      setCurrentUser(saved);
    }
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('animora_users_v2', registeredUsers);
  }, [registeredUsers, isStorageHydrated]);

  useEffect(() => {
    if (isInitialMountUserRef.current) {
      isInitialMountUserRef.current = false;
      return;
    }
    if (currentUser) {
      safeSetStorage('animora_current_user', currentUser);
    } else {
      safeRemoveStorage('animora_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    let isCancelled = false;
    const syncWithSession = async () => {
      try {
        const session = await devGetSessionInfoAction();
        if (isCancelled) return;
        if (session.isLoggedIn && session.role !== 'guest') {
          const mappedRole: UserAccount['role'] = mapSessionRoleToAccountRole(
            session.role,
            session.expertType
          );
          const mappedId = session.id
            ? String(session.id)
            : mappedRole === 'admin'
            ? 'admin-root'
            : mappedRole === 'manager'
            ? 'manager-root'
            : mappedRole === 'vet'
            ? 'exp-vet-01'
            : mappedRole === 'care_staff'
            ? 'exp-spa-01'
            : mappedRole === 'supplier'
            ? 'sup-01'
            : mappedRole === 'receptionist'
            ? 'rec-01'
            : 'user-demo';
          const syncedUser: UserAccount = {
            id: mappedId,
            fullName:
              session.fullName ||
              (mappedRole === 'admin'
                ? 'Animora Administrator'
                : mappedRole === 'manager'
                ? 'Animora Manager'
                : mappedRole === 'vet'
                ? 'Bác sĩ Thú y Animora'
                : 'Animora User'),
            email:
              session.email ||
              (mappedRole === 'admin'
                ? 'admin@animora.vn'
                : mappedRole === 'manager'
                ? 'manager@animora.vn'
                : 'user@animora.vn'),
            phone: '0900000000',
            passwordHash: '123456',
            role: mappedRole,
            createdAt: '2026-01-01',
            addresses: [],
          };
          setCurrentUser(syncedUser);
          safeSetStorage('animora_current_user', syncedUser);
          return;
        }

        // Fallback qua apiClient (tự động xử lý 410 GONE refresh token khi accessToken hết hạn)
        try {
          const me = await getMeUser();
          if (isCancelled) return;
          if (me) {
            const syncedUser = mapBackendUserToAccount(me);
            setCurrentUser(syncedUser);
            safeSetStorage('animora_current_user', syncedUser);
            return;
          }
        } catch {
          // Chưa đăng nhập hoặc Backend offline
        }

        const saved = safeGetStorage<UserAccount | null>(
          'animora_current_user',
          null
        );
        if (!saved) {
          setCurrentUser(null);
        }
      } catch {
        // Fallback
      }
    };

    syncWithSession();
    window.addEventListener('animora_user_sync', syncWithSession);
    return () => {
      isCancelled = true;
      window.removeEventListener('animora_user_sync', syncWithSession);
    };
  }, []);

  const redirectAfterAuth = useCallback(
    (user: UserAccount) => {
      router.refresh();
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const continueParam = params.get('continue');
      const safeContinue =
        continueParam &&
        continueParam.startsWith('/') &&
        !continueParam.startsWith('//')
          ? continueParam
          : null;

      if (user.role !== 'owner') {
        const target =
          safeContinue || PORTAL_BY_ACCOUNT_ROLE[user.role] || ROUTES.HOME;
        if (window.location.pathname !== target) {
          router.push(target);
        }
        return;
      }

      const isAuthPage =
        window.location.pathname === ROUTES.LOGIN ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/dang-ky';
      if (isAuthPage) {
        router.push(safeContinue || ROUTES.HOME);
      }
    },
    [router]
  );

  const handleUniversalLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Backend có thể đang offline hoặc đang ở Dev Mode
    }
    try {
      await devLogoutAction();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    safeRemoveStorage('animora_current_user');
    window.dispatchEvent(new Event('animora_user_sync'));
    addToast(translations[lang].loginModal.logoutToast);
    router.refresh();
  }, [addToast, lang, router]);

  const handleLoginSuccess = useCallback(
    (user: UserAccount) => {
      setCurrentUser(user);
      addToast(
        lang === 'vi'
          ? `Chào mừng ${user.fullName} đã đăng nhập thành công!`
          : `Welcome back ${user.fullName}, logged in successfully!`
      );
      redirectAfterAuth(user);
    },
    [addToast, lang, redirectAfterAuth]
  );

  const handleRegisterSuccess = useCallback(
    (newUser: UserAccount, deduplicate = false) => {
      setRegisteredUsers((prev) => {
        if (deduplicate && prev.some((u) => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
      setCurrentUser(newUser);
      addToast(
        lang === 'vi'
          ? `Đăng ký thành công! Chào mừng ${newUser.fullName} đến với Animora.`
          : `Account created! Welcome ${newUser.fullName} to Animora.`
      );
      redirectAfterAuth(newUser);
    },
    [addToast, lang, redirectAfterAuth]
  );

  const handleUpdateUser = useCallback(
    (updatedUser: UserAccount, showToast = true) => {
      setCurrentUser(updatedUser);
      setRegisteredUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      if (showToast) {
        addToast(
          lang === 'vi'
            ? 'Đã cập nhật thông tin tài khoản thành công!'
            : 'Account profile updated successfully!'
        );
      }
    },
    [addToast, lang]
  );

  const handleResetPasswordSuccess = useCallback(
    (identifier: string, newPassword: string, showToast = true) => {
      const cleanId = identifier.toLowerCase();
      setRegisteredUsers((prev) =>
        prev.map((u) =>
          u.email.toLowerCase() === cleanId || u.phone === cleanId
            ? { ...u, passwordHash: newPassword }
            : u
        )
      );
      if (showToast) {
        addToast(
          lang === 'vi'
            ? 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.'
            : 'Password reset successfully! You can log in now.'
        );
      }
    },
    [addToast, lang]
  );

  return {
    registeredUsers,
    currentUser,
    hydrateAuthFromStorage,
    handleUniversalLogout,
    handleLoginSuccess,
    handleRegisterSuccess,
    handleUpdateUser,
    handleResetPasswordSuccess,
  };
}
